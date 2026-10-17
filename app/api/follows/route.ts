// app/api/follows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function followerCount(supabase: ReturnType<typeof createAdminClient>, supplierId: string) {
  const { count } = await supabase
    .from('supplier_follows').select('*', { count: 'exact', head: true }).eq('supplier_id', supplierId);
  return count ?? 0;
}

// GET /api/follows?supplierId=...  -> { following, followers }
export async function GET(req: NextRequest) {
  const supplierId = (new URL(req.url).searchParams.get('supplierId') ?? '').trim();
  if (!supplierId) return NextResponse.json({ message: 'supplierId required' }, { status: 400 });
  const supabase = createAdminClient();
  const session = await getSession();

  let following = false;
  if (session?.id) {
    const { data } = await supabase
      .from('supplier_follows').select('supplier_id')
      .eq('supplier_id', supplierId).eq('follower_key', String(session.id)).maybeSingle();
    following = !!data;
  }
  return NextResponse.json({ following, followers: await followerCount(supabase, supplierId) }, { headers: { 'Cache-Control': 'no-store' } });
}

// POST { supplierId } -> toggle follow (login required, so follower counts stay real)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ message: 'Please sign in to follow a supplier.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const supplierId = String(body.supplierId ?? '').trim();
  if (!supplierId || supplierId.length > 100) return NextResponse.json({ message: 'supplierId required' }, { status: 400 });
  if (supplierId === String(session.id)) return NextResponse.json({ message: 'You cannot follow yourself.' }, { status: 400 });

  const supabase = createAdminClient();
  const followerKey = String(session.id);
  const { data: existing } = await supabase
    .from('supplier_follows').select('supplier_id').eq('supplier_id', supplierId).eq('follower_key', followerKey).maybeSingle();

  let following: boolean;
  if (existing) {
    await supabase.from('supplier_follows').delete().eq('supplier_id', supplierId).eq('follower_key', followerKey);
    following = false;
  } else {
    await supabase.from('supplier_follows').insert([{ supplier_id: supplierId, follower_key: followerKey }]);
    following = true;
  }
  return NextResponse.json({ following, followers: await followerCount(supabase, supplierId) });
}