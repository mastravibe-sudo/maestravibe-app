// components/home/ProductCard.tsx
'use client';
// Product card with: its own like button, REAL rating, supplier ID, responsive buttons. Icons only, no emoji.
// Same props as before, so ClientHome and the other sections keep working. Back up your old card first.

import Image from 'next/image';
import { Eye, Package, ShoppingCart, Store, Zap } from 'lucide-react';
import { MARKET_CONFIG } from '@/lib/home/constants';
import LikeButton from '@/components/LikeButton';
import RatingStars from '@/components/RatingStars';

interface Props {
  product: any;
  market: string;
  wishlist?: string[];
  addedToCart?: string | null;
  onOpenPage: (p: any) => void;
  onQuickView: (p: any) => void;
  onAddToCart: (p: any, color?: string, size?: string, qty?: number) => void;
  onBuyNow: (p: any, color?: string, size?: string, qty?: number) => void;
  onToggleWish?: (id: string) => void; // kept for compatibility; likes are handled by LikeButton now
}

/** Tag pills (New Arrival, Best Seller, Trending...). Also used by ProductDetailPage and the quick view. */
export function ProductBadges({ product, max = 3 }: { product: any; max?: number }) {
  const raw: any[] = [...(Array.isArray(product?.tags) ? product.tags : []), product?.festival_tag];
  const tags = [...new Set(raw.filter((t): t is string => typeof t === 'string' && t.trim() !== ''))].slice(0, max);
  if (tags.length === 0) return null;
  return (
    <>
      {tags.map((t) => (
        <span key={t} className="rounded-full bg-violet-100 text-violet-700 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold">{t}</span>
      ))}
    </>
  );
}

export default function ProductCard({ product, market, addedToCart, onOpenPage, onQuickView, onAddToCart, onBuyNow }: Props) {
  const id = String(product._id ?? product.id ?? '');
  const symbol = (MARKET_CONFIG as any)[market]?.symbol ?? '';
  const image = product.images?.[0];
  const price = Number(product.price) || 0;
  const compare = Number(product.compare_price ?? product.original_price ?? 0);
  const discount = compare > price ? Math.round((1 - price / compare) * 100) : 0;
  const supplierCode = product.supplier_id ? 'SUP-' + String(product.supplier_id).replace(/-/g, '').slice(-6).toUpperCase() : '';
  const added = addedToCart === id;

  return (
    <article className="group flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <button type="button" onClick={() => onOpenPage(product)} className="relative block w-full aspect-square bg-gray-100" aria-label={`Open ${product.name}`}>
          {image ? (
            <Image src={image} alt={product.name ?? 'Product'} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-gray-400"><Package className="w-10 h-10" aria-hidden="true" /></span>
          )}
        </button>

        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          <ProductBadges product={product} max={1} />
          {discount > 0 && <span className="rounded-full bg-rose-600 text-white px-2.5 py-0.5 text-[10px] sm:text-xs font-bold">-{discount}%</span>}
        </div>

        <LikeButton productId={id} className="absolute top-2 right-2" />
        <button type="button" onClick={() => onQuickView(product)} aria-label={`Quick view ${product.name}`}
          className="absolute bottom-2 right-2 grid place-items-center w-9 h-9 rounded-full bg-white/90 text-gray-700 shadow-sm hover:text-violet-600">
          <Eye className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <button type="button" onClick={() => onOpenPage(product)} className="text-left text-sm font-semibold text-gray-900 line-clamp-2 min-h-10">
          {product.name}
        </button>
        <p className="flex items-center gap-1 text-[11px] text-gray-500 truncate">
          <Store className="w-3 h-3 shrink-0" aria-hidden="true" />
          {supplierCode ? <>Supplier <span className="font-mono">{supplierCode}</span></> : 'Sold by Maestra Market'}
        </p>
        <RatingStars productId={id} />
        <p className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-black text-gray-900">{symbol}{price.toLocaleString()}</span>
          {discount > 0 && <span className="text-xs text-gray-400 line-through">{symbol}{compare.toLocaleString()}</span>}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          <button type="button" onClick={() => onAddToCart(product, product.colors?.[0], product.sizes?.[0])}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs sm:text-sm font-semibold min-h-10 transition-colors ${added ? 'bg-emerald-600 text-white' : 'bg-violet-600 text-white hover:bg-violet-700'}`}>
            <ShoppingCart className="w-4 h-4 shrink-0" aria-hidden="true" /> {added ? 'Added' : 'Add'}
          </button>
          <button type="button" onClick={() => onBuyNow(product, product.colors?.[0], product.sizes?.[0])}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-violet-600 text-violet-700 px-2 py-2 text-xs sm:text-sm font-semibold min-h-10 hover:bg-violet-50">
            <Zap className="w-4 h-4 shrink-0" aria-hidden="true" /> Buy now
          </button>
        </div>
      </div>
    </article>
  );
}