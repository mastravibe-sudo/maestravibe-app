// components/LikeButton.tsx
'use client';

import { Heart } from 'lucide-react';
import { useLike } from '@/lib/likes-store';

export default function LikeButton({
  productId, showCount = false, className = '',
}: { productId?: string | number | null; showCount?: boolean; className?: string }) {
  const { liked, count, toggle } = useLike(productId);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      aria-pressed={liked}
      aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full min-h-9 min-w-9 px-2 bg-white/90 text-gray-700 shadow-sm hover:text-rose-600 transition-colors ${className}`}
    >
      <Heart className={`w-4.5 h-4.5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} aria-hidden="true" />
      {showCount && <span className="text-xs font-semibold tabular-nums">{count}</span>}
    </button>
  );
}