// app/api/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { resolveStage } from '@/lib/order-status';

export const dynamic = 'force-dynamic';

const last10 = (v: unknown) => String(v ?? '').replace(/\D/g, '').slice(-10);

// POST { orderId, phone } -> public tracking info. Needs BOTH the order id and the phone used on the order.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const orderId = String(body.orderId ?? '').trim();
  const phone = last10(body.phone);
  const notFound = NextResponse.json({ message: 'Order not found. Check the order ID and phone number.' }, { status: 404 });
  if (!orderId || orderId.length > 64 || phone.length < 7) return notFound;

  const supabase = createAdminClient();
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
  if (error || !order) return notFound;
  if (last10(order.customer?.phone) !== phone) return notFound;

  const { data: events } = await supabase
    .from('order_events').select('status,note,actor,created_at')
    .eq('order_id', String(order.id)).order('created_at', { ascending: true });

  const list = events && events.length ? events : [{ status: 'placed', note: 'Order received', actor: 'system', created_at: order.created_at }];

  return NextResponse.json(
    {
      id: order.id,
      created_at: order.created_at,
      stage: resolveStage(order),
      courier: order.courier ?? null,
      tracking_number: order.tracking_number ?? null,
      payment_method: order.payment_method ?? 'cod',
      payment_status: order.payment_status ?? null,
      total: order.total,
      currency: order.currency ?? null,
      items: (Array.isArray(order.items) ? order.items : []).map((i: any) => ({
        name: i.name, quantity: i.quantity ?? 1, image: i.image ?? null,
      })),
      events: list,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}