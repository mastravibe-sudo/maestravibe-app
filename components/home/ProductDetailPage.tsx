// components/home/ProductDetailPage.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Check, CreditCard, Link2, MessageCircle, Package, RotateCcw, Truck } from 'lucide-react';
import { findVariant, formatPrice } from '@/lib/home/helpers';
import type { MarketConfigEntry } from '@/lib/home/types';
import ProductCard from './ProductCard';
import { ProductBadges } from './ProductCard';
import { CartIco } from './icons';
import LikeButton from '@/components/LikeButton';
import RatingStars from '@/components/RatingStars';
import SupplierBadge from '@/components/SupplierBadge';
import ReviewSection from '@/components/ReviewSection';

const LazyAIChat = dynamic(() => import('@/components/AIChat'), { ssr: false });

interface ProductDetailPageProps {
  product: any;
  allProducts: any[];
  market: string;
  marketCfg: MarketConfigEntry;
  isPK: boolean;
  selectedColor: string;
  selectedSize: string;
  selectedImageIndex: number;
  quantity: number;
  wishlist: string[];
  addedToCart: string | null;
  cart: any[];
  chatProducts: any[];
  onSelectColor: (c: string) => void;
  onSelectSize: (s: string) => void;
  onSelectImageIndex: (i: number) => void;
  onQuantityChange: (q: number | ((p: number) => number)) => void;
  onGoHome: () => void;
  onNavigateCategory: (cat: string) => void;
  onAddToCart: (p: any, color?: string, size?: string, qty?: number) => void;
  onBuyNow: (p: any, color?: string, size?: string, qty?: number) => void;
  onOpenProduct: (p: any) => void;
  onToggleWish: (id: string) => void;
  onOpenPage: (p: any) => void;
  onQuickView: (p: any) => void;
}

// Real rating + reviews, own like button, supplier ID badge, icons instead of emoji, responsive image frame.
export default function ProductDetailPage({
  product: p, allProducts, market, marketCfg, isPK,
  selectedColor, selectedSize, selectedImageIndex, quantity,
  wishlist, addedToCart, cart, chatProducts,
  onSelectColor, onSelectSize, onSelectImageIndex, onQuantityChange,
  onGoHome, onNavigateCategory, onAddToCart, onBuyNow, onOpenProduct,
  onToggleWish, onOpenPage, onQuickView,
}: ProductDetailPageProps) {
  const [copied, setCopied] = useState(false);
  const pid = String(p._id ?? p.id ?? '');
  const related = allProducts.filter(x => x.category === p.category && String(x._id ?? x.id) !== pid).slice(0, 4);
  const activeVariant = findVariant(p, selectedSize, selectedColor);
  const displayPrice = activeVariant ? activeVariant.price : p.price;
  const displayStock = activeVariant ? activeVariant.stock : null;
  const outOfStock = activeVariant && activeVariant.stock !== null && activeVariant.stock !== undefined && activeVariant.stock <= 0;
  const mainImage = p.images?.[selectedImageIndex];

  const perks = [
    { Icon: Truck, t: isPK ? 'Free Delivery' : 'Free Shipping', s: `Above ${marketCfg.symbol}${marketCfg.freeDeliveryMin}` },
    { Icon: CreditCard, t: isPK ? 'Cash on Delivery' : 'Secure Checkout', s: isPK ? 'No advance' : 'Card/PayPal' },
    { Icon: RotateCcw, t: '7-Day Returns', s: 'Hassle-free' },
  ];

  return (
    <main className="bg-[#FAF8F5] dark:bg-neutral-950 min-h-screen">
      <div className="bg-violet-600 dark:bg-violet-800 text-white text-center text-xs py-2 px-3 font-medium tracking-wide">
        7-day returns &nbsp;·&nbsp; Free delivery above {isPK ? `Rs. ${marketCfg.freeDeliveryMin}` : `${marketCfg.symbol}${marketCfg.freeDeliveryMin}`} &nbsp;·&nbsp; {isPK ? 'Cash on Delivery' : 'Secure Checkout'} &nbsp;·&nbsp; {marketCfg.phone}
      </div>
      <div className="max-w-6xl mx-auto px-4 py-5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <button onClick={onGoHome} className="hover:text-violet-600 dark:hover:text-violet-400 font-medium">Home</button>
        <span>/</span>
        <button onClick={() => onNavigateCategory(p.category)} className="hover:text-violet-600 dark:hover:text-violet-400 font-medium capitalize">{p.category}</button>
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-200 font-medium line-clamp-1">{p.name}</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 mb-16">
          {/* ── Image column ── */}
          <div>
            <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 mb-4 flex items-center justify-center p-4 sm:p-8 h-80 sm:h-[420px] md:h-[460px]">
              {mainImage ? (
                <img src={mainImage} className="max-w-full max-h-full object-contain" alt={p.name} />
              ) : (
                <Package className="w-16 h-16 text-gray-300" aria-hidden="true" />
              )}
            </div>
            {p.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {p.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => onSelectImageIndex(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`rounded-xl border-2 h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden bg-white dark:bg-neutral-900 p-1.5 transition-all ${
                      selectedImageIndex === i ? 'border-violet-500' : 'border-gray-100 dark:border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-contain" alt={`thumb-${i}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info column ── */}
          <div className="py-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs uppercase text-violet-500 dark:text-violet-400 font-bold tracking-widest capitalize">{p.category}</span>
              <ProductBadges product={p} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 leading-tight">{p.name}</h1>

            <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
              <RatingStars productId={pid} />
              <LikeButton productId={pid} showCount className="border border-gray-200" />
            </div>

            <div className="flex items-baseline gap-3 mb-1 pb-6 border-b border-gray-100 dark:border-neutral-800 flex-wrap">
              <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">{formatPrice(displayPrice, market)}</p>
              {outOfStock ? (
                <span className="text-xs text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-full">Out of Stock</span>
              ) : (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                  {displayStock != null ? `${displayStock} in stock` : 'In Stock'}
                </span>
              )}
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed my-6 whitespace-pre-line">{p.description}</p>

            <SupplierBadge supplierId={p.supplier_id} className="mb-6" />

            {p.colors?.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold text-sm mb-2.5 text-gray-800 dark:text-gray-200">
                  Color <span className="text-gray-400 dark:text-gray-500 font-normal">— {selectedColor}</span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {p.colors.map((color: string, i: number) => (
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

            {p.sizes?.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold text-sm mb-2.5 text-gray-800 dark:text-gray-200">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {p.sizes.map((size: string, i: number) => (
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

            <div className="flex items-center gap-4 mb-7">
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{isPK ? 'تعداد' : 'Quantity'}</p>
              <div className="flex items-center border-2 border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                <button onClick={() => onQuantityChange(q => Math.max(1, q - 1))} aria-label="Decrease quantity" className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-800 font-bold text-gray-600 dark:text-gray-300 transition">−</button>
                <span className="w-10 text-center font-bold text-gray-900 dark:text-white text-sm">{quantity}</span>
                <button onClick={() => onQuantityChange(q => q + 1)} aria-label="Increase quantity" className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-800 font-bold text-gray-600 dark:text-gray-300 transition">+</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <button
                onClick={() => onAddToCart(p, selectedColor, selectedSize, quantity)}
                disabled={!!outOfStock}
                className="flex-1 py-3.5 bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-gray-900 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <CartIco cls="w-4 h-4" /> Add to Cart
              </button>
              <button
                onClick={() => onBuyNow(p, selectedColor, selectedSize, quantity)}
                disabled={!!outOfStock}
                className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-colors"
              >
                Buy Now
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => {
                  const text = `Check this on Maestra Market!\n${p.name}\nPrice: ${formatPrice(displayPrice, market)}\n${window.location.href}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                }}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 min-h-10 rounded-xl text-xs font-semibold hover:bg-green-600 transition"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" /> {isPK ? 'WhatsApp pe Share' : 'Share on WhatsApp'}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 px-4 py-2 min-h-10 rounded-xl text-xs font-semibold hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
              >
                {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Link2 className="w-4 h-4" aria-hidden="true" />}
                {copied ? (isPK ? 'Copy ho gaya' : 'Copied') : (isPK ? 'Link Copy Karo' : 'Copy Link')}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center mt-auto">
              {perks.map(({ Icon, t, s }, i) => (
                <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl p-2.5 sm:p-3 border border-gray-100 dark:border-neutral-800">
                  <Icon className="w-5 h-5 mx-auto mb-1 text-violet-600" aria-hidden="true" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{t}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-16">
          <ReviewSection productId={pid} />
        </div>

        {related.length > 0 && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-1">More like this</p>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
              {related.map((rp: any, idx: number) => (
                <ProductCard
                  key={rp._id ?? idx}
                  product={rp}
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
          </div>
        )}
      </div>

      <LazyAIChat
        products={chatProducts}
        onOpenProduct={onOpenPage}
        onAddToCart={onAddToCart}
        pageContext={`Product Page • ${p.category} • ${p.name} • ${selectedSize} • ${selectedColor || 'Default'}`}
        cartItems={cart.map(item => ({ name: item.name, price: item.price, qty: item.quantity }))}
      />
    </main>
  );
}