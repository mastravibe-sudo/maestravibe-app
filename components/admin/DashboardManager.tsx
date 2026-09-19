// components/admin/DashboardManager.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminFetch } from '@/lib/admin-fetch';
import { StatCard, SpinnerIcon, AccountsIco, OrdersIco, ProductsIco, Ico } from './shared';

type Stats = {
  activeResellers:  number;
  pendingResellers: number;
  customerAccounts: number;
  visitorsToday:    number;
  visitors30d:      number;
  totalOrders:      number;
  monthOrders:      number;
  totalRevenue:     { pk: number; us: number };
  monthRevenue:     { pk: number; us: number };
  totalProducts:    number;
  subscribers:      number;
  visitors:         { status: 'tracked'; today: number; last30Days: number } | { status: 'not_tracked'; reason: string };
};

const EyeVisitIco = () => <Ico d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />;
const CashIco     = () => <Ico d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />;

export default function DashboardManager() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    setStats(null);
    try {
      const res = await adminFetch('/api/admin/stats');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to load stats');

      if (!data || typeof data !== 'object') throw new Error('Stats response was invalid');
      setStats(data as Stats);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Live snapshot of your store, resellers and traffic</p>
        </div>
        <button onClick={load} className="text-xs font-semibold px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-2xl text-sm font-medium">
          {error}. Make sure <code className="font-mono">/api/admin/stats</code> is set up (see route.ts provided).
        </div>
      )}

      {/* Top row — the numbers you asked for */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Active Resellers"
          value={stats ? stats.activeResellers : ''}
          sub={stats ? `${stats.pendingResellers} pending approval` : undefined}
          tone="blue" icon={<AccountsIco />} loading={loading}
        />
        <StatCard
          label="Customer Accounts"
          value={stats ? stats.customerAccounts : ''}
          tone="violet" icon={<AccountsIco />} loading={loading}
        />
        <StatCard
          label="Visitors Today"
          value={stats ? stats.visitors.status === 'tracked' ? stats.visitors.today : 'Not tracked' : ''}
          sub={stats ? stats.visitors.status === 'tracked' ? `${stats.visitors.last30Days} in last 30 days` : stats.visitors.reason : undefined}
          tone="green" icon={<EyeVisitIco />} loading={loading}
        />
        <StatCard
          label="Orders Today"
          value={stats ? stats.monthOrders : ''}
          sub={stats ? `${stats.totalOrders} all-time` : undefined}
          tone="amber" icon={<OrdersIco />} loading={loading}
        />
        <StatCard
          label="Revenue This Month"
          value={stats ? `Rs. ${stats.monthRevenue.pk.toLocaleString()}` : ''}
          sub={stats ? `US: $${stats.monthRevenue.us.toFixed(2)} · PK all-time: Rs. ${stats.totalRevenue.pk.toLocaleString()}` : undefined}
          tone="rose" icon={<CashIco />} loading={loading}
        />
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
        <p className="text-sm font-bold text-gray-800 mb-1">Catalog</p>
        <p className="text-xs text-gray-500 mb-3">Quick summary of your product catalog.</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center"><ProductsIco /></div>
          <div>
            <p className="text-lg font-black text-gray-900">{loading ? '—' : stats ? stats.totalProducts : ''}</p>
            <p className="text-xs text-gray-500">Total products live in store</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 text-gray-400"><SpinnerIcon /></div>
      )}
    </div>
  );
}