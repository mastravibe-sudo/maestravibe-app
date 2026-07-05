// components/home/FestivalBanner.tsx
'use client';

import { festivalGradient } from '@/lib/home/constants';
import CountdownTimer from './CountdownTimer';
import { FestIco } from './icons';

interface FestivalBannerProps {
  theme: string;
  label: string;
  discount: number;
  endsAt: string;
  category: string;
  onNavigate: (cat: string) => void;
}

export default function FestivalBanner({ theme, label, discount, endsAt, category, onNavigate }: FestivalBannerProps) {
  return (
    <section className={`bg-gradient-to-r ${festivalGradient(theme)} py-5`}>
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2.5"><FestIco /></div>
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">Festival Offer</p>
            <h3 className="text-white font-black text-xl">
              {label || `Festival Sale — Up to ${discount}% Off!`}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-white/70 text-xs mb-1 font-medium">Ends in</p>
            <CountdownTimer endsAt={endsAt} dark={false} />
          </div>
          <button onClick={() => onNavigate(category)} className="bg-white text-gray-900 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-gray-50 transition-colors shadow-lg shrink-0">Shop Now →</button>
        </div>
      </div>
    </section>
  );
}