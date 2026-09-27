// components/home/SiteFooter.tsx
'use client';

import type { CategoryForGrid, MarketConfigEntry } from '@/lib/home/types';

interface SiteFooterProps {
  marketCfg: MarketConfigEntry;
  categoriesForGrid: CategoryForGrid[];
  onNavigate: (cat: string) => void;
}

export default function SiteFooter({ marketCfg, categoriesForGrid, onNavigate }: SiteFooterProps) {
  const columns = [
    { title: 'Shop',    links: categoriesForGrid.slice(0, 5).map(c => c.label) },
    { title: 'Help',    links: ['Returns', 'Track Order', 'FAQ', 'Contact Us'] },
    { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Press'] },
  ];

  return (
    <footer className="bg-black text-gray-400 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-black text-lg mb-3">Maestra Market</h3>
            <p className="text-sm leading-relaxed">Your one-stop destination for fashion, accessories and more.</p>
            <p className="text-xs mt-3 text-gray-500">{marketCfg.flag} Shipping to {marketCfg.label}</p>
          </div>
          {columns.map((col, i) => (
            <div key={i}>
              <h4 className="text-white font-bold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l}>
                    <button onClick={() => col.title === 'Shop' ? onNavigate(l.toLowerCase()) : undefined} className="text-sm hover:text-violet-400 transition-colors">{l}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs">© {new Date().getFullYear()} Maestra Market. All rights reserved.</p>
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-4">
            <p className="text-xs">Made with ❤️ in Pakistan 🇵🇰</p>
            <p className="text-[10px] text-gray-500">Powered by Maestra Vibe</p>
          </div>
        </div>
      </div>
    </footer>
  );
}