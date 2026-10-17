// components/supplier/SupplierOrderStatus.tsx
'use client';
// Drop into each order card of the SUPPLIER dashboard:
//   <SupplierOrderStatus orderId={o.id} current={o.supplier_status} onUpdated={reload} />

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { STAGE_LABEL, nextSupplierStatuses, type Stage } from '@/lib/order-status';

export default function SupplierOrderStatus({
  orderId, current, onUpdated,
}: { orderId: string | number; current?: string | null; onUpdated?: () => void }) {
  const options = nextSupplierStatuses(current);
  const [status, setStatus] = useState<string>(options[0] ?? '');
  const [tracking, setTracking] = useState('');
  const [courier, setCourier] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (options.length === 0)
    return <p className="text-sm text-gray-500">No further updates for this order.</p>;

  const submit = async () => {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(String(orderId))}/supplier-status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note, trackingNumber: tracking, courier }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || 'Update failed');
      setMsg({ ok: true, text: 'Status updated. Admin and the customer can see it now.' });
      setNote(''); setTracking(''); setCourier('');
      const next = nextSupplierStatuses(status);
      setStatus(next[0] ?? '');
      onUpdated?.();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Update failed' });
    } finally { setBusy(false); }
  };

  const input = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-10 focus:outline-none focus:ring-2 focus:ring-violet-300';
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-600">Update status</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className={input}>
        {nextSupplierStatuses(current).map((s) => (
          <option key={s} value={s}>{(STAGE_LABEL as Record<string, string>)[s] ?? s}</option>
        ))}
      </select>
      {status === 'shipped' && (
        <div className="grid gap-2 sm:grid-cols-2">
          <input className={input} placeholder="Courier (e.g. Leopards)" value={courier} onChange={(e) => setCourier(e.target.value)} />
          <input className={input} placeholder="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} />
        </div>
      )}
      <input className={input} placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
      <button
        type="button" onClick={submit} disabled={busy || !status}
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2.5 min-h-10 disabled:opacity-60"
      >
        {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />} Save update
      </button>
      {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{msg.text}</p>}
    </div>
  );
}