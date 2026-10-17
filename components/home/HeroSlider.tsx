// components/home/HeroSlider.tsx
'use client';
// Touch-first slider: native horizontal scroll + scroll-snap (swipe works on every phone/tablet),
// auto-play stays controlled by the parent, dots only, NO arrow buttons.

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { Slide } from '@/lib/home/types';

interface Props {
  slides: Slide[];
  currentSlide: number;
  setCurrentSlide: (i: number) => void;
  onNavigate: (cat?: string, q?: string) => void;
}

export default function HeroSlider({ slides, currentSlide, setCurrentSlide, onNavigate }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const indexFromScroll = () => {
    const el = trackRef.current;
    return !el || !el.clientWidth ? 0 : Math.round(el.scrollLeft / el.clientWidth);
  };

  // Parent auto-play (or a dot tap) changed the slide: scroll to it.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (indexFromScroll() !== currentSlide) el.scrollTo({ left: currentSlide * el.clientWidth, behavior: 'smooth' });
  }, [currentSlide]);

  // The visitor swiped: tell the parent which slide is showing.
  const onScroll = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const i = indexFromScroll();
      if (i !== currentSlide) setCurrentSlide(i);
    }, 90);
  };

  const go = (link?: string) => {
    if (!link) return onNavigate('all');
    if (/^https?:\/\//.test(link) || link.startsWith('/')) { window.location.assign(link); return; }
    onNavigate(link);
  };

  if (slides.length === 0) return null;

  return (
    <section aria-label="Featured offers" className="relative">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <div key={s.id} className="relative shrink-0 w-full snap-center aspect-[4/3] sm:aspect-[16/8] lg:aspect-[21/8]">
            {s.image ? (
              <Image src={s.image} alt={s.title || 'Offer'} fill priority={i === 0} sizes="100vw" className="object-cover" draggable={false} />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-violet-700 to-indigo-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-5 sm:px-10 lg:px-16 max-w-xl text-white">
                {s.tag && (
                  <span className="inline-block mb-2 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                    {s.tag}
                  </span>
                )}
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight">{s.title}</h2>
                {s.sub && <p className="mt-2 text-sm sm:text-base text-white/85 line-clamp-2">{s.sub}</p>}
                <button
                  type="button"
                  onClick={() => go(s.buttonLink)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white text-violet-700 font-bold text-sm px-5 py-2.5 min-h-11 hover:bg-violet-50 transition-colors"
                >
                  {s.buttonLabel || 'Shop Now'} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-2 inset-x-0 flex justify-center">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === currentSlide}
              className="p-2"
            >
              <span className={`block h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}