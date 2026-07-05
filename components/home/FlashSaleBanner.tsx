// components/home/FlashSaleBanner.tsx
'use client';

import CountdownTimer from './CountdownTimer';
import { FlashIco } from './icons';

interface FlashSaleBannerProps {
  discount: number;
  endsAt: string;
  category: string;
  onNavigate: (cat: string) => void;
}

export default function FlashSaleBanner({ discount, endsAt, category, onNavigate }: FlashSaleBannerProps) {
  return (
    <section className="bg-gradient-to-r from-rose-600 to-orange-500 py-5">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2.5"><FlashIco /></div>
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">Limited Time</p>
            <h3 className="text-white font-black text-xl">Flash Sale — Up to {discount}% Off!</h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-white/70 text-xs mb-1 font-medium">Ends in</p>
            <CountdownTimer endsAt={endsAt} />
          </div>
          <button onClick={() => onNavigate(category)} className="bg-white text-rose-600 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-rose-50 transition-colors shadow-lg shrink-0">Shop Sale →</button>
        </div>
      </div>
    </section>
  );
}