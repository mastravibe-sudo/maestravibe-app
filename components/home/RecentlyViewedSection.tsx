// components/home/RecentlyViewedSection.tsx
'use client';

import { formatPrice, saveRecentlyViewed } from '@/lib/home/helpers';
import { CartIco, CheckIco, HeartIco } from './icons';

interface RecentlyViewedSectionProps {
  items: any[];
  market: string;
  onOpen: (p: any) => void;
  onAddToCart: (p: any) => void;
  onBuyNow: (p: any) => void;
  wishlist: string[];
  onToggleWish: (id: string) => void;
  addedToCart: string | null;
}

export default function RecentlyViewedSection({
  items, market, onOpen, onAddToCart, onBuyNow, wishlist, onToggleWish, addedToCart,
}: RecentlyViewedSectionProps) {
  if (items.length === 0) return null;
  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Your History</p>
            <h2 className="text-2xl font-black text-gray-800">Recently Viewed</h2>
          </div>
          <button onClick={() => { saveRecentlyViewed([]); window.location.reload(); }} className="text-xs text-gray-400 hover:text-gray-600 font-medium underline">Clear</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map((product: any, idx: number) => (
            <div key={product._id ?? idx} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col">
              <div className="relative overflow-hidden cursor-pointer bg-gray-50" style={{ height: '210px' }}>
                <img src={product.images?.[0] ?? 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} onClick={() => onOpen(product)} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button onClick={e => { e.stopPropagation(); onToggleWish(product._id); }} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"><HeartIco filled={wishlist.includes(product._id)} /></button>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 onClick={() => onOpen(product)} className="font-semibold text-sm mb-2 line-clamp-2 cursor-pointer hover:text-violet-600 transition-colors text-gray-800">{product.name}</h3>
                <p className="text-violet-700 font-black text-lg mt-auto mb-3">{formatPrice(product.price, market)}</p>
                <div className="flex gap-2">
                  <button onClick={() => onAddToCart(product)} className={`flex-1 py-2.5 text-xs rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${addedToCart === product._id ? 'bg-green-500 text-white scale-95' : 'bg-gray-900 text-white hover:bg-gray-700'}`}>
                    {addedToCart === product._id ? <><CheckIco /> Added</> : <><CartIco cls="w-3.5 h-3.5" /> Add to Cart</>}
                  </button>
                  <button onClick={() => onBuyNow(product)} className="flex-1 py-2.5 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-all duration-200">Buy Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}