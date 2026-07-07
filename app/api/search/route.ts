import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/search?q=shirt
// Uses the same Supabase client + market-filtering pattern as app/api/products/route.ts
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = createClient();
    const market = req.cookies.get('mv_market')?.value ?? 'pk';
    const marketValues = market === 'us' ? ['us', 'both'] : ['pk', 'both'];

    // NOTE: adjust "name" below if your products table uses a different
    // column for the product title (e.g. "title"). Add more columns to
    // the .or() filter (e.g. description, category) if you want those
    // matched too — just make sure each column actually exists in the table.
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('market_availability', marketValues)
      .ilike('name', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    // Maps flexibly in case your column names differ slightly
    // (e.g. image vs image_url vs images[0]).
    const results = (data ?? []).map((p: any) => ({
      id: p.id,
      name: p.name ?? p.title ?? 'Untitled product',
      slug: p.slug ?? p.id,
      image: p.image ?? p.image_url ?? (Array.isArray(p.images) ? p.images[0] : undefined),
      price: p.price ?? p.sale_price ?? undefined,
      category: p.category ?? undefined,
    }));

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('Search API error:', err);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}