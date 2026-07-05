// app/api/reseller/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || session.role !== 'reseller') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { items, customer } = body;
    // items: [{ productId, name, image, basePrice, resellerPrice, quantity, selectedColor, selectedSize }]

    if (!items || items.length === 0 || !customer?.name || !customer?.phone || !customer?.address) {
      return NextResponse.json({ message: 'Items and customer details are required' }, { status: 400 });
    }

    for (const item of items) {
      if (item.resellerPrice < item.basePrice) {
        return NextResponse.json({ message: `Your selling price for "${item.name}" cannot be less than the base price` }, { status: 400 });
      }
    }

    const total = items.reduce((s: number, i: any) => s + i.resellerPrice * i.quantity, 0);
    const baseTotal = items.reduce((s: number, i: any) => s + i.basePrice * i.quantity, 0);
    const profit = total - baseTotal;

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer,
        items: items.map((i: any) => ({
          name: i.name, image: i.image, price: i.resellerPrice, quantity: i.quantity,
          selectedColor: i.selectedColor, selectedSize: i.selectedSize, productId: i.productId,
        })),
        total,
        base_total: baseTotal,
        reseller_profit: profit,
        reseller_id: session.id,
        status: 'new',
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ success: true, order: data });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : 'Failed to create order' }, { status: 500 });
  }
}