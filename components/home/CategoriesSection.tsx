// components/home/CategoriesSection.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { CategoryForGrid } from '@/lib/home/types';
import { categorySlug } from '@/lib/seo';
import { ChevL, ChevR } from './icons';

interface CategoriesSectionProps {
  categories: CategoryForGrid[];
  onNavigate: (cat: string) => void;
}

export default function CategoriesSection({ categories, onNavigate }: CategoriesSectionProps) {
  const [catSlide, setCatSlide] = useState(0);

  return (
    <section className="py-12 max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Browse by</p>
          <h2 className="text-2xl font-black text-gray-800">Categories</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCatSlide(p => Math.max(0, p - 1))} className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-violet-400 transition-colors"><ChevL /></button>
          <button onClick={() => setCatSlide(p => Math.min(Math.max(0, categories.length - 4), p + 1))} className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-violet-400 transition-colors"><ChevR /></button>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-4 transition-transform duration-500" style={{ transform: `translateX(-${catSlide * (100 / 4)}%)` }}>
          {categories.map(cat => (
            <Link key={cat.value} href={`/categories/${categorySlug(cat.value)}`} onClick={event => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              onNavigate(cat.value);
            }} className="shrink-0 cursor-pointer group rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300" style={{ width: 'calc(25% - 12px)' }}>
              <div className="relative overflow-hidden" style={{ height: '160px' }}>
                {cat.image
                  ? <Image src={cat.image} alt={`${cat.label} collection`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center bg-violet-50 text-5xl">{cat.emoji || '🛍️'}</div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3"><p className="text-white font-black text-base">{cat.emoji} {cat.label}</p></div>
              </div>
              <div className="p-3 flex items-center justify-between"><span className="text-xs text-gray-500">Explore collection</span><ChevR /></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}