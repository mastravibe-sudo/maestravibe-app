// app/api/orders/[id]/supplier-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getSession } from '@/lib/auth';
import { SUPPLIER_STATUSES, nextSupplierStatuses } from '@/lib/order-status';

export const dynamic = 'force-dynamic';

const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

// PATCH { status, note?, trackingNumber?, courier? } - supplier moves THEIR order forward.
// Admin keeps full control through the existing app/api/orders/[id]/route.ts.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (session?.role !== 'supplier') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const status = String(body.status ?? '').toLowerCase();
  const note = clip(body.note, 300);
  const trackingNumber = clip(body.trackingNumber, 80);
  const courier = clip(body.courier, 60);
  if (!(SUPPLIER_STATUSES as readonly string[]).includes(status))
    return NextResponse.json({ message: 'Invalid status' }, { status: 400 });

  const supabase = createAdminClient();
  const { data: order } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

  if (String(order.supplier_id) !== String(session.id))
    return NextResponse.json(
      { message: 'You can only update orders that contain only your products. Mixed orders are handled by admin.' },
      { status: 403 }
    );

  if (order.payment_method === 'online' && order.payment_status !== 'paid')
    return NextResponse.json({ message: 'This order is waiting for online payment. Do not pack it yet.' }, { status: 409 });

  const current = String(order.supplier_status ?? 'pending').toLowerCase();
  if (!nextSupplierStatuses(current).includes(status as any))
    return NextResponse.json({ message: `Cannot change status from "${current}" to "${status}".` }, { status: 409 });

  const patch: Record<string, any> = { supplier_status: status };
  if (trackingNumber) patch.tracking_number = trackingNumber;
  if (courier) patch.courier = courier;

  const { error } = await supabase.from('orders').update(patch).eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  await supabase.from('order_events').insert([
    {
      order_id: String(id),
      status,
      note: note || (trackingNumber ? `Tracking: ${trackingNumber}${courier ? ` (${courier})` : ''}` : null),
      actor: 'supplier',
    },
  ]);

  return NextResponse.json({ ok: true, supplier_status: status });
}