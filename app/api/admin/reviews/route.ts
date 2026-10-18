// app/api/admin/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET ?status=pending|approved  -> reviews to moderate (admin only; includes reviewer email)
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const approved = new URL(req.url).searchParams.get('status') === 'approved';
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('reviews').select('*').eq('approved', approved).order('created_at', { ascending: false }).limit(200);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const ids = [...new Set((data ?? []).map((r: any) => String(r.product_id)))];
  const names = new Map<string, string>();
  if (ids.length) {
    const { data: prods } = await supabase.from('products').select('id,name').in('id', ids);
    (prods ?? []).forEach((p: any) => names.set(String(p.id), p.name));
  }
  const items = (data ?? []).map((r: any) => ({ ...r, product_name: names.get(String(r.product_id)) ?? 'Unknown product' }));
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
}

// PATCH { id, approved: boolean }
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? '').slice(0, 64);
  if (!id || typeof body.approved !== 'boolean') return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  const supabase = createAdminClient();
  const { error } = await supabase.from('reviews').update({ approved: body.approved }).eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE ?id=...
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const id = (new URL(req.url).searchParams.get('id') ?? '').slice(0, 64);
  if (!id) return NextResponse.json({ message: 'id required' }, { status: 400 });
  const supabase = createAdminClient();
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}