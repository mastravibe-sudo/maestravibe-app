// components/home/ProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { MouseEvent } from 'react';
import { formatPrice } from '@/lib/home/helpers';
import { CartIco, CheckIco, EyeIco, FestIco, HeartIco, StarIco } from './icons';

export function ProductBadges({ product, className = '' }: { product: any; className?: string }) {
  const tags: string[] = product.tags ?? [];
  if (tags.length === 0 && !product.festival_tag) return null;
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {product.festival_tag && (
        <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
          <FestIco /> Festival
        </span>
      )}
      {tags.slice(0, 2).map((t: string, i: number) => (
        <span key={i} className="bg-violet-600/90 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-sm whitespace-nowrap">{t}</span>
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: any;
  market: string;
  wishlist: string[];
  addedToCart: string | null;
  onOpenPage: (p: any) => void;
  onQuickView: (p: any) => void;
  onAddToCart: (p: any, color?: string, size?: string) => void;
  onBuyNow: (p: any, color?: string, size?: string) => void;
  onToggleWish: (id: string) => void;
}

// ✅ REDESIGNED: quieter, more premium card — no "Buy Now" on the front
// (browsing should feel like browsing, not a hard sell on every tile).
// A single small circular "quick add" button replaces the old two-button
// row; clicking the image/name still opens the full product page, and the
// hover-revealed eye icon still opens the quick-view modal for a closer
// look without leaving the grid.
export default function ProductCard({
  product, market, wishlist, addedToCart,
  onOpenPage, onQuickView, onAddToCart, onToggleWish,
}: ProductCardProps) {
  const isAdded = addedToCart === product._id;
  const productHref = `/products/${encodeURIComponent(product._id ?? product.id)}`;
  const openProduct = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpenPage(product);
  };

  return (
    <div className="group flex flex-col bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/70 dark:hover:shadow-none dark:hover:border-neutral-700">
      <div className="relative overflow-hidden bg-[#F6F4F0] dark:bg-neutral-800" style={{ aspectRatio: '1 / 1' }}>
        <Link href={productHref} onClick={openProduct} className="absolute inset-0 block" aria-label={`View ${product.name}`}>
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={`${product.name} product photo`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : <span className="flex h-full items-center justify-center text-gray-400">Image unavailable</span>}

          <div className="absolute top-3 left-3 flex max-w-[70%] flex-col gap-1">
            <span className="w-fit rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase text-gray-600 shadow-sm dark:bg-neutral-900/85 dark:text-gray-300">
              {product.category}
            </span>
            <ProductBadges product={product} />
          </div>

          {Number.isFinite(product.discount_percent) && product.discount_percent > 0 && (
            <span className="absolute top-3 right-3 rounded-full bg-rose-500 px-2 py-1 text-[10px] font-black text-white shadow-sm">
              {product.discount_percent}% OFF
            </span>
          )}
        </Link>

        {/* Wishlist + quick-view — revealed on hover, kept out of the way otherwise */}
        <div className="absolute bottom-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={e => { e.stopPropagation(); onToggleWish(product._id); }}
            className="w-11 h-11 bg-white dark:bg-neutral-900 rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
          >
            <HeartIco filled={wishlist.includes(product._id)} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onQuickView(product); }}
            className="w-11 h-11 bg-white dark:bg-neutral-900 rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
          >
            <EyeIco />
          </button>
        </div>

        {/* Single quick-add action — the only "buy" affordance on the card front */}
        <button
          onClick={e => { e.stopPropagation(); onAddToCart(product, product.colors?.[0], product.sizes?.[0]); }}
          aria-label="Add to cart"
          className={`absolute bottom-3 right-3 w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
            isAdded ? 'bg-green-500 text-white scale-95' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-110'
          }`}
        >
          {isAdded ? <CheckIco /> : <CartIco cls="w-4 h-4" />}
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-medium text-sm mb-1.5 line-clamp-2 text-gray-800 dark:text-gray-100">
          <Link href={productHref} onClick={openProduct} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(s => <StarIco key={s} />)}
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">(4.8)</span>
        </div>

        {(product.colors?.length ?? 0) > 0 && (
          <div className="flex gap-1 mb-2.5 flex-wrap">
            {product.colors.slice(0, 6).map((c: string, i: number) => (
              <span
                key={i}
                className="w-3.5 h-3.5 rounded-full border-2 border-white dark:border-neutral-900 shadow-sm ring-1 ring-gray-200 dark:ring-neutral-700 shrink-0"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            {product.colors?.length > 6 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 self-center">+{(product.colors?.length ?? 0) - 6}</span>
            )}
          </div>
        )}

        <p className="text-gray-900 dark:text-white font-bold text-base mt-auto">{formatPrice(product.price, market)}</p>
      </div>
    </div>
  );
}