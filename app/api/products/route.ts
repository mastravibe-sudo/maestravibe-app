// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getSession } from '@/lib/auth';

const UUID_PATTERN = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const market = req.cookies.get('mv_market')?.value ?? 'pk';
    const marketValues = market === 'us' ? ['us', 'both'] : ['pk', 'both'];

    // Treat NULL market_availability as visible in both markets instead of
    // hiding the row — a supplier's form may never set this field.
    let query = supabase
      .from('products')
      .select('*')
      .or(`market_availability.in.(${marketValues.join(',')}),market_availability.is.null`)
      .order('created_at', { ascending: false });

    // Public storefront only ever sees approved products. Pass ?all=1 with
    // an admin session (e.g. from an admin review screen) to see pending /
    // rejected supplier submissions too.
    const { searchParams } = new URL(req.url);
    const wantsAll = searchParams.get('all') === '1';
    const session = await getSession();

    if (!(wantsAll && session?.role === 'admin')) {
      query = query.eq('approval_status', 'approved');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error('GET Products Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const session = await getSession();

    // A supplier session forces supplier_id (from the verified JWT, not the
    // request body) and approval_status: 'pending', always. An admin session
    // is trusted as before. Anyone else is rejected.
    if (session?.role === 'supplier') {
      body.supplier_id = session.id;
      body.approval_status = 'pending';
    } else if (session?.role !== 'admin') {
      // In dev, surface *why* — no session at all vs. a session with the
      // wrong role — instead of a bare "Unauthorized" that hides the cause.
      const reason =
        process.env.NODE_ENV !== 'production'
          ? session
            ? `Session found but role is "${session.role}", expected "admin" or "supplier".`
            : 'No valid session found (missing/expired/invalid "session" cookie).'
          : undefined;
      return NextResponse.json({ error: 'Unauthorized', reason }, { status: 401 });
    }

    // Never let a product silently disappear from every market because the
    // form forgot to set this — default to visible everywhere.
    if (!body.market_availability) {
      body.market_availability = 'both';
    }

    const { data, error } = await supabase
      .from('products')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error('POST Product Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  // Doubles as the admin approval action:
  // PATCH { id, approval_status: 'approved' } → approves a pending product
  // PATCH { id, approval_status: 'rejected', rejection_reason: '...' } → rejects it
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { id } = body;
    const session = await getSession();

    if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

    // Require admin for any PATCH on this endpoint (approval actions
    // are a subset of admin operations). Supplier edits are handled by
    // /api/supplier/products.
    if (session?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Approval/rejection is admin-only; audit fields are stamped server-side.
    if (body.approval_status === 'approved' || body.approval_status === 'rejected') {
      body.approved_by = body.approval_status === 'approved' && UUID_PATTERN.test(session.id) ? session.id : null;
      body.approved_at = body.approval_status === 'approved' ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
      .from('products')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('PATCH Product Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}