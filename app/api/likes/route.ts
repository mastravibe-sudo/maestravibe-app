// app/api/likes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getViewer, applyViewerCookie } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

// GET /api/likes?ids=a,b,c  -> { mine: [every product id this viewer liked], counts: { a: 3, ... } }
export async function GET(req: NextRequest) {
  const viewer = await getViewer();
  const supabase = createAdminClient();
  const ids = (new URL(req.url).searchParams.get('ids') ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean).slice(0, 100);

  const { data: mineRows } = await supabase
    .from('product_likes').select('product_id').eq('viewer_key', viewer.key).limit(1000);

  const counts: Record<string, number> = {};
  ids.forEach((id) => (counts[id] = 0));
  if (ids.length) {
    const { data } = await supabase.rpc('like_counts', { ids });
    (data ?? []).forEach((r: any) => (counts[r.product_id] = Number(r.likes)));
  }

  return applyViewerCookie(
    NextResponse.json({ mine: (mineRows ?? []).map((r: any) => r.product_id), counts }, { headers: { 'Cache-Control': 'no-store' } }),
    viewer
  );
}

// POST { productId } -> toggles THIS product only
export async function POST(req: NextRequest) {
  const viewer = await getViewer();
  const body = await req.json().catch(() => ({}));
  const productId = String(body.productId ?? '').trim();
  if (!productId || productId.length > 100 || productId === 'undefined')
    return NextResponse.json({ message: 'productId required' }, { status: 400 });

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from('product_likes').select('product_id')
    .eq('product_id', productId).eq('viewer_key', viewer.key).maybeSingle();

  let liked: boolean;
  if (existing) {
    await supabase.from('product_likes').delete().eq('product_id', productId).eq('viewer_key', viewer.key);
    liked = false;
  } else {
    await supabase.from('product_likes').insert([{ product_id: productId, viewer_key: viewer.key }]);
    liked = true;
  }

  const { data: c } = await supabase.rpc('like_counts', { ids: [productId] });
  const count = Number(c?.[0]?.likes ?? 0);
  return applyViewerCookie(NextResponse.json({ liked, count }), viewer);
}