// components/home/TestimonialsSection.tsx
'use client';

import { TESTIMONIALS } from '@/lib/home/constants';
import { StarIco } from './icons';

export default function TestimonialsSection() {
  return (
    <section className="py-14 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Reviews</p>
          <h2 className="text-2xl font-black text-gray-800">What Customers Say</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {TESTIMONIALS.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all">
              <div className="flex gap-0.5 mb-3">{[1,2,3,4,5].map(s => <StarIco key={s} />)}</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs">{r.name[0]}</div>
                <div><p className="text-sm font-bold text-gray-800">{r.name}</p><p className="text-xs text-gray-400">{r.city}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}