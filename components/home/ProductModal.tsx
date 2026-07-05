// components/home/ProductModal.tsx
'use client';

import { findVariant, formatPrice } from '@/lib/home/helpers';
import { ProductBadges } from './ProductCard';
import { CartIco, CloseIco, EyeIco } from './icons';

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

export default function ProductModal({
  product, market, selectedColor, selectedSize, selectedImageIndex,
  onSelectColor, onSelectSize, onSelectImageIndex,
  onClose, onAddToCart, onBuyNow, onViewFullDetails,
}: ProductModalProps) {
  const activeVariant = findVariant(product, selectedSize, selectedColor);
  const modalPrice = activeVariant ? activeVariant.price : product.price;
  const modalOutOfStock = activeVariant && activeVariant.stock !== null && activeVariant.stock !== undefined && activeVariant.stock <= 0;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-4xl rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[94vh] overflow-y-auto">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-5 bg-gray-50">
            <img src={product.images?.[selectedImageIndex] ?? 'https://via.placeholder.com/600'} className="w-full rounded-2xl shadow object-cover" style={{ maxHeight: '340px' }} alt={product.name} />
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {product.images.map((img: string, i: number) => (
                  <img key={i} src={img} onClick={() => onSelectImageIndex(i)} className={`cursor-pointer rounded-xl border-2 h-16 w-16 object-cover shrink-0 transition-all ${selectedImageIndex === i ? 'border-violet-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`} alt={`t${i}`} />
                ))}
              </div>
            )}
          </div>
          <div className="md:w-1/2 p-5 md:p-7">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs uppercase text-violet-500 font-bold tracking-wider capitalize">{product.category}</span>
                  <ProductBadges product={product} />
                </div>
                <h1 className="text-xl md:text-2xl font-black mt-0.5 text-gray-900">{product.name}</h1>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors ml-2 shrink-0"><CloseIco /></button>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-3xl font-black text-violet-700">{formatPrice(modalPrice, market)}</p>
              {modalOutOfStock && <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>}
            </div>
            <p className="text-gray-600 text-sm mb-5 leading-relaxed whitespace-pre-line">{product.description}</p>
            {product.colors?.length > 0 && (
              <div className="mb-5">
                <p className="font-bold text-sm mb-2 text-gray-800">Color: <span className="text-gray-500 font-normal">{selectedColor}</span></p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color: string, i: number) => (
                    <button key={i} onClick={() => onSelectColor(color)} title={color} className={`w-9 h-9 rounded-full border-4 transition-all ${selectedColor === color ? 'border-violet-500 scale-110 shadow-md' : 'border-gray-200 hover:border-violet-300'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            )}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <p className="font-bold text-sm mb-2 text-gray-800">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size: string, i: number) => (
                    <button key={i} onClick={() => onSelectSize(size)} className={`px-4 py-2 border-2 rounded-xl text-sm font-semibold transition-all ${selectedSize === size ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 hover:border-violet-400 text-gray-700'}`}>{size}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 mb-3">
              <button onClick={() => onAddToCart(product)} disabled={!!modalOutOfStock} className="flex-1 py-3.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"><CartIco cls="w-4 h-4" /> Add to Cart</button>
              <button onClick={() => onBuyNow(product)} disabled={!!modalOutOfStock} className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-colors">Buy Now</button>
            </div>
            <button onClick={() => onViewFullDetails(product)} className="w-full py-3 border-2 border-gray-200 hover:border-violet-400 text-gray-600 hover:text-violet-600 rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"><EyeIco /> View Full Details</button>
          </div>
        </div>
      </div>
    </div>
  );
}