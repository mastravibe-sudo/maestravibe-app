import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

type SupplierSession = { id: string; email: string; role: string };

async function getSupplier(): Promise<SupplierSession | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== 'supplier') return null;
  return session as SupplierSession;
}

// ── List the logged-in supplier's own products (any approval status) ──
export async function GET(req: NextRequest) {
  const supplier = await getSupplier();
  if (!supplier) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('supplier_id', supplier.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// ── Create a new product — always starts pending, always tagged to this supplier ──
export async function POST(req: NextRequest) {
  const supplier = await getSupplier();
  if (!supplier) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .insert([{
      ...body,
      supplier_id: supplier.id,
      approval_status: 'pending',
      rejection_reason: null,
      // ✅ FIX: this was never being set, so every supplier-submitted
      // product saved with market_availability = NULL. The admin-facing
      // GET /api/products query filtered `.in('market_availability', [...])`,
      // which never matches NULL — so the product silently never showed up
      // for admin review at all, even with ?all=1. Default to visible in
      // both markets unless the supplier's form explicitly picked one.
      market_availability: body.market_availability || 'both',
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// ── Edit an existing product — ownership enforced, edit re-sends for approval ──
export async function PATCH(req: NextRequest) {
  const supplier = await getSupplier();
  if (!supplier) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

  const supabase = createClient();

  const { data: existing, error: fetchErr } = await supabase
    .from('products').select('supplier_id, market_availability').eq('id', id).single();
  if (fetchErr || !existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  if (existing.supplier_id !== supplier.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabase
    .from('products')
    .update({
      ...updates,
      approval_status: 'pending',
      rejection_reason: null,
      // ✅ Same fallback here — covers any older row that was created
      // before this fix and still has NULL, so an edit repairs it too.
      market_availability: updates.market_availability || existing.market_availability || 'both',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// ── Delete — ownership enforced ──
export async function DELETE(req: NextRequest) {
  const supplier = await getSupplier();
  if (!supplier) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

  const supabase = createClient();
  const { data: existing } = await supabase.from('products').select('supplier_id').eq('id', id).single();
  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  if (existing.supplier_id !== supplier.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}