// app/api/reviews/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// GET /api/reviews/summary?ids=a,b,c -> { a: { avg: 4.2, count: 17 }, ... }  (products with no reviews are omitted)
export async function GET(req: NextRequest) {
  const ids = (new URL(req.url).searchParams.get('ids') ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean).slice(0, 100);
  if (!ids.length) return NextResponse.json({});

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('review_summary', { ids });
  if (error) {
    console.error('review_summary failed (run supabase/migrations/20261018_reviews_summary.sql?)', error);
    return NextResponse.json({}, { status: 500 });
  }
  const out: Record<string, { avg: number; count: number }> = {};
  (data ?? []).forEach((r: any) => (out[r.product_id] = { avg: Number(r.avg_rating), count: Number(r.review_count) }));
  return NextResponse.json(out, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}