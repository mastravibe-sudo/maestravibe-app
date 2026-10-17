// app/api/admin/supplier-documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const BUCKET = 'cnic-private';

// GET: pending/all CNIC documents with short-lived (5 min) signed image links. Admin only.
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const status = new URL(req.url).searchParams.get('status'); // pending | approved | rejected | (all)
  const supabase = createAdminClient();

  let q = supabase.from('supplier_documents').select('*').order('updated_at', { ascending: false }).limit(200);
  if (status) q = q.eq('status', status);
  const { data: docs, error } = await q;
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const ids = [...new Set((docs ?? []).map((d: any) => d.supplier_id))];
  const names = new Map<string, string>();
  if (ids.length) {
    const { data: accs } = await supabase.from('accounts').select('*').in('id', ids);
    (accs ?? []).forEach((a: any) =>
      names.set(String(a.id), a.store_name ?? a.shop_name ?? a.business_name ?? a.company ?? a.name ?? a.full_name ?? 'Supplier')
    );
  }

  const items = await Promise.all(
    (docs ?? []).map(async (d: any) => {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(d.storage_path, 300);
      return {
        id: d.id,
        supplier_id: d.supplier_id,
        supplier_name: names.get(String(d.supplier_id)) ?? 'Supplier',
        kind: d.kind,
        status: d.status,
        review_note: d.review_note,
        ai_checked: d.ai_checked,
        size_kb: Math.round((d.size_bytes ?? 0) / 1024),
        updated_at: d.updated_at,
        url: signed?.signedUrl ?? null,
      };
    })
  );
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
}

// PATCH: approve / reject. Body: { id, status: 'approved' | 'rejected', note? }
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? '');
  const status = String(body.status ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id) || !['approved', 'rejected'].includes(status))
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  const note = String(body.note ?? '').slice(0, 300) || null;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('supplier_documents')
    .update({ status, review_note: note, reviewed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}