// components/OrderEventsPanel.tsx
'use client';
// Drop into the ADMIN dashboard and the SUPPLIER dashboard order rows:
//   <OrderEventsPanel orderId={order.id} refreshKey={someNumberThatChangesAfterUpdate} />

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import OrderTimeline, { type TimelineEvent } from '@/components/OrderTimeline';
import type { Stage } from '@/lib/order-status';

type Data = { stage: Stage; courier: string | null; tracking_number: string | null; events: TimelineEvent[] };

export default function OrderEventsPanel({ orderId, refreshKey = 0 }: { orderId: string | number; refreshKey?: number }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError('');
    fetch(`/api/orders/${encodeURIComponent(String(orderId))}/events`, { cache: 'no-store' })
      .then(async (r) => { if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Could not load tracking'); return r.json(); })
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [orderId, refreshKey]);

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!data) return <p className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Loading tracking</p>;

  return (
    <div className="space-y-3">
      {(data.courier || data.tracking_number) && (
        <p className="text-sm text-gray-700">
          {data.courier && <span className="font-semibold">{data.courier}</span>}
          {data.courier && data.tracking_number && ' \u00b7 '}
          {data.tracking_number && <>Tracking no. <span className="font-mono">{data.tracking_number}</span></>}
        </p>
      )}
      <OrderTimeline stage={data.stage} events={data.events} />
    </div>
  );
}