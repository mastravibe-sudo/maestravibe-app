// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createPublicClient } from '@/lib/supabase-public';
import { getSession, requireAdmin } from '@/lib/auth';
import { validateCustomerDetails, type OrderMarket } from '@/lib/order-validation';

type Session = { id: string; role: string } | null;

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

    // Order-level supplier_id covers single-supplier orders. For mixed-
    // supplier orders, items carry their own supplier_id inside the JSON —
    // filtered in-memory here since nested JSON containment queries are
    // awkward with the client used across this project.
    const mineOrders = (data ?? []).filter((o: any) =>
      o.supplier_id === session.id ||
      (Array.isArray(o.items) && o.items.some((it: any) => it.supplier_id === session.id))
    );

    return NextResponse.json(mineOrders);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/orders — unchanged for customer/checkout, PLUS: if every item in
// the order belongs to the same supplier, compute and store the order-level
// commission split. Mixed-supplier or supplier-less orders (e.g. in-house
// MaestraVibe products) get no split — supplier_id and split columns stay null.
//
// NOTE: order updates (PATCH/DELETE) live in app/api/orders/[id]/route.ts,
// not here — this file only ever creates orders and lists them.
export async function POST(req: NextRequest) {
  try {
    const supabase = createPublicClient();
    const body = await req.json();
    const { customer, items, total } = body;
    const market: OrderMarket = body.market === 'us' ? 'us' : 'pk';

    if (!customer || !items || total === undefined) {
      return NextResponse.json({ message: 'customer, items, and total are required' }, { status: 400 });
    }

    const validation = validateCustomerDetails(customer, market);
    if (!validation.valid) {
      return NextResponse.json({ message: 'Please correct the delivery details.', fieldErrors: validation.fieldErrors }, { status: 400 });
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
      total,
      status: 'pending_verification',
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
      const resellerProfit = Math.max(0, Number(total) - supplierAmount - commissionAmount);

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

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}