// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // adjust import path if different

export async function GET(req: NextRequest) {
  try {
    const market = req.nextUrl.searchParams.get('market') ?? 'all'; // 'all' | 'pk' | 'us'

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    // Base orders query filtered by market (unless 'all')
    const ordersQuery = () => {
      let q = supabase.from('orders').select('id, total, status, market, customer, city, created_at');
      if (market !== 'all') q = q.eq('market', market);
      return q;
    };

    const [
      { count: activeResellers },
      { count: customerAccounts },
      { count: totalProducts },
      { data: allOrders },      // filtered by market — for totals/history/status/recent
      { data: pkOrders },       // always PK — for marketBreakdown card
      { data: usOrders },       // always US — for marketBreakdown card
    ] = await Promise.all([
      supabase.from('accounts').select('*', { count: 'exact', head: true }).eq('role', 'reseller').eq('status', 'approved'),
      supabase.from('accounts').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      ordersQuery(),
      supabase.from('orders').select('total').eq('market', 'pk'),
      supabase.from('orders').select('total').eq('market', 'us'),
    ]);

    const orders = allOrders ?? [];

    // ── Totals ──────────────────────────────────────────────
    const totalOrders  = orders.length;
    const totalRevenue = orders.reduce((s, o: any) => s + Number(o.total || 0), 0);

    const monthOrdersArr = orders.filter((o: any) => new Date(o.created_at) >= startOfMonth);
    const monthOrders  = monthOrdersArr.length;
    const monthRevenue = monthOrdersArr.reduce((s, o: any) => s + Number(o.total || 0), 0);

    // ── Monthly history (last 12 months) ─────────────────────
    const monthlyHistory = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const next = new Date(now.getFullYear(), now.getMonth() - (11 - i) + 1, 1);
      const inMonth = orders.filter((o: any) => {
        const c = new Date(o.created_at);
        return c >= d && c < next;
      });
      return {
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        revenue: inMonth.reduce((s, o: any) => s + Number(o.total || 0), 0),
        orders: inMonth.length,
      };
    });

    // ── Market breakdown (always both, regardless of filter) ─
    const marketBreakdown = {
      pk: {
        orders: (pkOrders ?? []).length,
        revenue: (pkOrders ?? []).reduce((s, o: any) => s + Number(o.total || 0), 0),
      },
      us: {
        orders: (usOrders ?? []).length,
        revenue: (usOrders ?? []).reduce((s, o: any) => s + Number(o.total || 0), 0),
      },
    };

    // ── Recent orders (latest 10, filtered by market) ────────
    const recentOrders = [...orders]
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // ── Status breakdown ──────────────────────────────────────
    const statusBreakdown: Record<string, number> = {};
    for (const o of orders as any[]) {
      const s = o.status ?? 'unknown';
      statusBreakdown[s] = (statusBreakdown[s] ?? 0) + 1;
    }

    // ── Website visitors (needs site_visits table — see note below) ──
    let visitorsToday = 0;
    let visitors30d = 0;
    try {
      const [{ count: vt }, { count: v30 }] = await Promise.all([
        supabase.from('site_visits').select('*', { count: 'exact', head: true }).gte('created_at', startOfToday.toISOString()),
        supabase.from('site_visits').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
      ]);
      visitorsToday = vt ?? 0;
      visitors30d = v30 ?? 0;
    } catch {
      // site_visits table not set up yet — fine, defaults to 0
    }

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      monthRevenue,
      monthOrders,
      totalProducts: totalProducts ?? 0,
      monthlyHistory,
      marketBreakdown,
      recentOrders,
      statusBreakdown,
      // extra fields for the reseller/customer/visitor cards
      activeResellers: activeResellers ?? 0,
      customerAccounts: customerAccounts ?? 0,
      visitorsToday,
      visitors30d,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message ?? 'Failed to load stats' }, { status: 500 });
  }
}