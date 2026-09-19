// components/home/ProductDetailPage.tsx
'use client';

import AIChat from '@/components/AIChat';
import { findVariant, formatPrice } from '@/lib/home/helpers';
import type { MarketConfigEntry } from '@/lib/home/types';
import ProductCard from './ProductCard';
import { ProductBadges } from './ProductCard';
import { CartIco, StarIco } from './icons';

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

// ✅ REDESIGNED: more breathing room, quieter chrome, a warmer/more premium
// image frame (padded, off-white mat instead of an edge-to-edge crop) —
// closer to a boutique product page than a dense catalogue tile. Dark mode
// added throughout.
export default function ProductDetailPage({
  product: p, allProducts, market, marketCfg, isPK,
  selectedColor, selectedSize, selectedImageIndex, quantity,
  wishlist, addedToCart, cart, chatProducts,
  onSelectColor, onSelectSize, onSelectImageIndex, onQuantityChange,
  onGoHome, onNavigateCategory, onAddToCart, onBuyNow, onOpenProduct,
  onToggleWish, onOpenPage, onQuickView,
}: ProductDetailPageProps) {
  const related = allProducts.filter(x => x.category === p.category && x._id !== p._id).slice(0, 4);
  const activeVariant = findVariant(p, selectedSize, selectedColor);
  const displayPrice = activeVariant ? activeVariant.price : p.price;
  const displayStock = activeVariant ? activeVariant.stock : null;
  const outOfStock = activeVariant && activeVariant.stock !== null && activeVariant.stock !== undefined && activeVariant.stock <= 0;

  return (
    <main className="bg-[#FAF8F5] dark:bg-neutral-950 min-h-screen">
      <div className="bg-violet-600 dark:bg-violet-800 text-white text-center text-xs py-2 font-medium tracking-wide">
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
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 mb-20">
          {/* ── Image column — padded mat, not edge-to-edge ── */}
          <div>
            <div
              className="rounded-3xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 mb-4 flex items-center justify-center p-8"
              style={{ height: '460px' }}
            >
              <img
                src={p.images?.[selectedImageIndex] ?? 'https://via.placeholder.com/600'}
                className="max-w-full max-h-full object-contain"
                alt={p.name}
              />
            </div>
            {p.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {p.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => onSelectImageIndex(i)}
                    className={`rounded-xl border-2 h-20 w-20 shrink-0 overflow-hidden bg-white dark:bg-neutral-900 p-1.5 transition-all ${
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
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(s => <StarIco key={s} />)}</div>
              <span className="text-sm text-gray-500 dark:text-gray-400">(4.8 · 124 reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-1 pb-6 border-b border-gray-100 dark:border-neutral-800">
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
                      className={`w-9 h-9 rounded-full border-4 transition-all ${
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
                      className={`px-4 py-2 border-2 rounded-xl text-sm font-semibold transition-all ${
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
                <button onClick={() => onQuantityChange(q => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-800 font-bold text-gray-600 dark:text-gray-300 transition">−</button>
                <span className="w-10 text-center font-bold text-gray-900 dark:text-white text-sm">{quantity}</span>
                <button onClick={() => onQuantityChange(q => q + 1)} className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-800 font-bold text-gray-600 dark:text-gray-300 transition">+</button>
              </div>
            </div>

            <div className="flex gap-3 mb-5">
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

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  const text = `Check this on MaestraVibe!\n${p.name}\nPrice: ${formatPrice(displayPrice, market)}\n${window.location.href}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                }}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-green-600 transition"
              >
                📲 {isPK ? 'WhatsApp pe Share' : 'Share on WhatsApp'}
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); }}
                className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
              >
                🔗 {isPK ? 'Link Copy Karo' : 'Copy Link'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mt-auto">
              {[
                { e: '🚚', t: isPK ? 'Free Delivery' : 'Free Shipping', s: `Above ${marketCfg.symbol}${marketCfg.freeDeliveryMin}` },
                { e: '💳', t: isPK ? 'Cash on Delivery' : 'Secure Checkout', s: isPK ? 'No advance' : 'Card/PayPal' },
                { e: '🔄', t: '7-Day Returns', s: 'Hassle-free' },
              ].map((f, i) => (
                <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl p-3 border border-gray-100 dark:border-neutral-800">
                  <div className="text-lg mb-1">{f.e}</div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{f.t}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">{f.s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-1">More like this</p>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
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

      <AIChat
        products={chatProducts}
        onOpenProduct={onOpenPage}
        onAddToCart={onAddToCart}
        pageContext={`Product Page • ${p.category} • ${p.name} • ${selectedSize} • ${selectedColor || 'Default'}`}
        cartItems={cart.map(item => ({ name: item.name, price: item.price, qty: item.quantity }))}
      />
    </main>
  );
}