// components/home/TrendingNowSection.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { formatPrice } from '@/lib/home/helpers';
import { CartIco, CheckIco, FlashIco, HeartIco, TrendIco } from './icons';

interface TrendingNowSectionProps {
  items: any[];
  market: string;
  onOpen: (p: any) => void;
  onAddToCart: (p: any) => void;
  onBuyNow: (p: any) => void;
  wishlist: string[];
  onToggleWish: (id: string) => void;
  addedToCart: string | null;
}

export default function TrendingNowSection({
  items, market, onOpen, onAddToCart, onBuyNow, wishlist, onToggleWish, addedToCart,
}: TrendingNowSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const loopItems = items.length > 0 ? [...items, ...items] : [];

  useEffect(() => {
    if (items.length === 0) return;
    const track = trackRef.current;
    if (!track) return;
    let raf: number;
    const speed = 0.6;
    const step = () => {
      if (!paused && track) {
        track.scrollLeft += speed;
        if (track.scrollLeft >= track.scrollWidth / 2) track.scrollLeft -= track.scrollWidth / 2;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, items.length]);

  if (items.length === 0) return null;

  return (
    <section className="py-10 bg-gradient-to-b from-violet-50/60 to-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shrink-0"><TrendIco /></div>
            <div>
              <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Hot right now</p>
              <h2 className="text-2xl font-black text-gray-800">Trending Now</h2>
            </div>
          </div>
          <span className="hidden md:inline-flex text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full">🔥 Updated live</span>
        </div>
      </div>
      <div ref={trackRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)} className="flex gap-5 overflow-x-hidden px-4 max-w-7xl mx-auto" style={{ scrollBehavior: 'auto' }}>
        {loopItems.map((product: any, idx: number) => (
          <div key={`${product._id ?? idx}-${idx}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group border border-gray-100 flex flex-col shrink-0" style={{ width: '230px' }}>
            <div className="relative overflow-hidden cursor-pointer bg-gray-50" style={{ height: '190px' }}>
              <img src={product.images?.[0] ?? 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} onClick={() => onOpen(product)} draggable={false} />
              <div className="absolute top-2 left-2"><span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><FlashIco /> Trending</span></div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button onClick={e => { e.stopPropagation(); onToggleWish(product._id); }} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"><HeartIco filled={wishlist.includes(product._id)} /></button>
              </div>
            </div>
            <div className="p-3.5 flex flex-col flex-1">
              <h3 onClick={() => onOpen(product)} className="font-semibold text-sm mb-2 line-clamp-2 cursor-pointer hover:text-violet-600 transition-colors text-gray-800">{product.name}</h3>
              <p className="text-violet-700 font-black text-base mt-auto mb-3">{formatPrice(product.price, market)}</p>
              <div className="flex gap-2">
                <button onClick={() => onAddToCart(product)} className={`flex-1 py-2 text-xs rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${addedToCart === product._id ? 'bg-green-500 text-white scale-95' : 'bg-gray-900 text-white hover:bg-gray-700'}`}>
                  {addedToCart === product._id ? <><CheckIco /> Added</> : <><CartIco cls="w-3.5 h-3.5" /> Add</>}
                </button>
                <button onClick={() => onBuyNow(product)} className="flex-1 py-2 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-all duration-200">Buy Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}