'use client';

// components/ProductGrid.tsx
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

interface Props {
  onAddToCart?: (product: Product) => void;
  initialProducts?: Product[];
}

const CATEGORIES = ['all', 'fashion', 'electronics', 'home', 'beauty', 'sports'];

export default function ProductGrid({ onAddToCart, initialProducts }: Props) {
  const [products,  setProducts]  = useState<Product[]>(initialProducts ?? []);
  const [filtered,  setFiltered]  = useState<Product[]>(initialProducts ?? []);
  const [loading,   setLoading]   = useState(initialProducts === undefined);
  const [category,  setCategory]  = useState('all');
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    if (initialProducts !== undefined) return;
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : [];
        setProducts(rows);
        setFiltered(rows);
      })
      .finally(() => setLoading(false));
  }, [initialProducts]);

  useEffect(() => {
    let result = products;
    if (category !== 'all') result = result.filter((p) => p.category === category);
    if (search.trim())       result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [category, search, products]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                category === c
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-purple-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading products...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No products found</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}