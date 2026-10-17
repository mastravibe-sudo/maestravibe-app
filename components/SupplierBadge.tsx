// components/SupplierBadge.tsx
'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, Loader2, Store, UserCheck, UserPlus } from 'lucide-react';

type Info = { id: string; name: string; code: string; avatar?: string | null; followers: number; following: boolean };

export default function SupplierBadge({ supplierId, className = '' }: { supplierId?: string | null; className?: string }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!supplierId) return;
    let cancelled = false;
    fetch(`/api/suppliers/${encodeURIComponent(supplierId)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled) setInfo(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [supplierId]);

  if (!supplierId) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
        <Store className="w-4 h-4" aria-hidden="true" /> Sold by <span className="font-semibold">Maestra Market</span>
      </div>
    );
  }
  if (!info) return <div className={`h-14 rounded-xl bg-gray-100 animate-pulse ${className}`} aria-hidden="true" />;

  const toggle = async () => {
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/follows', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ supplierId: info.id }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(d.message || 'Could not update follow'); return; }
      setInfo({ ...info, following: d.following, followers: d.followers });
    } finally { setBusy(false); }
  };

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-3 sm:p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {info.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={info.avatar} alt={info.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <span className="grid place-items-center w-10 h-10 rounded-full bg-violet-100 text-violet-700 shrink-0">
              <Store className="w-5 h-5" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1">
              {info.name} <BadgeCheck className="w-4 h-4 text-violet-600 shrink-0" aria-label="Verified supplier" />
            </p>
            <p className="text-xs text-gray-500">Supplier ID: <span className="font-mono">{info.code}</span> &middot; {info.followers} {info.followers === 1 ? 'follower' : 'followers'}</p>
          </div>
        </div>
        <button
          type="button" onClick={toggle} disabled={busy} aria-pressed={info.following}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold min-h-10 transition-colors disabled:opacity-60 ${
            info.following ? 'bg-violet-100 text-violet-700' : 'bg-violet-600 text-white hover:bg-violet-700'
          }`}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            : info.following ? <UserCheck className="w-4 h-4" aria-hidden="true" /> : <UserPlus className="w-4 h-4" aria-hidden="true" />}
          {info.following ? 'Following' : 'Follow'}
        </button>
      </div>
      {msg && <p className="mt-2 text-xs text-rose-600" role="status">{msg}</p>}
    </div>
  );
}