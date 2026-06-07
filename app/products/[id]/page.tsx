'use client';

// app/product/[id]/page.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Product } from '@/lib/supabase';
import { addToCart } from '@/components/Cart';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product,       setProduct]       = useState<Product | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [activeImage,   setActiveImage]   = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize,  setSelectedSize]  = useState('');
  const [added,         setAdded]         = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => setProduct(d.data ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found.</div>;

  const handleAddToCart = () => {
    addToCart(product, selectedColor || undefined, selectedSize || undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl bg-gray-50 overflow-hidden mb-3">
            {product.images?.[activeImage] ? (
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200">🧥</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    activeImage === i ? 'border-purple-500' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-xs text-purple-500 font-semibold uppercase tracking-widest">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-3">{product.name}</h1>
          <p className="text-3xl font-bold text-purple-700 mb-4">
            Rs. {Number(product.price).toLocaleString()}
          </p>
          {product.description && (
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">{product.description}</p>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Color</p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      selectedColor === c
                        ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-purple-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      selectedSize === s
                        ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-purple-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
              added ? 'bg-green-500' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {added ? '✓ Added to Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}