// components/home/ShopView.tsx
'use client';

import { SORT_OPTIONS } from '@/lib/home/constants';
import type { CategoryForGrid, MarketConfigEntry } from '@/lib/home/types';
import ProductCard from './ProductCard';
import Skeleton from './Skeleton';
import { CloseIco, SearchIco } from './icons';

interface ShopViewProps {
  activeCategory: string;
  searchQuery: string;
  searchInput: string;
  sortBy: string;
  priceMin: string;
  priceMax: string;
  selectedColors: string[];
  selectedSizes: string[];
  showFilters: boolean;
  allColors: string[];
  allSizes: string[];
  categoriesForFilter: CategoryForGrid[];
  filtered: any[];
  productsLoading: boolean;
  market: string;
  marketCfg: MarketConfigEntry;
  wishlist: string[];
  addedToCart: string | null;
  activeFiltersCount: number;

  onGoHome: () => void;
  onSearchInputChange: (v: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSetActiveCategory: (v: string) => void;
  onClearSearch: () => void;
  onSetSortBy: (v: string) => void;
  onToggleFilters: () => void;
  onSetPriceMin: (v: string) => void;
  onSetPriceMax: (v: string) => void;
  onToggleColor: (c: string) => void;
  onToggleSize: (s: string) => void;
  onClearFilters: () => void;
  onResetAll: () => void;

  onOpenPage: (p: any) => void;
  onQuickView: (p: any) => void;
  onAddToCart: (p: any, color?: string, size?: string) => void;
  onBuyNow: (p: any, color?: string, size?: string) => void;
  onToggleWish: (id: string) => void;
}

export default function ShopView({
  activeCategory, searchQuery, searchInput, sortBy, priceMin, priceMax,
  selectedColors, selectedSizes, showFilters, allColors, allSizes,
  categoriesForFilter, filtered, productsLoading, market, marketCfg,
  wishlist, addedToCart, activeFiltersCount,
  onGoHome, onSearchInputChange, onSearchSubmit, onSetActiveCategory, onClearSearch,
  onSetSortBy, onToggleFilters, onSetPriceMin, onSetPriceMax, onToggleColor, onToggleSize,
  onClearFilters, onResetAll,
  onOpenPage, onQuickView, onAddToCart, onBuyNow, onToggleWish,
}: ShopViewProps) {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 pt-5 pb-2 flex items-center gap-2 text-xs text-gray-500">
        <button onClick={onGoHome} className="hover:text-violet-600 font-medium">Home</button>
        <span>/</span>
        <span className="font-semibold text-gray-700 capitalize">
          {activeCategory !== 'all' ? categoriesForFilter.find(c => c.value === activeCategory)?.label : 'All Products'}
          {searchQuery && ` — "${searchQuery}"`}
        </span>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <form onSubmit={onSearchSubmit} className="flex gap-2">
          <div className="relative flex-1 max-w-lg">
            <input type="text" value={searchInput} onChange={e => onSearchInputChange(e.target.value)} placeholder="Search by product, category, color…" className="w-full border-2 border-gray-200 rounded-xl py-2.5 pl-4 pr-11 text-sm focus:outline-none focus:border-violet-500 transition-colors bg-white" />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg w-7 h-7 flex items-center justify-center transition-colors"><SearchIco /></button>
          </div>
        </form>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {categoriesForFilter.map(cat => (
            <button key={cat.value} onClick={() => onSetActiveCategory(cat.value)} className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeCategory === cat.value ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-violet-50 hover:text-violet-600 border border-gray-200'}`}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {activeCategory !== 'all' && <span className="bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-violet-100">{categoriesForFilter.find(c => c.value === activeCategory)?.label}<button onClick={() => onSetActiveCategory('all')} className="hover:text-violet-900"><CloseIco /></button></span>}
            {searchQuery && <span className="bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-violet-100">&ldquo;{searchQuery}&rdquo;<button onClick={onClearSearch} className="hover:text-violet-900"><CloseIco /></button></span>}
            <span className="text-xs text-gray-400 font-medium">{filtered.length} products</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{marketCfg.flag} {marketCfg.symbol}</span>
            <select value={sortBy} onChange={e => onSetSortBy(e.target.value)} className="text-xs border-2 border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-violet-500 bg-white transition-colors">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={onToggleFilters} className="flex items-center gap-2 text-xs bg-white border-2 border-gray-200 hover:border-violet-400 hover:text-violet-600 px-3 py-2 rounded-xl font-semibold transition-colors relative">
              Filters {activeFiltersCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{activeFiltersCount}</span>}
            </button>
          </div>
        </div>
        <div className="flex gap-6">
          {showFilters && (
            <aside className="w-52 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24 space-y-5">
                <div className="flex items-center justify-between"><h3 className="font-black text-sm text-gray-800">Filters</h3>{activeFiltersCount > 0 && <button onClick={onClearFilters} className="text-xs text-violet-500 font-semibold hover:text-violet-700">Clear all</button>}</div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price ({marketCfg.symbol})</p>
                  <div className="flex gap-2 mb-2">
                    <input type="number" placeholder="Min" value={priceMin} onChange={e => onSetPriceMin(e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-violet-400 transition-colors" />
                    <input type="number" placeholder="Max" value={priceMax} onChange={e => onSetPriceMax(e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-violet-400 transition-colors" />
                  </div>
                </div>
                {allColors.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Colors</p>
                    <div className="flex flex-wrap gap-2">{allColors.slice(0, 16).map((c: string, i: number) => <button key={i} onClick={() => onToggleColor(c)} title={c} className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColors.includes(c) ? 'border-violet-500 scale-110 shadow-md' : 'border-gray-200 hover:border-violet-300'}`} style={{ backgroundColor: c }} />)}</div>
                  </div>
                )}
                {allSizes.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sizes</p>
                    <div className="flex flex-wrap gap-1.5">{allSizes.map((s: string, i: number) => <button key={i} onClick={() => onToggleSize(s)} className={`px-2.5 py-1 text-xs rounded-lg border-2 font-semibold transition-colors ${selectedSizes.includes(s) ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-600 hover:border-violet-300'}`}>{s}</button>)}</div>
                  </div>
                )}
              </div>
            </aside>
          )}
          <div className="flex-1 min-w-0">
            {productsLoading ? <Skeleton /> : filtered.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg font-semibold">No products found</p>
                <button onClick={onResetAll} className="mt-5 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">View All Products</button>
              </div>
            ) : (
              <div className={`grid gap-5 ${showFilters ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                {filtered.map((product: any, idx: number) => (
                  <ProductCard
                    key={product._id ?? idx}
                    product={product}
                    market={market}
                    wishlist={wishlist}
                    addedToCart={addedToCart}
                    onOpenPage={onOpenPage}
                    onQuickView={onQuickView}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    onToggleWish={onToggleWish}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}