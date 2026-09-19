// components/home/FlashSaleBanner.tsx
'use client';

import CountdownTimer from './CountdownTimer';
import { FlashIco } from './icons';
import { themeGradientClass, themeTextClass } from '@/lib/home/theme-gradients';

interface FlashSaleBannerProps {
  discount: number;
  endsAt: string;
  category: string;
  theme?: string;
  label?: string;
  image?: string;
  onNavigate: (cat: string) => void;
}

export default function FlashSaleBanner({ discount, endsAt, category, theme, label, image, onNavigate }: FlashSaleBannerProps) {
  const gradient = themeGradientClass(theme);
  const textClass = themeTextClass(theme);

  return (
    <section className={`relative overflow-hidden bg-gradient-to-r ${gradient} py-5`}>
      {image && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-70`} />
        </>
      )}
      <div className="relative max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2.5"><FlashIco /></div>
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">Limited Time</p>
            <h3 className="text-white font-black text-xl">{label || `Flash Sale — Up to ${discount}% Off!`}</h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-white/70 text-xs mb-1 font-medium">Ends in</p>
            <CountdownTimer endsAt={endsAt} />
          </div>
          <button
            onClick={() => onNavigate(category)}
            className={`bg-white ${textClass} px-6 py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition-opacity shadow-lg shrink-0`}
          >
            Shop Sale →
          </button>
        </div>
      </div>
    </section>
  );
}