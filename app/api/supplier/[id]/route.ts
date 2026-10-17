// app/api/suppliers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Public supplier card: ONLY safe fields (never email, phone, CNIC or bank details).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: acc } = await supabase.from('accounts').select('*').eq('id', id).maybeSingle();
  if (!acc) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const role = String(acc.role ?? acc.type ?? 'supplier').toLowerCase();
  if (role !== 'supplier') return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const name = acc.store_name ?? acc.shop_name ?? acc.business_name ?? acc.company ?? acc.name ?? acc.full_name ?? 'Supplier';
  const code = 'SUP-' + String(id).replace(/-/g, '').slice(-6).toUpperCase();

  const { count } = await supabase
    .from('supplier_follows').select('*', { count: 'exact', head: true }).eq('supplier_id', String(id));

  let following = false;
  const session = await getSession();
  if (session?.id) {
    const { data } = await supabase
      .from('supplier_follows').select('supplier_id')
      .eq('supplier_id', String(id)).eq('follower_key', String(session.id)).maybeSingle();
    following = !!data;
  }
  return NextResponse.json({ id: String(id), name, code, followers: count ?? 0, following }, { headers: { 'Cache-Control': 'no-store' } });
}