// app/api/reseller/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireReseller } from '@/lib/auth';
import { validateCustomerDetails, type OrderMarket } from '@/lib/order-validation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await requireReseller();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { items, customer } = body;
    const market: OrderMarket = body.market === 'us' ? 'us' : 'pk';
    // items: [{ productId, name, image, basePrice, resellerPrice, quantity, selectedColor, selectedSize }]

    if (!items || items.length === 0 || !customer?.name || !customer?.phone || !customer?.address) {
      return NextResponse.json(
        { message: 'Items and customer details (name, phone, address) are required' },
        { status: 400 }
      );
    }

    const validation = validateCustomerDetails(customer, market);
    if (!validation.valid) {
      return NextResponse.json({ message: 'Please correct the customer delivery details.', fieldErrors: validation.fieldErrors }, { status: 400 });
    }

    for (const item of items) {
      if (item.resellerPrice < item.basePrice) {
        return NextResponse.json(
          { message: `Your selling price for "${item.name}" cannot be less than the base price` },
          { status: 400 }
        );
      }
    }

    const total = items.reduce((s: number, i: any) => s + i.resellerPrice * i.quantity, 0);
    const baseTotal = items.reduce((s: number, i: any) => s + i.basePrice * i.quantity, 0);
    const profit = total - baseTotal;

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer: {
          ...validation.normalized,
          verification: {
            address: { valid: true },
            phone: { confirmed: false },
            city: { reviewed: !validation.requiresCityReview },
          },
        },
        items: items.map((i: any) => ({
          name: i.name,
          image: i.image,
          price: i.resellerPrice,
          quantity: i.quantity,
          selectedColor: i.selectedColor,
          selectedSize: i.selectedSize,
          productId: i.productId,
        })),
        total,
        base_total: baseTotal,
        reseller_profit: profit,
        reseller_id: session.id,
        status: 'pending_verification',
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data }, { status: 201 });
  } catch (err: unknown) {
    console.error('create-order route error:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}