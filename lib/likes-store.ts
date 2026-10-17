// lib/likes-store.ts
'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

// Tiny shared store (no provider needed). Every product has its OWN liked flag and count,
// keyed by product id, so liking one product can never light up the others.
const mine = new Set<string>();
const counts = new Map<string, number>();
const requested = new Set<string>();
const pending = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

const emit = () => { version++; listeners.forEach((l) => l()); };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

function schedule() {
  if (timer) return;
  timer = setTimeout(async () => {
    timer = null;
    const ids = [...pending].slice(0, 100);
    ids.forEach((i) => pending.delete(i));
    if (!ids.length) return;
    try {
      const res = await fetch(`/api/likes?ids=${encodeURIComponent(ids.join(','))}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        mine.clear();
        (data.mine ?? []).forEach((id: string) => mine.add(id));
        Object.entries(data.counts ?? {}).forEach(([id, n]) => counts.set(id, Number(n)));
        emit();
      }
    } catch { /* offline: keep UI as is */ }
    if (pending.size) schedule();
  }, 40);
}

export function useLike(productId?: string | number | null) {
  const pid = productId === undefined || productId === null || productId === '' ? '' : String(productId);
  useSyncExternalStore(subscribe, () => version, () => 0);

  useEffect(() => {
    if (!pid || requested.has(pid)) return;
    requested.add(pid);
    pending.add(pid);
    schedule();
  }, [pid]);

  const toggle = useCallback(async () => {
    if (!pid) return;
    const was = mine.has(pid);
    const prevCount = counts.get(pid) ?? 0;
    if (was) { mine.delete(pid); counts.set(pid, Math.max(0, prevCount - 1)); }
    else { mine.add(pid); counts.set(pid, prevCount + 1); }
    emit();
    try {
      const res = await fetch('/api/likes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: pid }),
      });
      if (!res.ok) throw new Error('like failed');
      const d = await res.json();
      if (d.liked) mine.add(pid); else mine.delete(pid);
      counts.set(pid, Number(d.count ?? 0));
    } catch {
      if (was) mine.add(pid); else mine.delete(pid);
      counts.set(pid, prevCount);
    }
    emit();
  }, [pid]);

  return { liked: !!pid && mine.has(pid), count: pid ? counts.get(pid) ?? 0 : 0, toggle };
}