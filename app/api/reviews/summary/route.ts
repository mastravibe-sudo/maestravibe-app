// app/api/reviews/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// GET /api/reviews/summary?ids=a,b,c            -> { a: { avg: 4.2, count: 17 }, ... }  (no reviews => omitted)
// GET /api/reviews/summary?ids=a&dist=1          -> { a: { avg, count, dist: { "5": 9, "4": 5, ... } } }
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const ids = (url.searchParams.get('ids') ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 100);
  if (!ids.length) return NextResponse.json({});

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('review_summary', { ids });
  if (error) {
    console.error('review_summary failed (run supabase/migrations/20261019_reviews_v2.sql?)', error);
    return NextResponse.json({}, { status: 500 });
  }

  const out: Record<string, { avg: number; count: number; dist?: Record<string, number> }> = {};
  (data ?? []).forEach((r: any) => (out[r.product_id] = { avg: Number(r.avg_rating), count: Number(r.review_count) }));

  if (url.searchParams.get('dist') === '1' && ids.length === 1 && out[ids[0]]) {
    const { data: rows, error: dErr } = await supabase.rpc('review_distribution', { pid: ids[0] });
    if (dErr) console.error('review_distribution failed', dErr);
    const dist: Record<string, number> = {};
    (rows ?? []).forEach((r: any) => (dist[String(r.stars)] = Number(r.review_count)));
    out[ids[0]].dist = dist;
  }

  const cache = url.searchParams.get('dist') === '1' ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300';
  return NextResponse.json(out, { headers: { 'Cache-Control': cache } });
}