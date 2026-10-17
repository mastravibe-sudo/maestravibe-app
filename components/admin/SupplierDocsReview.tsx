// components/admin/SupplierDocsReview.tsx
'use client';
// Add as a tab in the ADMIN dashboard:  <SupplierDocsReview />

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

type Item = {
  id: string; supplier_id: string; supplier_name: string; kind: string; status: 'pending' | 'approved' | 'rejected';
  review_note?: string | null; ai_checked: boolean; size_kb: number; updated_at: string; url: string | null;
};

export default function SupplierDocsReview() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/supplier-documents?status=${filter}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, [filter]);
  useEffect(load, [load]);

  const decide = async (id: string, status: 'approved' | 'rejected') => {
    const note = status === 'rejected' ? window.prompt('Reason for rejection (shown to the supplier):') ?? '' : '';
    if (status === 'rejected' && !note.trim()) return;
    setBusyId(id);
    await fetch('/api/admin/supplier-documents', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, note }),
    });
    setBusyId('');
    load();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize min-h-9 ${filter === f ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Loading</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">Nothing here.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((it) => (
            <article key={it.id} className="rounded-2xl border border-gray-200 bg-white p-3 space-y-3">
              {it.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.url} alt={`${it.kind.replace('_', ' ')} of ${it.supplier_name}`} className="w-full rounded-lg border border-gray-200" />
              ) : <div className="aspect-[1.58] rounded-lg bg-gray-100" />}
              <div className="text-sm">
                <p className="font-semibold text-gray-900">{it.supplier_name}</p>
                <p className="text-gray-500">{it.kind === 'cnic_front' ? 'CNIC front' : 'CNIC back'} &middot; {it.size_kb} KB{it.ai_checked ? ' \u00b7 AI-screened' : ''}</p>
                {it.review_note && <p className="text-rose-600">Note: {it.review_note}</p>}
              </div>
              {it.status === 'pending' && (
                <div className="flex gap-2">
                  <button type="button" disabled={busyId === it.id} onClick={() => decide(it.id, 'approved')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold py-2 min-h-10 disabled:opacity-60">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Approve
                  </button>
                  <button type="button" disabled={busyId === it.id} onClick={() => decide(it.id, 'rejected')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 text-white text-sm font-semibold py-2 min-h-10 disabled:opacity-60">
                    <XCircle className="w-4 h-4" aria-hidden="true" /> Reject
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}