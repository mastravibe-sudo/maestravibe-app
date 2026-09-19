import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';

// ── List all supplier accounts, with their product approval counts ──
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();

  const { data: suppliers, error } = await supabase
    .from('accounts')
    .select('id, name, email, phone, address, website, status, cnic_image_url, bank_type, bank_name, bank_account_title, bank_account_number, created_at')
    .eq('role', 'supplier')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach product counts per supplier (pending / approved / rejected) in one extra query.
  const ids = (suppliers ?? []).map(s => s.id);
  let counts: Record<string, { pending: number; approved: number; rejected: number }> = {};

  if (ids.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('supplier_id, approval_status')
      .in('supplier_id', ids);

    counts = (products ?? []).reduce((acc, p) => {
      const key = p.supplier_id as string;
      if (!acc[key]) acc[key] = { pending: 0, approved: 0, rejected: 0 };
      const status = (p.approval_status as 'pending' | 'approved' | 'rejected') ?? 'pending';
      acc[key][status] = (acc[key][status] ?? 0) + 1;
      return acc;
    }, {} as typeof counts);
  }

  const result = (suppliers ?? []).map(s => ({
    ...s,
    product_counts: counts[s.id] ?? { pending: 0, approved: 0, rejected: 0 },
  }));

  return NextResponse.json(result);
}

// ── Approve or reject a supplier account ──
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, status, rejection_reason } = body;

  if (!id || !status) return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'status must be approved, rejected, or pending' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('accounts')
    .update({ status, rejection_reason: status === 'rejected' ? (rejection_reason ?? null) : null })
    .eq('id', id)
    .eq('role', 'supplier')
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}