// app/api/admin/orders/[id]/submit-to-cj/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';
import { createCJOrder } from '@/lib/cj';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Next.js 15 dynamic params
    const { id } = await params;

    const supabase = createAdminClient();

    // Get order
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check every product has a CJ product ID
    const products = [];

    for (const item of order.items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('cj_vid')
        .eq('id', item.productId)
        .single();

      if (productError || !product?.cj_vid) {
        return NextResponse.json(
          {
            message: `Product "${item.name}" has no CJ product linked (missing cj_vid).`,
          },
          { status: 400 }
        );
      }

      products.push({
        vid: product.cj_vid,
        quantity: item.quantity,
        storeLineItemId: `${order.id}-${item.productId}`,
      });
    }

    // Submit order to CJ
    const cjResult = await createCJOrder({
      orderNumber: order.id,
      customerName: order.customer.name,
      phone: order.customer.phone,
      address: order.customer.address,
      city: order.customer.city || '',
      countryCode: order.customer.countryCode || 'PK',
      products,
    });

    // Save CJ order info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        cj_order_id: cjResult.orderId || cjResult.orderCode,
        cj_status: 'submitted',
      })
      .eq('id', order.id);

    if (updateError) {
      return NextResponse.json(
        { message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cjOrder: cjResult,
    });
  } catch (err: unknown) {
    console.error(err);

    return NextResponse.json(
      {
        message:
          err instanceof Error
            ? err.message
            : 'Failed to submit order to CJ',
      },
      { status: 500 }
    );
  }
}