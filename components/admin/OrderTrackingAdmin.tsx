// components/admin/OrderTrackingAdmin.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Loader2, Search } from 'lucide-react';
import OrderEventsPanel from '@/components/OrderEventsPanel';
import { STAGE_LABEL, resolveStage } from '@/lib/order-status';

type Order = {
  id: string | number; created_at: string; status?: string | null; supplier_status?: string | null;
  payment_method?: string | null; payment_status?: string | null; total?: number; currency?: string | null;
  supplier_id?: string | null; tracking_number?: string | null; courier?: string | null;
  customer?: { name?: string; city?: string };
};

const money = (n: number, cur?: string | null) =>
  String(cur ?? '').toLowerCase() === 'usd' ? `$${Number(n).toFixed(2)}` : `Rs ${Math.round(Number(n)).toLocaleString('en-PK')}`;

export default function OrderTrackingAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState('');

  useEffect(() => {
    fetch('/api/orders', { cache: 'no-store' })
      .then(async (r) => { if (!r.ok) throw new Error('Could not load orders (are you logged in as admin?)'); return r.json(); })
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders
      .filter((o) => !s || String(o.id).toLowerCase().includes(s) || String(o.customer?.name ?? '').toLowerCase().includes(s))
      .slice(0, 100);
  }, [orders, q]);

  return (
    <section className="space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by order ID or customer name"
          className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm min-h-11 focus:outline-none focus:ring-2 focus:ring-violet-300" />
      </div>

      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      {loading && <p className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Loading</p>}
      {!loading && !error && shown.length === 0 && <p className="text-sm text-gray-500">No orders found.</p>}

      {shown.map((o) => {
        const id = String(o.id);
        const isOpen = open === id;
        const stage = resolveStage(o);
        const waiting = o.payment_method === 'online' && o.payment_status !== 'paid';
        return (
          <article key={id} className="rounded-2xl border border-gray-200 bg-white p-4">
            <button type="button" onClick={() => setOpen(isOpen ? '' : id)} aria-expanded={isOpen}
              className="w-full flex flex-wrap items-center justify-between gap-3 text-left">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">Order {id.length > 10 ? `...${id.slice(-8)}` : id}</p>
                <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString()} &middot; {o.customer?.name ?? 'Customer'}{o.customer?.city ? `, ${o.customer.city}` : ''}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {waiting && <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold">Awaiting payment</span>}
                {o.payment_method === 'online' && o.payment_status === 'paid' && <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">Paid</span>}
                <span className="rounded-full bg-violet-50 text-violet-700 px-3 py-1 text-xs font-semibold">{STAGE_LABEL[stage]}</span>
                {o.total != null && <span className="font-bold text-gray-900">{money(o.total, o.currency)}</span>}
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </div>
            </button>
            {isOpen && (
              <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  Admin status: <span className="font-semibold">{o.status ?? '-'}</span> &middot; Supplier status: <span className="font-semibold">{o.supplier_status ?? (o.supplier_id ? 'pending' : 'no supplier')}</span>
                </p>
                <OrderEventsPanel orderId={o.id} />
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}