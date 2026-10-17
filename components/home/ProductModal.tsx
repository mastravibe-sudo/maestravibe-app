// components/home/ProductModal.tsx
'use client';

import { useEffect } from 'react';
import { Package } from 'lucide-react';
import { findVariant, formatPrice } from '@/lib/home/helpers';
import { ProductBadges } from './ProductCard';
import { CartIco, CloseIco, EyeIco } from './icons';
import LikeButton from '@/components/LikeButton';
import RatingStars from '@/components/RatingStars';
import SupplierBadge from '@/components/SupplierBadge';

interface ProductModalProps {
  product: any;
  market: string;
  selectedColor: string;
  selectedSize: string;
  selectedImageIndex: number;
  onSelectColor: (c: string) => void;
  onSelectSize: (s: string) => void;
  onSelectImageIndex: (i: number) => void;
  onClose: () => void;
  onAddToCart: (p: any) => void;
  onBuyNow: (p: any) => void;
  onViewFullDetails: (p: any) => void;
}

// Quick view: real rating, own like button, supplier ID, Escape / backdrop to close, no emoji.
export default function ProductModal({
  product, market, selectedColor, selectedSize, selectedImageIndex,
  onSelectColor, onSelectSize, onSelectImageIndex,
  onClose, onAddToCart, onBuyNow, onViewFullDetails,
}: ProductModalProps) {
  const pid = String(product._id ?? product.id ?? '');
  const activeVariant = findVariant(product, selectedSize, selectedColor);
  const modalPrice = activeVariant ? activeVariant.price : product.price;
  const modalOutOfStock = activeVariant && activeVariant.stock !== null && activeVariant.stock !== undefined && activeVariant.stock <= 0;
  const mainImage = product.images?.[selectedImageIndex];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className="bg-white dark:bg-neutral-900 w-full md:max-w-4xl rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[94vh] overflow-y-auto border border-transparent dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-4 sm:p-6 bg-[#F6F4F0] dark:bg-neutral-800 flex items-center justify-center">
            <div className="w-full">
              {mainImage ? (
                <img src={mainImage} className="w-full rounded-2xl object-contain max-h-60 sm:max-h-80" alt={product.name} />
              ) : (
                <div className="grid place-items-center h-48 text-gray-300"><Package className="w-14 h-14" aria-hidden="true" /></div>
              )}
              {product.images?.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {product.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => onSelectImageIndex(i)}
                      aria-label={`Show image ${i + 1}`}
                      className={`rounded-xl border-2 h-16 w-16 shrink-0 overflow-hidden bg-white dark:bg-neutral-900 p-1 transition-all ${
                        selectedImageIndex === i ? 'border-violet-500' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-contain" alt={`t${i}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:w-1/2 p-5 sm:p-6 md:p-8">
            <div className="flex justify-between items-start mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs uppercase text-violet-500 dark:text-violet-400 font-bold tracking-wider capitalize">{product.category}</span>
                  <ProductBadges product={product} />
                </div>
                <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight">{product.name}</h1>
              </div>
              <button onClick={onClose} aria-label="Close" className="w-11 h-11 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-300 transition-colors ml-2 shrink-0">
                <CloseIco />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <RatingStars productId={pid} />
              <LikeButton productId={pid} showCount className="border border-gray-200" />
            </div>

            <div className="flex items-baseline gap-2 mb-5 pb-5 border-b border-gray-100 dark:border-neutral-800 flex-wrap">
              <p className="text-3xl font-black text-gray-900 dark:text-white">{formatPrice(modalPrice, market)}</p>
              {modalOutOfStock && <span className="text-xs text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-full">Out of Stock</span>}
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5 leading-relaxed whitespace-pre-line line-clamp-6">{product.description}</p>

            <SupplierBadge supplierId={product.supplier_id} className="mb-5" />

            {product.colors?.length > 0 && (
              <div className="mb-5">
                <p className="font-semibold text-sm mb-2.5 text-gray-800 dark:text-gray-200">
                  Color <span className="text-gray-400 dark:text-gray-500 font-normal">— {selectedColor}</span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => onSelectColor(color)}
                      title={color}
                      aria-label={`Color ${color}`}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        selectedColor === color ? 'border-violet-500 scale-110' : 'border-gray-200 dark:border-neutral-700 hover:border-violet-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold text-sm mb-2.5 text-gray-800 dark:text-gray-200">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => onSelectSize(size)}
                      className={`px-4 py-2 min-h-10 border-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedSize === size
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:border-violet-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-3">
              <button
                onClick={() => onAddToCart(product)}
                disabled={!!modalOutOfStock}
                className="flex-1 py-3.5 bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-gray-900 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <CartIco cls="w-4 h-4" /> Add to Cart
              </button>
              <button
                onClick={() => onBuyNow(product)}
                disabled={!!modalOutOfStock}
                className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-colors"
              >
                Buy Now
              </button>
            </div>
            <button
              onClick={() => onViewFullDetails(product)}
              className="w-full py-3 border-2 border-gray-200 dark:border-neutral-700 hover:border-violet-400 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <EyeIco /> View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}