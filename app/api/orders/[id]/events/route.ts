// app/api/orders/[id]/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getSession, requireAdmin } from '@/lib/auth';
import { resolveStage } from '@/lib/order-status';

export const dynamic = 'force-dynamic';

// Admin sees every order; a supplier only sees their own orders.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (!order) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    const session = await getSession();
    if (session?.role !== 'supplier' || String(order.supplier_id) !== String(session.id))
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data: events } = await supabase
    .from('order_events').select('status,note,actor,created_at')
    .eq('order_id', String(order.id)).order('created_at', { ascending: true });

  return NextResponse.json(
    {
      stage: resolveStage(order),
      supplier_status: order.supplier_status ?? 'pending',
      courier: order.courier ?? null,
      tracking_number: order.tracking_number ?? null,
      payment_method: order.payment_method ?? 'cod',
      payment_status: order.payment_status ?? null,
      events: events ?? [],
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}