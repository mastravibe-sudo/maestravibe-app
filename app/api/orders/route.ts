// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getSession, requireAdmin } from '@/lib/auth';
import { validateCustomerDetails, type OrderMarket } from '@/lib/order-validation';
import { getProvider } from '@/lib/payments';
import { computeTrustedTotal } from '@/lib/payments/trusted-total';
import { calculateDeliveryCharge } from '@/lib/home/delivery';
import { MARKET_CONFIG } from '@/lib/home/constants';

// GET /api/orders          → unchanged: all orders (admin views, etc.)
// GET /api/orders?mine=1   → supplier: only orders that include their items
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get('mine') === '1';

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!mine) {
      if (!(await requireAdmin())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json(data ?? []);
    }

    const session = await getSession();
    if (session?.role !== 'supplier') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const mineOrders = (data ?? []).flatMap((order: any) => {
      const items = Array.isArray(order.items)
        ? order.items.filter((item: any) => item.supplier_id === session.id)
        : [];
      if (order.supplier_id !== session.id && items.length === 0) return [];

      const customer = order.customer ?? {};
      const awaiting = order.payment_method === 'online' && order.payment_status !== 'paid';
      return [{
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        supplier_status: order.supplier_status,
        currency: order.currency ?? null,
        payment_method: order.payment_method ?? 'cod',
        payment_status: order.payment_status ?? null,
        awaiting_payment: awaiting,
        can_update: String(order.supplier_id) === String(session.id),
        tracking_number: order.tracking_number ?? null,
        courier: order.courier ?? null,
        items,
        supplier_total: items.reduce(
          (sum: number, item: any) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 1),
          0
        ),
        // Delivery details stay hidden until an online order is actually paid.
        customer: awaiting
          ? { name: customer.name, city: customer.city }
          : { name: customer.name, phone: customer.phone, city: customer.city, address: customer.address },
      }];
    });

    return NextResponse.json(mineOrders, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/orders
// - Pakistan / COD: same behaviour as before.
// - USA + paymentMethod 'online': total is recomputed on the server, order is saved
//   as payment_status 'pending', a hosted payment page is created and its URL is
//   returned as `paymentUrl`. The order is marked 'paid' ONLY by the webhook.
// NOTE: uses the admin client for the insert so public INSERT on `orders` can be
// revoked (otherwise anyone could insert an order with payment_status = 'paid').
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { customer, items, total } = body;
    const market: OrderMarket = body.market === 'us' ? 'us' : 'pk';
    const paymentMethod: 'cod' | 'online' =
      body.paymentMethod === 'online' && market === 'us' ? 'online' : 'cod';

    if (!customer || !items || total === undefined) {
      return NextResponse.json({ message: 'customer, items, and total are required' }, { status: 400 });
    }

    const validation = validateCustomerDetails(customer, market);
    if (!validation.valid) {
      return NextResponse.json({ message: 'Please correct the delivery details.', fieldErrors: validation.fieldErrors }, { status: 400 });
    }

    let orderTotal = total;
    if (paymentMethod === 'online') {
      const trusted = await computeTrustedTotal(items, market);
      if (!trusted.ok) {
        return NextResponse.json({ message: trusted.reason }, { status: 400 });
      }
      // Same delivery rule the checkout popup uses, recomputed on the server.
      const freeMin =
        parseFloat(String((MARKET_CONFIG as any)[market]?.freeDeliveryMin ?? 0).replace(/,/g, '')) || 0;
      const city = (validation.normalized as any)?.city ?? customer.city;
      const delivery = Number(calculateDeliveryCharge(market, city, trusted.total, freeMin)) || 0;
      const expected = Math.round((trusted.total + delivery) * 100) / 100;
      if (Math.abs(expected - Number(total)) > 0.01) {
        console.error('online order total mismatch', { expected, client: total });
        return NextResponse.json(
          { message: 'Prices have changed. Please refresh your cart and try again.' },
          { status: 400 }
        );
      }
      orderTotal = expected;
    }

    const insertRow: Record<string, any> = {
      customer: {
        ...validation.normalized,
        verification: {
          address: { valid: true },
          phone: { confirmed: false },
          city: { reviewed: !validation.requiresCityReview },
        },
      },
      items,
      total: orderTotal,
      status: 'pending_verification',
      market,
      currency: market === 'us' ? 'usd' : 'pkr',
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'online' ? 'pending' : 'cod',
    };

    const supplierIds = new Set(
      (items as any[]).map((it) => it.supplier_id).filter(Boolean)
    );

    if (supplierIds.size === 1) {
      const supplierId = [...supplierIds][0];

      const { data: acc } = await supabase
        .from('accounts')
        .select('commission_percent')
        .eq('id', supplierId)
        .single();

      const commissionPercent =
        acc?.commission_percent ?? Number(process.env.DEFAULT_COMMISSION_PERCENT ?? 10);

      const supplierAmount = (items as any[]).reduce(
        (sum, it) => sum + Number(it.supplier_price ?? 0) * Number(it.quantity ?? 1),
        0
      );
      const commissionAmount = supplierAmount * (commissionPercent / 100);
      const resellerProfit = Math.max(0, Number(orderTotal) - supplierAmount - commissionAmount);

      insertRow.supplier_id = supplierId;
      insertRow.supplier_amount = supplierAmount;
      insertRow.commission_amount = commissionAmount;
      insertRow.reseller_profit = resellerProfit;
      insertRow.supplier_status = 'pending';
      insertRow.supplier_paid = false;
    }

    const { data, error } = await supabase.from('orders').insert([insertRow]).select().single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    // Tracking: first timeline event (customer, supplier and admin all read the same events)
    await supabase.from('order_events').insert([
      {
        order_id: String(data.id),
        status: 'placed',
        actor: 'system',
        note: paymentMethod === 'online' ? 'Order received, waiting for online payment' : 'Order received',
      },
    ]);

    if (paymentMethod === 'online') {
      try {
        const provider = getProvider();
        const base = process.env.NEXT_PUBLIC_SITE_URL!;
        const result = await provider.createPayment({
          orderId: data.id,
          amount: Math.round(Number(orderTotal) * 100),
          currency: 'usd',
          description: `Maestra Market order ${data.id}`,
          successUrl: `${base}/payment/success?order=${data.id}`,
          cancelUrl: `${base}/payment/cancel?order=${data.id}`,
        });
        await supabase
          .from('orders')
          .update({ payment_provider: provider.name, payment_reference: result.reference })
          .eq('id', data.id);
        return NextResponse.json({ ...data, paymentUrl: result.url }, { status: 201 });
      } catch (e) {
        console.error('payment start failed', e);
        await supabase.from('orders').update({ payment_status: 'failed' }).eq('id', data.id);
        return NextResponse.json(
          { message: 'Your order was saved but the payment could not be started. Please try again or contact us.' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}