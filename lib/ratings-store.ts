// lib/ratings-store.ts
'use client';

import { useEffect, useSyncExternalStore } from 'react';

export type RatingInfo = { avg: number; count: number };

const cache = new Map<string, RatingInfo>();
const pending = new Set<string>();
const requested = new Set<string>();
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
      const res = await fetch(`/api/reviews/summary?ids=${encodeURIComponent(ids.join(','))}`);
      if (res.ok) {
        const data = await res.json();
        ids.forEach((id) => cache.set(id, data[id] ?? { avg: 0, count: 0 })); // no reviews => count 0
        emit();
      }
    } catch { /* leave unknown */ }
    if (pending.size) schedule();
  }, 40);
}

/** Real rating from the reviews table. Returns null while loading. Never a fake default. */
export function useRating(productId?: string | number | null): RatingInfo | null {
  const pid = productId === undefined || productId === null || productId === '' ? '' : String(productId);
  useSyncExternalStore(subscribe, () => version, () => 0);
  useEffect(() => {
    if (!pid || requested.has(pid)) return;
    requested.add(pid);
    pending.add(pid);
    schedule();
  }, [pid]);
  return pid ? cache.get(pid) ?? null : null;
}

/** Call after a customer submits a review so the stars refresh. */
export function refreshRating(productId: string | number) {
  const pid = String(productId);
  requested.delete(pid);
  cache.delete(pid);
  pending.add(pid);
  requested.add(pid);
  schedule();
}