// components/RatingStars.tsx
'use client';

import { Star } from 'lucide-react';
import { useRating } from '@/lib/ratings-store';

function Row({ cls }: { cls: string }) {
  return (
    <span className="flex shrink-0">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`w-4 h-4 shrink-0 fill-current ${cls}`} aria-hidden="true" />
      ))}
    </span>
  );
}

export default function RatingStars({
  productId, showCount = true, className = '',
}: { productId?: string | number | null; showCount?: boolean; className?: string }) {
  const r = useRating(productId);

  if (!r) return <span className={`inline-block h-4 w-24 rounded bg-gray-200/70 animate-pulse ${className}`} aria-hidden="true" />;
  if (r.count === 0) return <span className={`text-xs text-gray-500 ${className}`}>No reviews yet</span>;

  const pct = Math.max(0, Math.min(100, (r.avg / 5) * 100));
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} aria-label={`Rated ${r.avg} out of 5 from ${r.count} reviews`}>
      <span className="relative inline-flex whitespace-nowrap">
        <Row cls="text-gray-300" />
        <span className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap flex" style={{ width: `${pct}%` }}>
          <Row cls="text-amber-400" />
        </span>
      </span>
      <span className="text-xs font-semibold text-gray-700">{r.avg.toFixed(1)}</span>
      {showCount && <span className="text-xs text-gray-500">({r.count})</span>}
    </span>
  );
}