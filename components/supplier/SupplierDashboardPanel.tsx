// components/supplier/SupplierDashboardPanel.tsx
'use client';
// Complete supplier area: sales summary, sales chart, orders with live tracking, account (picture + CNIC).
// Self-contained. Page:  app/supplier/page.tsx   (or embed <SupplierDashboardPanel /> in app\dashboard\page.tsx)

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, ChevronDown, ClipboardList, Clock, Loader2, Package, PackageCheck, Settings, Wallet } from 'lucide-react';
import OrderEventsPanel from '@/components/OrderEventsPanel';
import SupplierOrderStatus from '@/components/supplier/SupplierOrderStatus';
import CnicUpload from '@/components/supplier/CnicUpload';
import AvatarUpload from '@/components/supplier/AvatarUpload';
import { STAGE_LABEL, resolveStage } from '@/lib/order-status';

type Order = {
  id: string | number;
  created_at: string;
  status?: string | null;
  supplier_status?: string | null;
  items: { name?: string; quantity?: number; price?: number }[];
  supplier_total: number;
  currency?: string | null;
  payment_method?: string | null;
  payment_status?: string | null;
  awaiting_payment?: boolean;
  can_update?: boolean;
  tracking_number?: string | null;
  courier?: string | null;
  customer: { name?: string; phone?: string; city?: string; address?: string };
};
type Tab = 'overview' | 'orders' | 'account';
type Filter = 'all' | 'active' | 'delivered' | 'cancelled';

const curKey = (c?: string | null) => String(c ?? 'pkr').toLowerCase();
const money = (n: number, cur?: string | null) =>
  curKey(cur) === 'usd' ? `$${n.toFixed(2)}` : `Rs ${Math.round(n).toLocaleString('en-PK')}`;

export default function SupplierDashboardPanel() {
  const [tab, setTab] = useState<Tab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<string>('');
  const [tick, setTick] = useState(0);

  const load = useCallback(() => {
    setError('');
    return fetch('/api/orders?mine=1', { cache: 'no-store' })
      .then(async (r) => {
        if (r.status === 401) throw new Error('Please sign in with your supplier account.');
        if (!r.ok) throw new Error('Could not load your orders.');
        return r.json();
      })
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const live = orders.filter((o) => resolveStage(o) !== 'cancelled');
    const delivered = orders.filter((o) => resolveStage(o) === 'delivered');
    const active = orders.filter((o) => !['delivered', 'cancelled'].includes(resolveStage(o)));
    const earned: Record<string, number> = {};
    delivered.forEach((o) => { const k = curKey(o.currency); earned[k] = (earned[k] ?? 0) + Number(o.supplier_total || 0); });
    const total: Record<string, number> = {};
    live.forEach((o) => { const k = curKey(o.currency); total[k] = (total[k] ?? 0) + Number(o.supplier_total || 0); });
    const primary = Object.entries(total).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'pkr';

    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (13 - i));
      return { key: d.toDateString(), short: `${d.getDate()}/${d.getMonth() + 1}`, label: d.toLocaleDateString(), value: 0 };
    });
    live.filter((o) => curKey(o.currency) === primary).forEach((o) => {
      const day = days.find((x) => x.key === new Date(o.created_at).toDateString());
      if (day) day.value += Number(o.supplier_total || 0);
    });
    return { live, delivered, active, earned, primary, days };
  }, [orders]);

  const shown = useMemo(() => orders.filter((o) => {
    const s = resolveStage(o);
    if (filter === 'active') return s !== 'delivered' && s !== 'cancelled';
    if (filter === 'delivered') return s === 'delivered';
    if (filter === 'cancelled') return s === 'cancelled';
    return true;
  }), [orders, filter]);

  const card = 'rounded-2xl border border-gray-200 bg-white p-4 sm:p-5';
  const tabs: { id: Tab; label: string; Icon: typeof BarChart3 }[] = [
    { id: 'overview', label: 'Overview', Icon: BarChart3 },
    { id: 'orders', label: 'Orders', Icon: ClipboardList },
    { id: 'account', label: 'Account', Icon: Settings },
  ];

  const max = Math.max(1, ...stats.days.map((d) => d.value));
  const slot = 584 / 14;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Supplier dashboard</h1>
        <Link href="/supplier/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-violet-600 text-violet-700 px-4 py-2 text-sm font-semibold min-h-10 hover:bg-violet-50">
          <Package className="w-4 h-4" aria-hidden="true" /> Manage products
        </Link>
      </div>

      <nav className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Dashboard sections">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id}
            className={`inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-sm font-semibold min-h-10 ${tab === id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            <Icon className="w-4 h-4" aria-hidden="true" /> {label}
          </button>
        ))}
      </nav>

      {error && tab !== 'account' && <p role="alert" className="rounded-xl bg-rose-50 text-rose-700 px-4 py-3 text-sm">{error}</p>}
      {loading && tab !== 'account' && <p className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Loading</p>}

      {tab === 'overview' && !loading && !error && (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className={card}>
              <p className="flex items-center gap-2 text-sm text-gray-500"><Wallet className="w-4 h-4" aria-hidden="true" /> Total sales (delivered)</p>
              {Object.keys(stats.earned).length === 0
                ? <p className="mt-2 text-2xl font-bold text-gray-900">{money(0)}</p>
                : Object.entries(stats.earned).map(([c, v]) => <p key={c} className="mt-2 text-2xl font-bold text-gray-900">{money(v, c)}</p>)}
            </div>
            <div className={card}>
              <p className="flex items-center gap-2 text-sm text-gray-500"><Clock className="w-4 h-4" aria-hidden="true" /> Active orders</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{stats.active.length}</p>
            </div>
            <div className={card}>
              <p className="flex items-center gap-2 text-sm text-gray-500"><PackageCheck className="w-4 h-4" aria-hidden="true" /> Delivered orders</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{stats.delivered.length}</p>
            </div>
          </div>

          <section className={card} aria-label="Sales in the last 14 days">
            <h2 className="font-semibold text-gray-900 mb-3">Sales, last 14 days <span className="text-xs font-normal text-gray-500">({stats.primary.toUpperCase()}, cancelled orders excluded)</span></h2>
            <svg viewBox="0 0 600 180" className="w-full h-auto" role="img" aria-label="Bar chart of daily sales">
              {stats.days.map((d, i) => {
                const h = Math.round((d.value / max) * 140);
                const x = 8 + i * slot;
                return (
                  <g key={d.key}>
                    <rect x={x + 3} y={150 - Math.max(h, 2)} width={slot - 6} height={Math.max(h, 2)} rx={4} className={d.value > 0 ? 'fill-violet-500' : 'fill-gray-200'} />
                    <title>{`${d.label}: ${money(d.value, stats.primary)}`}</title>
                    {i % 2 === 0 && <text x={x + slot / 2} y={170} textAnchor="middle" fontSize={10} className="fill-gray-500">{d.short}</text>}
                  </g>
                );
              })}
            </svg>
          </section>
        </>
      )}

      {tab === 'orders' && !loading && !error && (
        <section className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'delivered', 'cancelled'] as Filter[]).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize min-h-9 ${filter === f ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{f}</button>
            ))}
          </div>

          {shown.length === 0 && <p className="text-sm text-gray-500">No orders here yet.</p>}

          {shown.map((o) => {
            const id = String(o.id);
            const isOpen = open === id;
            const stage = resolveStage(o);
            return (
              <article key={id} className={card}>
                <button type="button" onClick={() => setOpen(isOpen ? '' : id)} aria-expanded={isOpen}
                  className="w-full flex flex-wrap items-center justify-between gap-3 text-left">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">Order {id.length > 10 ? `...${id.slice(-8)}` : id}</p>
                    <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString()} &middot; {o.customer?.name ?? 'Customer'}{o.customer?.city ? `, ${o.customer.city}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-violet-50 text-violet-700 px-3 py-1 text-xs font-semibold">{STAGE_LABEL[stage]}</span>
                    <span className="font-bold text-gray-900">{money(Number(o.supplier_total || 0), o.currency)}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 grid gap-5 lg:grid-cols-2 border-t border-gray-100 pt-4">
                    <div className="space-y-4">
                      <ul className="text-sm text-gray-700 space-y-1">
                        {o.items.map((it, i) => (<li key={i} className="flex justify-between gap-3"><span>{it.name}</span><span className="text-gray-500 shrink-0">x {it.quantity ?? 1}</span></li>))}
                      </ul>
                      {o.awaiting_payment ? (
                        <p className="rounded-lg bg-amber-50 text-amber-700 px-3 py-2 text-sm">Waiting for the customer's online payment. Delivery details unlock once it is paid. Do not pack yet.</p>
                      ) : (
                        <div className="text-sm text-gray-700">
                          <p className="font-semibold text-gray-900">Deliver to</p>
                          <p>{o.customer?.name}{o.customer?.phone ? ` \u00b7 ${o.customer.phone}` : ''}</p>
                          <p>{[o.customer?.address, o.customer?.city].filter(Boolean).join(', ')}</p>
                        </div>
                      )}
                      {o.can_update && !o.awaiting_payment && (
                        <SupplierOrderStatus orderId={o.id} current={o.supplier_status} onUpdated={() => { setTick((t) => t + 1); load(); }} />
                      )}
                      {!o.can_update && <p className="text-sm text-gray-500">This order has products from several suppliers, so admin updates its status.</p>}
                    </div>
                    <OrderEventsPanel orderId={o.id} refreshKey={tick} />
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {tab === 'account' && (
        <section className="space-y-6">
          <div className={card}><AvatarUpload /></div>
          <div className={card}>
            <h2 className="font-semibold text-gray-900 mb-3">CNIC verification</h2>
            <CnicUpload />
          </div>
        </section>
      )}
    </div>
  );
}