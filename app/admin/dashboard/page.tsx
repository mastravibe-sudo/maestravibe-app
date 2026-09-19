'use client';

// app/admin/dashboard/page.tsx

import { useEffect, useState, useCallback } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

// ── Types ─────────────────────────────────────────────────────────────────────
interface MonthData   { label: string; pkRevenue: number; usRevenue: number; orders: number; }
interface RecentOrder { id: string; total: number; status: string; market: string; customer: string; city: string; created_at: string; }
interface Revenue { pk: number; us: number; }
interface Stats {
  totalRevenue:    Revenue;
  totalOrders:     number;
  monthRevenue:    Revenue;
  monthOrders:     number;
  totalProducts:   number;
  monthlyHistory:  MonthData[];
  marketBreakdown: { pk: { orders: number; revenue: number }; us: { orders: number; revenue: number } };
  recentOrders:    RecentOrder[];
  statusBreakdown: Record<string, number>;
  activeResellers:  number;
  pendingResellers: number;
  customerAccounts: number;
  subscribers:      number;
  visitors:         { status: 'tracked'; today: number; last30Days: number } | { status: 'not_tracked'; reason: string };
}

// ── Helpers (undefined-safe) ──────────────────────────────────────────────────
const fmtPKR = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-PK')}`;
const fmtUSD = (n: number) => `$${n.toFixed(2)}`;
const fmtNum = (n: number) => n.toLocaleString();

function formatCustomer(value: unknown): { name: string; city: string } {
  if (!value || typeof value !== 'object') return { name: String(value ?? '—'), city: '' };
  const customer = value as { name?: unknown; city?: unknown };
  return {
    name: String(customer.name ?? '—'),
    city: String(customer.city ?? ''),
  };
}

function parseStats(data: unknown): Stats {
  if (!data || typeof data !== 'object') throw new Error('Stats response was invalid');
  const value = data as Record<string, unknown>;
  const number = (input: unknown, label: string) => {
    if (typeof input !== 'number' || !Number.isFinite(input)) throw new Error(`Stats field ${label} was invalid`);
    return input;
  };
  const revenue = (input: unknown, label: string): Revenue => {
    if (!input || typeof input !== 'object') throw new Error(`Stats field ${label} was invalid`);
    const item = input as Record<string, unknown>;
    return { pk: number(item.pk, `${label}.pk`), us: number(item.us, `${label}.us`) };
  };
  const history = value.monthlyHistory;
  if (!Array.isArray(history) || history.length !== 12) throw new Error('Monthly history was invalid');
  const monthlyHistory = history.map((item, index) => {
    if (!item || typeof item !== 'object') throw new Error(`Monthly history item ${index} was invalid`);
    const month = item as Record<string, unknown>;
    if (typeof month.label !== 'string') throw new Error(`Monthly history label ${index} was invalid`);
    return {
      label: month.label,
      pkRevenue: number(month.pkRevenue, `monthlyHistory[${index}].pkRevenue`),
      usRevenue: number(month.usRevenue, `monthlyHistory[${index}].usRevenue`),
      orders: number(month.orders, `monthlyHistory[${index}].orders`),
    };
  });
  const visitors = value.visitors;
  if (!visitors || typeof visitors !== 'object') throw new Error('Visitor metrics were invalid');
  const visitorValue = visitors as Record<string, unknown>;
  const parsedVisitors = visitorValue.status === 'tracked'
    ? { status: 'tracked' as const, today: number(visitorValue.today, 'visitors.today'), last30Days: number(visitorValue.last30Days, 'visitors.last30Days') }
    : visitorValue.status === 'not_tracked' && typeof visitorValue.reason === 'string'
      ? { status: 'not_tracked' as const, reason: visitorValue.reason }
      : (() => { throw new Error('Visitor metrics were invalid'); })();
  const marketBreakdown = value.marketBreakdown;
  if (!marketBreakdown || typeof marketBreakdown !== 'object') throw new Error('Market breakdown was invalid');
  const market = marketBreakdown as Record<string, unknown>;
  const marketValue = (input: unknown, label: string) => {
    if (!input || typeof input !== 'object') throw new Error(`Market breakdown ${label} was invalid`);
    const item = input as Record<string, unknown>;
    return { orders: number(item.orders, `${label}.orders`), revenue: number(item.revenue, `${label}.revenue`) };
  };
  if (!Array.isArray(value.recentOrders) || !value.statusBreakdown || typeof value.statusBreakdown !== 'object') throw new Error('Order summaries were invalid');
  return {
    totalRevenue: revenue(value.totalRevenue, 'totalRevenue'),
    totalOrders: number(value.totalOrders, 'totalOrders'),
    monthRevenue: revenue(value.monthRevenue, 'monthRevenue'),
    monthOrders: number(value.monthOrders, 'monthOrders'),
    totalProducts: number(value.totalProducts, 'totalProducts'),
    monthlyHistory,
    marketBreakdown: { pk: marketValue(market.pk, 'pk'), us: marketValue(market.us, 'us') },
    recentOrders: (value.recentOrders as Record<string, unknown>[]).map(order => {
      const customer = formatCustomer(order.customer);
      return {
        id: String(order.id ?? ''),
        total: number(order.total, 'recentOrders.total'),
        status: String(order.status ?? 'unknown'),
        market: order.market === 'us' ? 'us' : 'pk',
        customer: customer.name,
        city: customer.city,
        created_at: String(order.created_at ?? ''),
      };
    }),
    statusBreakdown: value.statusBreakdown as Record<string, number>,
    activeResellers: number(value.activeResellers, 'activeResellers'),
    pendingResellers: number(value.pendingResellers, 'pendingResellers'),
    customerAccounts: number(value.customerAccounts, 'customerAccounts'),
    subscribers: number(value.subscribers, 'subscribers'),
    visitors: parsedVisitors,
  };
}

const STATUS_COLOR: Record<string, string> = {
  new:       'bg-blue-100 text-blue-700',
  confirmed: 'bg-violet-100 text-violet-700',
  shipped:   'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data, valueKey }: { data: MonthData[]; valueKey: 'revenue' | 'orders' }) {
  const maxOrders = Math.max(...data.map(d => d.orders), 1);
  const maxPK = Math.max(...data.map(d => d.pkRevenue), 1);
  const maxUS = Math.max(...data.map(d => d.usRevenue), 1);
  return (
    <div className="flex items-end gap-1.5 h-32 w-full">
      {data.map((d, i) => {
        const orderPct = (d.orders / maxOrders) * 100;
        const pkPct = (d.pkRevenue / maxPK) * 100;
        const usPct = (d.usRevenue / maxUS) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              {d.label}: {valueKey === 'revenue' ? `${fmtPKR(d.pkRevenue)} / ${fmtUSD(d.usRevenue)}` : d.orders}
            </div>
            {valueKey === 'revenue' ? (
              <div className="w-full flex items-end justify-center gap-0.5 h-full">
                <div className="w-1/2 rounded-t-md" style={{ height: `${Math.max(pkPct, 2)}%`, background: isLast ? '#7c3aed' : '#c4b5fd' }} />
                <div className="w-1/2 rounded-t-md" style={{ height: `${Math.max(usPct, 2)}%`, background: isLast ? '#2563eb' : '#93c5fd' }} />
              </div>
            ) : (
              <div className="w-full rounded-t-md" style={{ height: `${Math.max(orderPct, 2)}%`, background: isLast ? '#7c3aed' : '#ddd6fe' }} />
            )}
            <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [market,  setMarket]  = useState<'all' | 'pk' | 'us'>('all');
  const [chart,   setChart]   = useState<'revenue' | 'orders'>('revenue');
  const [error,   setError]   = useState('');

  const fetchStats = useCallback(async (m: string) => {
    setLoading(true);
    setError('');
    setStats(null);
    try {
      const res = await adminFetch(`/api/admin/stats?market=${m}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to load stats');

      setStats(parseStats(data));
    } catch (e: any) {
      setError(e.message ?? 'Error loading stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(market); }, [market, fetchStats]);

  // ── Stat cards data ───────────────────────────────────────────────────────
  const cards = stats ? [
    // 👇 naye cards — sabse upar/front
    {
      label: 'Active Resellers',
      value: fmtNum(stats.activeResellers),
      sub:   `${stats.pendingResellers} pending approval`,
      color: 'from-indigo-600 to-blue-500',
      icon:  '🧑‍💼',
    },
    {
      label: 'Customer Accounts',
      value: fmtNum(stats.customerAccounts),
      sub:   'Registered customers',
      color: 'from-fuchsia-600 to-pink-500',
      icon:  '👥',
    },
    {
      label: 'Visitors Today',
      value: stats.visitors.status === 'tracked' ? fmtNum(stats.visitors.today) : 'Not tracked',
      sub:   stats.visitors.status === 'tracked' ? `${fmtNum(stats.visitors.last30Days)} in last 30 days` : stats.visitors.reason,
      color: 'from-teal-600 to-cyan-500',
      icon:  '👁️',
    },
    {
      label: 'Newsletter Subscribers',
      value: fmtNum(stats.subscribers),
      sub:   'Active email subscribers',
      color: 'from-orange-500 to-amber-500',
      icon:  '✉️',
    },
    // ── purane cards ──
    {
      label:  'Total Revenue',
      value:  fmtPKR(stats.totalRevenue.pk),
      sub:    `US: ${fmtUSD(stats.totalRevenue.us)}`,
      color:  'from-violet-600 to-fuchsia-600',
      icon:   '💰',
    },
    {
      label:  'Total Orders',
      value:  fmtNum(stats.totalOrders),
      sub:    `This month: ${stats.monthOrders}`,
      color:  'from-blue-600 to-cyan-500',
      icon:   '📦',
    },
    {
      label:  'Total Products',
      value:  fmtNum(stats.totalProducts),
      sub:    'In catalog',
      color:  'from-emerald-600 to-teal-500',
      icon:   '🛍️',
    },
    {
      label:  'PK Orders',
      value:  fmtNum(stats.marketBreakdown.pk.orders),
      sub:    `Revenue: ${fmtPKR(stats.marketBreakdown.pk.revenue)}`,
      color:  'from-green-600 to-emerald-500',
      icon:   '🇵🇰',
    },
    {
      label:  'US Orders',
      value:  fmtNum(stats.marketBreakdown.us.orders),
      sub:    `Revenue: ${fmtUSD(stats.marketBreakdown.us.revenue)}`,
      color:  'from-blue-700 to-indigo-600',
      icon:   '🇺🇸',
    },
    {
      label:  'This Month',
      value:  fmtPKR(stats.monthRevenue.pk),
      sub:    `${stats.monthOrders} orders · US: ${fmtUSD(stats.monthRevenue.us)}`,
      color:  'from-rose-500 to-pink-500',
      icon:   '📅',
    },
  ] : [];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Sales overview & analytics</p>
        </div>

        {/* Market switcher */}
        <div className="flex items-center gap-2 bg-white border-2 border-gray-100 rounded-2xl p-1.5 shadow-sm">
          {(['all', 'pk', 'us'] as const).map(m => (
            <button key={m} onClick={() => setMarket(m)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                market === m
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800'
              }`}>
              {m === 'all' ? '🌍 All' : m === 'pk' ? '🇵🇰 Pakistan' : '🇺🇸 USA'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 min-[390px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[390px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {cards.map((c, i) => (
            <div key={i} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white shadow-lg`}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">{c.label}</p>
                <span className="text-xl">{c.icon}</span>
              </div>
              <p className="text-2xl font-black leading-none mb-1">{c.value}</p>
              <p className="text-xs text-white/70">{c.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts ── */}
      {!loading && stats && (
        <div className="grid md:grid-cols-2 gap-6">

          {/* Monthly Chart */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-black text-gray-900">Monthly History</h2>
                <p className="text-xs text-gray-400">Last 12 months</p>
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                <button onClick={() => setChart('revenue')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chart === 'revenue' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500'}`}>
                  Revenue
                </button>
                <button onClick={() => setChart('orders')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chart === 'orders' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500'}`}>
                  Orders
                </button>
              </div>
            </div>
            <BarChart data={stats.monthlyHistory} valueKey={chart} />
          </div>

          {/* Market Breakdown */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 mb-1">Market Breakdown</h2>
            <p className="text-xs text-gray-400 mb-4">PK vs US performance</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-700">🇵🇰 Pakistan</span>
                  <span className="text-xs text-gray-500">{stats.marketBreakdown.pk.orders} orders</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${stats.totalOrders === 0 ? 0 : (stats.marketBreakdown.pk.orders / stats.totalOrders) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{fmtPKR(stats.marketBreakdown.pk.revenue)}</p>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-700">🇺🇸 USA</span>
                  <span className="text-xs text-gray-500">{stats.marketBreakdown.us.orders} orders</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-700"
                    style={{ width: `${stats.totalOrders === 0 ? 0 : (stats.marketBreakdown.us.orders / stats.totalOrders) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{fmtUSD(stats.marketBreakdown.us.revenue)}</p>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-black text-gray-700 mb-2">Order Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                    <span key={status} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {status}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Orders ── */}
      {!loading && stats && stats.recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-gray-900">Recent Orders</h2>
              <p className="text-xs text-gray-400">Latest 10 orders</p>
            </div>
            <a href="/admin/orders" className="text-xs text-violet-600 font-bold hover:underline">View All →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Customer', 'City', 'Market', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o, i) => (
                  <tr key={o.id ?? i} className="border-b border-gray-50 hover:bg-violet-50/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{o.customer}</td>
                    <td className="px-4 py-3 text-gray-500">{o.city || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${o.market === 'us' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {o.market === 'us' ? '🇺🇸 US' : '🇵🇰 PK'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-violet-700">
                      {o.market === 'us' ? fmtUSD(o.total) : fmtPKR(o.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full font-semibold ${STATUS_COLOR[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(o.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && stats && stats.totalOrders === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📊</div>
          <p className="font-semibold">No orders yet for this market</p>
          <p className="text-sm mt-1">Orders will appear here once customers start purchasing</p>
        </div>
      )}
    </div>
  );
}