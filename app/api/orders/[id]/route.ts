// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getSession, requireAdmin } from '@/lib/auth';
import { getOrderVerification, type OrderMarket } from '@/lib/order-validation';

// PATCH /api/orders/[id]
// Existing admin usage (any field via OrdersManager) is unchanged.
// NEW: if the update touches supplier_status or supplier_paid, only that
// order's own supplier (or an admin) may make the change — and a supplier
// can never set supplier_paid themselves (payout flag is admin-only).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { id } = await params;
    const session = await getSession();
    let existingOrder: any = null;

    if (body.status === 'new') {
      return NextResponse.json({ message: 'New orders must remain pending_verification until accepted.' }, { status: 400 });
    }

    if (body.phone_verified !== undefined || body.city_reviewed !== undefined) {
      if (!(await requireAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (error || !data) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
      existingOrder = data;
      const currentCustomer = data.customer ?? {};
      const currentVerification = currentCustomer.verification ?? {};
      body.customer = {
        ...currentCustomer,
        verification: {
          ...currentVerification,
          phone: body.phone_verified === undefined ? currentVerification.phone : { confirmed: body.phone_verified === true, confirmedAt: new Date().toISOString() },
          city: body.city_reviewed === undefined ? currentVerification.city : { reviewed: body.city_reviewed === true, reviewedAt: new Date().toISOString() },
        },
      };
      delete body.phone_verified;
      delete body.city_reviewed;
    }

    if (body.status === 'accepted') {
      if (!(await requireAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      if (!existingOrder) {
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
        if (error || !data) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        existingOrder = data;
      }
      const market: OrderMarket = existingOrder.market === 'us' ? 'us' : 'pk';
      const verification = getOrderVerification(body.customer ?? existingOrder.customer ?? {}, market);
      if (!verification.allPass) {
        return NextResponse.json({
          message: 'Order cannot be accepted until address, confirmed phone, and city verification pass.',
          verification: verification.checks,
        }, { status: 400 });
      }
    }

    if ('supplier_status' in body || 'supplier_paid' in body) {
      const { data: existing } = await supabase
        .from('orders')
        .select('supplier_id')
        .eq('id', id)
        .single();

      const isOwner = session?.role === 'supplier' && existing?.supplier_id === session.id;
      const isAdmin = session?.role === 'admin';

      if (!isOwner && !isAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      if (session?.role === 'supplier') {
        delete body.supplier_paid; // suppliers can update fulfillment status/tracking, never the payout flag
      }
    } else if (!session || session.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('orders')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// DELETE /api/orders/[id] — unchanged, admin-only usage as before
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { id } = await params;

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}