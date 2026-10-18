// components/TrackOrderClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { Loader2, PenLine, Search } from 'lucide-react';
import OrderTimeline, { type TimelineEvent } from '@/components/OrderTimeline';
import type { Stage } from '@/lib/order-status';

type Result = {
  id: string; stage: Stage; courier: string | null; tracking_number: string | null;
  payment_method: string; payment_status: string | null; events: TimelineEvent[];
  items: { name: string; quantity: number; image: string | null; product_id?: string | null }[];
};

export default function TrackOrderClient() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  // /track?order=ID pre-fills the order id (used by the order confirmation)
  useEffect(() => {
    const o = new URLSearchParams(window.location.search).get('order');
    if (o) setOrderId(o.slice(0, 64));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, phone }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || 'Order not found');
      setResult(d);
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong'); }
    finally { setBusy(false); }
  };

  const input = 'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm min-h-11 focus:outline-none focus:ring-2 focus:ring-violet-300';
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Track your order</h1>
        <p className="text-gray-600 mt-1">Enter your order ID and the phone number used on the order.</p>
      </header>

      <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 space-y-3">
        <div>
          <label htmlFor="trk-order" className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
          <input id="trk-order" className={input} value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="trk-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
          <input id="trk-phone" type="tel" className={input} value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <button type="submit" disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 min-h-11 disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Search className="w-4 h-4" aria-hidden="true" />} Track order
        </button>
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      </form>

      {result && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 space-y-5">
          <div className="text-sm text-gray-600">
            <p>Order <span className="font-mono text-gray-900">{result.id}</span></p>
            {(result.courier || result.tracking_number) && (
              <p>{result.courier}{result.courier && result.tracking_number ? ' \u00b7 ' : ''}{result.tracking_number && <>Tracking no. <span className="font-mono">{result.tracking_number}</span></>}</p>
            )}
            {result.payment_method === 'online' && <p>Payment: {result.payment_status === 'paid' ? 'Paid' : 'Awaiting payment'}</p>}
          </div>
          <OrderTimeline stage={result.stage} events={result.events} />
          {result.items.length > 0 && (
            <ul className="divide-y divide-gray-100 border-t border-gray-100 pt-2">
              {result.items.map((it, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-800 pr-3">{it.name}</span>
                  <span className="text-gray-500 shrink-0 flex items-center gap-3">
                    x {it.quantity}
                    {result.stage === 'delivered' && it.product_id && (
                      <a
                        href={`/?product=${encodeURIComponent(it.product_id)}&reviewOrder=${encodeURIComponent(String(result.id))}`}
                        className="inline-flex items-center gap-1 text-violet-600 font-semibold hover:underline"
                      >
                        <PenLine className="w-3.5 h-3.5" aria-hidden="true" /> Review
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}