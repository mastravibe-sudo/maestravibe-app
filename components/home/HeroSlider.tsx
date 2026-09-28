// components/home/HeroSlider.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Slide } from '@/lib/home/types';
import { ChevL, ChevR } from './icons';

function SlideImage({ src, fallback, alt }: { src: string; fallback?: string; alt: string }) {
  const [current, setCurrent] = useState(src);
  return (
    <Image
      src={current}
      alt={alt}
      fill
      priority
      sizes="100vw"
      className="w-full h-full object-cover"
      onError={() => { if (fallback && current !== fallback) setCurrent(fallback); }}
    />
  );
}

interface HeroSliderProps {
  slides: Slide[];
  currentSlide: number;
  setCurrentSlide: (updater: number | ((p: number) => number)) => void;
  onNavigate: (cat: string) => void;
}

export default function HeroSlider({ slides, currentSlide, setCurrentSlide, onNavigate }: HeroSliderProps) {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: 'clamp(280px,55vw,600px)' }}>
      {slides.map((slide, i) => (
        <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <SlideImage src={slide.image} fallback={slide.fallback} alt={slide.title} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8 md:px-20">
            <div className="max-w-lg">
              {slide.tag && <span className="inline-block bg-violet-500/30 backdrop-blur-sm text-violet-200 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">{slide.tag}</span>}
              {i === 0
                ? <h1 className="text-white text-4xl md:text-6xl font-black leading-tight mb-2">{slide.title}</h1>
                : <h2 className="text-white text-4xl md:text-6xl font-black leading-tight mb-2">{slide.title}</h2>}
              {slide.sub && <p className="text-white/75 text-sm mb-8">{slide.sub}</p>}
              <div className="flex gap-3">
                <button onClick={() => onNavigate(slide.buttonLink === 'all' ? 'all' : slide.buttonLink)} className="bg-violet-600 hover:bg-violet-500 active:scale-95 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-600/40">{slide.buttonLabel}</button>
                <button onClick={() => onNavigate('sale')} className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition-all border border-white/30">View Sale 🔥</button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((s, i) => (
          <button key={s.id} onClick={() => setCurrentSlide(i)} className={`transition-all rounded-full ${i === currentSlide ? 'w-7 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'}`} />
        ))}
      </div>
      <button onClick={() => setCurrentSlide(p => (p - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"><ChevL /></button>
      <button onClick={() => setCurrentSlide(p => (p + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"><ChevR /></button>
    </section>
  );
}