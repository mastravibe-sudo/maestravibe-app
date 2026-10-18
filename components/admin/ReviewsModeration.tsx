// components/admin/ReviewsModeration.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, CheckCircle2, EyeOff, Loader2, Star, Trash2 } from 'lucide-react';

type Item = {
  id: string; product_id: string; product_name: string; customer_name: string; customer_email?: string | null;
  stars: number; body?: string | null; verified: boolean; approved: boolean; created_at: string;
};

export default function ReviewsModeration() {
  const [tab, setTab] = useState<'pending' | 'approved'>('pending');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true); setError('');
    fetch(`/api/admin/reviews?status=${tab}`, { cache: 'no-store' })
      .then(async (r) => { if (!r.ok) throw new Error('Could not load reviews'); return r.json(); })
      .then((d) => setItems(d.items ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tab]);
  useEffect(load, [load]);

  const setApproved = async (id: string, approved: boolean) => {
    setBusyId(id);
    await fetch('/api/admin/reviews', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, approved }) });
    setBusyId(''); load();
  };
  const remove = async (id: string) => {
    if (!window.confirm('Delete this review permanently?')) return;
    setBusyId(id);
    await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setBusyId(''); load();
  };

  return (
    <section className="space-y-4">
      <div className="flex gap-2">
        {(['pending', 'approved'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize min-h-9 ${tab === t ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{t}</button>
        ))}
      </div>

      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      {loading ? (
        <p className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Loading</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">No {tab} reviews.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((r) => (
            <article key={r.id} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">{r.product_name}</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                    {r.customer_name}
                    {r.verified && <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" /> Verified</span>}
                  </p>
                  {r.customer_email && <p className="text-xs text-gray-500 truncate">{r.customer_email}</p>}
                </div>
                <div className="flex shrink-0" aria-label={`${r.stars} stars`}>
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= r.stars ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`} aria-hidden="true" />)}
                </div>
              </div>
              {r.body && <p className="text-sm text-gray-700 whitespace-pre-line">{r.body}</p>}
              <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</p>
              <div className="flex flex-wrap gap-2">
                {tab === 'pending' ? (
                  <button type="button" disabled={busyId === r.id} onClick={() => setApproved(r.id, true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold px-3 py-2 min-h-10 disabled:opacity-60">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Approve
                  </button>
                ) : (
                  <button type="button" disabled={busyId === r.id} onClick={() => setApproved(r.id, false)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-700 text-white text-sm font-semibold px-3 py-2 min-h-10 disabled:opacity-60">
                    <EyeOff className="w-4 h-4" aria-hidden="true" /> Hide
                  </button>
                )}
                <button type="button" disabled={busyId === r.id} onClick={() => remove(r.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 text-white text-sm font-semibold px-3 py-2 min-h-10 disabled:opacity-60">
                  <Trash2 className="w-4 h-4" aria-hidden="true" /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}