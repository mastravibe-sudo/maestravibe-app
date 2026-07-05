// components/home/ProductCard.tsx
'use client';

import { formatPrice } from '@/lib/home/helpers';
import { CartIco, CheckIco, EyeIco, FestIco, HeartIco, StarIco } from './icons';

export function ProductBadges({ product, className = '' }: { product: any; className?: string }) {
  const tags: string[] = product.tags ?? [];
  if (tags.length === 0 && !product.festival_tag) return null;
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {product.festival_tag && (
        <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
          <FestIco /> Festival
        </span>
      )}
      {tags.slice(0, 2).map((t: string, i: number) => (
        <span key={i} className="bg-violet-600/90 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm whitespace-nowrap">{t}</span>
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

export default function ProductCard({
  product, market, wishlist, addedToCart,
  onOpenPage, onQuickView, onAddToCart, onBuyNow, onToggleWish,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col">
      <div className="relative overflow-hidden cursor-pointer bg-gray-50" style={{ height: '210px' }}>
        <img
          src={product.images?.[0] ?? 'https://via.placeholder.com/400'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={product.name}
          onClick={() => onOpenPage(product)}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1 max-w-[70%]">
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2.5 py-1 rounded-full font-semibold capitalize shadow-sm w-fit">{product.category}</span>
          <ProductBadges product={product} />
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <button onClick={e => { e.stopPropagation(); onToggleWish(product._id); }} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform">
            <HeartIco filled={wishlist.includes(product._id)} />
          </button>
          <button onClick={e => { e.stopPropagation(); onQuickView(product); }} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform">
            <EyeIco />
          </button>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" onClick={() => onOpenPage(product)} />
        {Number.isFinite(product.discount_percent) && product.discount_percent > 0 && (
          <span className="absolute top-2 left-2 mt-12 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm">
            {product.discount_percent}% OFF
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 onClick={() => onOpenPage(product)} className="font-semibold text-sm mb-1.5 line-clamp-2 cursor-pointer hover:text-violet-600 transition-colors text-gray-800">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">{[1,2,3,4,5].map(s => <StarIco key={s} />)}<span className="text-xs text-gray-400 ml-1">(4.8)</span></div>
        {(product.colors?.length ?? 0) > 0 && (
          <div className="flex gap-1 mb-2.5 flex-wrap">
            {product.colors.slice(0, 6).map((c: string, i: number) => <span key={i} className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 shrink-0" style={{ backgroundColor: c }} title={c} />)}
            {product.colors?.length > 6 && <span className="text-xs text-gray-400 self-center">+{(product.colors?.length ?? 0) - 6}</span>}
          </div>
        )}
        <p className="text-violet-700 font-black text-lg mt-auto mb-3">{formatPrice(product.price, market)}</p>
        <div className="flex gap-2">
          <button onClick={() => onAddToCart(product, product.colors?.[0], product.sizes?.[0])} className={`flex-1 py-2.5 text-xs rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${addedToCart === product._id ? 'bg-green-500 text-white scale-95' : 'bg-gray-900 text-white hover:bg-gray-700'}`}>
            {addedToCart === product._id ? <><CheckIco /> Added</> : <><CartIco cls="w-3.5 h-3.5" /> Add to Cart</>}
          </button>
          <button onClick={() => onBuyNow(product, product.colors?.[0], product.sizes?.[0])} className="flex-1 py-2.5 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-all duration-200">Buy Now</button>
        </div>
      </div>
    </div>
  );
}