// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const market = searchParams.get('market') ?? 'all'; // 'pk' | 'us' | 'all'

    // ── Fetch all orders ──────────────────────────────────────────────────────
    let query = supabase.from('orders').select('*').order('created_at', { ascending: true });
    const { data: orders, error } = await query;
    if (error) throw error;

    const allOrders: any[] = orders ?? [];

    // ── Filter by market if needed ────────────────────────────────────────────
    const filtered = market === 'all'
      ? allOrders
      : allOrders.filter(o => (o.market ?? 'pk') === market);

    // ── Total revenue & orders ────────────────────────────────────────────────
    const totalRevenue = filtered.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const totalOrders  = filtered.length;

    // ── This month ────────────────────────────────────────────────────────────
    const now       = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thisMonth  = filtered.filter(o => o.created_at >= monthStart);
    const monthRevenue = thisMonth.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const monthOrders  = thisMonth.length;

    // ── Fetch products count ──────────────────────────────────────────────────
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // ── Monthly breakdown (last 12 months) ───────────────────────────────────
    const monthlyMap: Record<string, { revenue: number; orders: number; label: string }> = {};

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const d    = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyMap[key] = { revenue: 0, orders: 0, label };
    }

    // Fill with actual data
    filtered.forEach(o => {
      if (!o.created_at) return;
      const d   = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        monthlyMap[key].revenue += Number(o.total) || 0;
        monthlyMap[key].orders  += 1;
      }
    });

    const monthlyHistory = Object.values(monthlyMap);

    // ── Market breakdown ──────────────────────────────────────────────────────
    const pkOrders = allOrders.filter(o => (o.market ?? 'pk') === 'pk');
    const usOrders = allOrders.filter(o => o.market === 'us');
    const marketBreakdown = {
      pk: { orders: pkOrders.length, revenue: pkOrders.reduce((s, o) => s + (Number(o.total) || 0), 0) },
      us: { orders: usOrders.length, revenue: usOrders.reduce((s, o) => s + (Number(o.total) || 0), 0) },
    };

    // ── Recent orders (last 10) ───────────────────────────────────────────────
    const recentOrders = [...filtered]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(o => ({
        id:         o.id,
        total:      o.total,
        status:     o.status,
        market:     o.market ?? 'pk',
        customer:   o.customer?.name ?? 'Unknown',
        city:       o.customer?.city ?? '',
        created_at: o.created_at,
      }));

    // ── Status breakdown ──────────────────────────────────────────────────────
    const statusMap: Record<string, number> = {};
    filtered.forEach(o => {
      const s = o.status ?? 'new';
      statusMap[s] = (statusMap[s] ?? 0) + 1;
    });

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      monthRevenue,
      monthOrders,
      totalProducts: totalProducts ?? 0,
      monthlyHistory,
      marketBreakdown,
      recentOrders,
      statusBreakdown: statusMap,
      market,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
