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
    <main className="bg-gray-50 min-h-screen">
      <div className="bg-violet-600 text-white text-center text-xs py-2 font-medium tracking-wide">
        7-day returns &nbsp;·&nbsp; Free delivery above {isPK ? `Rs. ${marketCfg.freeDeliveryMin}` : `${marketCfg.symbol}${marketCfg.freeDeliveryMin}`} &nbsp;·&nbsp; {isPK ? 'Cash on Delivery' : 'Secure Checkout'} &nbsp;·&nbsp; {marketCfg.phone}
      </div>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-xs text-gray-500">
        <button onClick={onGoHome} className="hover:text-violet-600 font-medium">Home</button>
        <span>/</span>
        <button onClick={() => onNavigateCategory(p.category)} className="hover:text-violet-600 font-medium capitalize">{p.category}</button>
        <span>/</span>
        <span className="text-gray-800 font-semibold line-clamp-1">{p.name}</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div>
            <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm mb-3" style={{ height: '420px' }}>
              <img src={p.images?.[selectedImageIndex] ?? 'https://via.placeholder.com/600'} className="w-full h-full object-cover" alt={p.name} />
            </div>
            {p.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {p.images.map((img: string, i: number) => (
                  <img key={i} src={img} onClick={() => onSelectImageIndex(i)} className={`cursor-pointer rounded-xl border-2 h-20 w-20 object-cover shrink-0 transition-all ${selectedImageIndex === i ? 'border-violet-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`} alt={`thumb-${i}`} />
                ))}
              </div>
            )}
          </div>
          <div className="py-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs uppercase text-violet-500 font-bold tracking-widest capitalize">{p.category}</span>
              <ProductBadges product={p} />
            </div>
            <h1 className="text-3xl font-black mt-1 text-gray-900 mb-2">{p.name}</h1>
            <div className="flex items-center gap-2 mb-4"><div className="flex gap-0.5">{[1,2,3,4,5].map(s => <StarIco key={s} />)}</div><span className="text-sm text-gray-500">(4.8 · 124 reviews)</span></div>
            <div className="flex items-baseline gap-3 mb-5">
              <p className="text-4xl font-black text-violet-700">{formatPrice(displayPrice, market)}</p>
              {outOfStock ? (
                <span className="text-sm text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>
              ) : (
                <span className="text-sm text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                  {displayStock != null ? `${displayStock} in stock` : 'In Stock'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-5">
              <p className="font-bold text-sm text-gray-800">{isPK ? 'تعداد:' : 'Quantity:'}</p>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => onQuantityChange(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 font-bold text-gray-700 transition">−</button>
                <span className="w-12 text-center font-black text-gray-900">{quantity}</span>
                <button onClick={() => onQuantityChange(q => q + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 font-bold text-gray-700 transition">+</button>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 whitespace-pre-line">{p.description}</p>
            {p.colors?.length > 0 && (
              <div className="mb-5">
                <p className="font-bold text-sm mb-2 text-gray-800">Color: <span className="text-gray-500 font-normal">{selectedColor}</span></p>
                <div className="flex gap-3 flex-wrap">{p.colors.map((color: string, i: number) => <button key={i} onClick={() => onSelectColor(color)} title={color} className={`w-10 h-10 rounded-full border-4 transition-all ${selectedColor === color ? 'border-violet-500 scale-110 shadow-md' : 'border-gray-200 hover:border-violet-300'}`} style={{ backgroundColor: color }} />)}</div>
              </div>
            )}
            {p.sizes?.length > 0 && (
              <div className="mb-3">
                <p className="font-bold text-sm mb-2 text-gray-800">Size</p>
                <div className="flex gap-2 flex-wrap">{p.sizes.map((size: string, i: number) => <button key={i} onClick={() => onSelectSize(size)} className={`px-5 py-2 border-2 rounded-xl text-sm font-semibold transition-all ${selectedSize === size ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 hover:border-violet-400 text-gray-700'}`}>{size}</button>)}</div>
              </div>
            )}
            {p.has_variants && p.variants?.length > 0 && (
              <p className="text-xs text-gray-400 mb-7">Price &amp; availability update automatically based on the size/color you pick.</p>
            )}
            {!(p.has_variants && p.variants?.length > 0) && <div className="mb-7" />}
            <div className="flex gap-3 mb-4">
              <button onClick={() => onAddToCart(p, selectedColor, selectedSize, quantity)} disabled={!!outOfStock} className="flex-1 py-4 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"><CartIco cls="w-4 h-4" /> Add to Cart</button>
              <button onClick={() => onBuyNow(p, selectedColor, selectedSize, quantity)} disabled={!!outOfStock} className="flex-1 py-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-colors">Buy Now</button>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => {
                const text = `Check this on MaestraVibe!\n${p.name}\nPrice: ${formatPrice(displayPrice, market)}\n${window.location.href}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
              }} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition">
                📲 {isPK ? 'WhatsApp pe Share' : 'Share on WhatsApp'}
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); }} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
                🔗 {isPK ? 'Link Copy Karo' : 'Copy Link'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { e: '🚚', t: isPK ? 'Free Delivery' : 'Free Shipping', s: `Above ${marketCfg.symbol}${marketCfg.freeDeliveryMin}` },
                { e: '💳', t: isPK ? 'Cash on Delivery' : 'Secure Checkout', s: isPK ? 'No advance' : 'Card/PayPal' },
                { e: '🔄', t: '7-Day Returns', s: 'Hassle-free' },
              ].map((f, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="text-xl mb-1">{f.e}</div>
                  <p className="text-xs font-bold text-gray-700">{f.t}</p>
                  <p className="text-xs text-gray-400">{f.s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {related.length > 0 && (
          <div>
            <div className="mb-6"><p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">More like this</p><h2 className="text-2xl font-black text-gray-800">Related Products</h2></div>
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