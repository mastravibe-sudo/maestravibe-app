'use client';

import Image from 'next/image';
import { useState } from 'react';
import { addToCart } from '@/components/Cart';
import type { Product } from '@/lib/supabase';
import { displayPrice, type Market } from '@/lib/market';
import { useMarket } from '@/lib/market-context';

export default function ProductPageClient({ product }: { product: Product }) {
  const { market } = useMarket();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? '');
  const [added, setAdded] = useState(false);
  const images = product.images ?? [];

  const handleAddToCart = () => {
    addToCart(product, selectedColor || undefined, selectedSize || undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <div className="relative aspect-square rounded-2xl bg-gray-50 overflow-hidden mb-3">
            {images[activeImage] ? (
              <Image
                src={images[activeImage]}
                alt={`${product.name} product photo`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200" aria-hidden="true">Product image unavailable</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  aria-label={`Show ${product.name} image ${index + 1}`}
                  aria-pressed={activeImage === index}
                  onClick={() => setActiveImage(index)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${activeImage === index ? 'border-purple-500' : 'border-transparent'}`}
                >
                  <Image src={image} alt={`${product.name}, image ${index + 1}`} fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="text-xs text-purple-500 font-semibold uppercase tracking-widest">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-3">{product.name}</h1>
          <p className="text-3xl font-bold text-purple-700 mb-4">{displayPrice(product.price, market as Market)}</p>
          {product.description && <p className="text-gray-600 text-sm mb-6 leading-relaxed">{product.description}</p>}

          {!!product.colors?.length && (
            <fieldset className="mb-4">
              <legend className="text-sm font-medium text-gray-700 mb-2">Color</legend>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    aria-pressed={selectedColor === color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${selectedColor === color ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {!!product.sizes?.length && (
            <fieldset className="mb-6">
              <legend className="text-sm font-medium text-gray-700 mb-2">Size</legend>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${selectedSize === size ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${added ? 'bg-green-500' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {added ? 'Added to Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </section>
  );
}
