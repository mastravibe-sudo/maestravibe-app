'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useMarket } from '@/lib/market-context';

const VISITOR_ID_KEY = 'mv_anonymous_visitor_id';

function isTrackablePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return !['/admin', '/dashboard', '/supplier', '/login', '/forgot-password'].some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function getVisitorId(): string {
  const existing = window.localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;

  const visitorId = crypto.randomUUID();
  window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
  return visitorId;
}

export default function StorefrontVisitTracker() {
  const pathname = usePathname();
  const { market } = useMarket();
  const trackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isTrackablePath(pathname) || trackedPath.current === pathname) return;
    trackedPath.current = pathname;

    try {
      const trackedMarket = market === 'pk' || market === 'us' ? market : null;
      const body = JSON.stringify({ path: pathname, visitorId: getVisitorId(), market: trackedMarket });
      void fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
        credentials: 'same-origin',
      }).catch(() => {});
    } catch {
      // Tracking must never interfere with storefront rendering.
    }
  }, [market, pathname]);

  return null;
}