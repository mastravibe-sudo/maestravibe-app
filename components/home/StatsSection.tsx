// components/home/StatsSection.tsx
'use client';

import type { SiteSettings } from '@/lib/home/types';

interface StatsSectionProps {
  siteSettings: SiteSettings;
  isPK: boolean;
}

export default function StatsSection({ siteSettings, isPK }: StatsSectionProps) {
  const stats = [
    { num: siteSettings.stats_customers, label: 'Happy Customers' },
    { num: siteSettings.stats_products,  label: 'Products Available' },
    { num: siteSettings.stats_rating,    label: 'Average Rating' },
    { num: isPK ? 'COD' : 'SSL', label: isPK ? 'Cash on Delivery' : 'Secure Checkout' },
  ];

  return (
    <section className="bg-gradient-to-r from-violet-700 via-purple-700 to-violet-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-white text-3xl font-black">{s.num}</p>
              <p className="text-violet-300 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}