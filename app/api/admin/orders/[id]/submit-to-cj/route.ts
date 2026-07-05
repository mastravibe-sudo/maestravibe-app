// app/api/admin/orders/[id]/submit-to-cj/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createCJOrder } from '@/lib/cj';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabase();
    const { data: order, error } = await supabase.from('orders').select('*').eq('id', params.id).single();
    if (error || !order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    // Har item ke liye CJ vid honi zaroori hai
    const products = [];
    for (const item of order.items) {
      const { data: product } = await supabase.from('products').select('cj_vid').eq('id', item.productId).single();
      if (!product?.cj_vid) {
        return NextResponse.json({ message: `Product "${item.name}" has no CJ product linked (missing cj_vid)` }, { status: 400 });
      }
      products.push({
        vid: product.cj_vid,
        quantity: item.quantity,
        storeLineItemId: `${order.id}-${item.productId}`,
      });
    }

    const cjResult = await createCJOrder({
      orderNumber: order.id,
      customerName: order.customer.name,
      phone: order.customer.phone,
      address: order.customer.address,
      city: order.customer.city || '',
      countryCode: 'PK', // ya order.customer.country agar wo field hai
      products,
    });

    await supabase.from('orders').update({
      cj_order_id: cjResult.orderId || cjResult.orderCode,
      cj_status: 'submitted',
    }).eq('id', order.id);

    return NextResponse.json({ success: true, cjOrder: cjResult });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : 'Failed to submit to CJ' }, { status: 500 });
  }
}