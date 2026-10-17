// components/home/CategoriesSection.tsx
'use client';
// Swipe row on phones/tablets (native scroll-snap, no arrow buttons), clean grid on laptops. Icons only, no emoji.

import Image from 'next/image';
import { Tag } from 'lucide-react';

interface Cat { label: string; value: string; image?: string; emoji?: string }

export default function CategoriesSection({
  categories, onNavigate,
}: { categories: Cat[]; onNavigate: (cat?: string, q?: string) => void }) {
  return (
    <section className="py-8 sm:py-10 bg-white border-t border-gray-100" aria-labelledby="categories-heading">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Browse</p>
            <h2 id="categories-heading" className="text-xl sm:text-2xl font-black text-gray-800">Shop by Category</h2>
          </div>
          <button type="button" onClick={() => onNavigate('all')} className="text-sm text-violet-600 font-semibold hover:underline min-h-9 px-1">
            View all
          </button>
        </div>

        <ul className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-6 md:overflow-visible">
          {categories.map((c) => (
            <li key={c.value} className="snap-start shrink-0 w-[38%] sm:w-[26%] md:w-auto">
              <button type="button" onClick={() => onNavigate(c.value)} className="group block w-full text-left">
                <span className="relative block aspect-square rounded-2xl overflow-hidden bg-gray-100">
                  {c.image ? (
                    <Image
                      src={c.image}
                      alt={c.label}
                      fill
                      sizes="(max-width: 640px) 38vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      draggable={false}
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center text-violet-500">
                      <Tag className="w-8 h-8" aria-hidden="true" />
                    </span>
                  )}
                </span>
                <span className="mt-2 block text-center text-sm font-semibold text-gray-800">{c.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}