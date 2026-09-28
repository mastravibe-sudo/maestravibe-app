'use client';

import Link from 'next/link';
import type { Product } from '@/lib/supabase';
import { displayPrice } from '@/lib/market';
import { useMarket } from '@/lib/market-context';

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const image = product.images?.[0];
  const { market } = useMarket();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">

      {/* Image */}
      <Link href={`/products/${encodeURIComponent(product.id)}`}>
        <div className="aspect-square bg-gray-50 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
              🧥
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <span className="text-xs text-purple-500 font-medium uppercase tracking-wide">
          {product.category}
        </span>
        
        <Link href={`/products/${encodeURIComponent(product.id)}`}>
          <h3 className="text-gray-800 font-semibold mt-1 hover:text-purple-700 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <p className="text-gray-700 font-bold mt-2 text-xl">
          {displayPrice(product.price, market)}
        </p>

        {/* Colors Preview - Fixed */}
        {product.colors && product.colors?.length > 0 && (
          <div className="flex gap-1 mt-2">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c}
                title={c}
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: c.toLowerCase() }}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => onAddToCart?.(product)}
          className="mt-3 w-full min-h-11 bg-purple-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}