'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useMarket } from '@/lib/market-context'; // ← Header wala same context
import AIChat from '@/components/AIChat';           // ← Full Astro Bhai AI chat

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ d, cls = 'w-5 h-5' }: { d: string; cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);
const CartIco   = ({ cls }: { cls?: string }) => <Icon cls={cls ?? 'w-5 h-5'} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" />;
const SearchIco = () => <Icon cls="w-4 h-4" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />;
const CloseIco  = () => <Icon cls="w-5 h-5" d="M6 18L18 6M6 6l12 12" />;
const BackIco   = () => <Icon cls="w-5 h-5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />;
const ChevR     = () => <Icon cls="w-4 h-4" d="M9 5l7 7-7 7" />;
const ChevL     = () => <Icon cls="w-4 h-4" d="M15 19l-7-7 7-7" />;
const CheckIco  = () => <Icon cls="w-4 h-4" d="M5 13l4 4L19 7" />;
const StarIco   = () => <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>;
const LocIco    = () => <Icon cls="w-4 h-4" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />;
const SpinIco   = () => <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>;
const EyeIco    = () => <Icon cls="w-4 h-4" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />;
const HeartIco  = ({ filled }: { filled: boolean }) => filled
  ? <svg className="w-4 h-4 text-rose-500 fill-rose-500" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
  : <Icon cls="w-4 h-4 text-gray-400" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />;
const FlashIco  = () => <Icon cls="w-4 h-4" d="M13 10V3L4 14h7v7l9-11h-7z" />;
const FestIco   = () => <Icon cls="w-4 h-4" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />;
const TruckIco  = () => <Icon cls="w-5 h-5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h8zm0 0l2-1h2l2-3V9l-2-2h-4v9z" />;
const ShieldIco = () => <Icon cls="w-5 h-5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />;
const TrendIco  = () => <Icon cls="w-5 h-5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />;

// ─── STATIC FALLBACKS (used only until CMS data loads, or if CMS is empty) ───
const FALLBACK_SLIDES = [
  { image: '/image/image1.png', fallback: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop', title: 'New Collection', sub: 'Trendy fashion, one click away', tag: 'Summer 2025' },
  { image: '/image/image 2.png', fallback: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&auto=format&fit=crop', title: 'Premium Quality', sub: 'Genuine products at fair prices', tag: 'Top Picks' },
  { image: '/image/image 4.png', fallback: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop', title: 'Fast Delivery', sub: 'Cash on delivery — all over Pakistan', tag: 'COD Available' },
];

const FALLBACK_CATEGORIES = [
  { label: 'Men',         value: 'men',         image_url: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400&auto=format&fit=crop', emoji: '' },
  { label: 'Women',       value: 'women',       image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&auto=format&fit=crop', emoji: '' },
  { label: 'Kids',        value: 'kids',        image_url: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&auto=format&fit=crop', emoji: '' },
  { label: 'Accessories', value: 'accessories', image_url: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&auto=format&fit=crop', emoji: '' },
  { label: 'Sale',        value: 'sale',        image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&auto=format&fit=crop', emoji: '' },
];

const SORT_OPTIONS = [
  { label: 'Default',            value: 'default'    },
  { label: 'Price: Low → High',  value: 'price-asc'  },
  { label: 'Price: High → Low',  value: 'price-desc' },
  { label: 'Name A–Z',           value: 'name-asc'   },
  { label: 'Name Z–A',           value: 'name-desc'  },
];

const TESTIMONIALS = [
  { name: 'Ayesha K.',  city: 'Lahore',    text: 'Delivery was super fast and the product quality exceeded my expectations. Highly recommend MaestraVibe!', rating: 5 },
  { name: 'Ahmed R.',   city: 'Karachi',   text: 'Cash on delivery made it so easy. The kurta set I ordered looks exactly like the pictures. Will order again.', rating: 5 },
  { name: 'Sarah M.',   city: 'New York',  text: 'Ordered from the US and the quality was outstanding. Shipping was quick and packaging was beautiful.', rating: 5 },
  { name: 'Bilal M.',   city: 'Islamabad', text: 'Amazing quality! Got it in 3 days and the size was perfect. Customer support was also very helpful.', rating: 5 },
];

const OCCASIONS_PK = [
  { label: 'Eid Collection', emoji: '🌙', query: 'eid', gradient: 'from-emerald-500 to-teal-600' },
  { label: 'Wedding Ready', emoji: '💍', query: 'wedding', gradient: 'from-rose-500 to-pink-600' },
  { label: 'Office Looks', emoji: '💼', query: 'formal', gradient: 'from-slate-600 to-gray-700' },
  { label: 'Casual Vibes', emoji: '👕', query: 'casual', gradient: 'from-blue-500 to-indigo-600' },
  { label: 'Glow Up ✨', emoji: '💎', query: 'accessories', gradient: 'from-amber-500 to-orange-500' },
  { label: 'On Sale 🔥', emoji: '🏷️', query: 'sale', gradient: 'from-red-500 to-rose-600' },
];

const OCCASIONS_US = [
  { label: 'Summer Looks', emoji: '☀️', query: 'summer', gradient: 'from-orange-500 to-amber-500' },
  { label: 'Work Outfits', emoji: '💼', query: 'formal', gradient: 'from-slate-600 to-gray-700' },
  { label: 'Party Ready', emoji: '🎉', query: 'dress', gradient: 'from-rose-500 to-pink-600' },
  { label: 'Casual Style', emoji: '👕', query: 'casual', gradient: 'from-blue-500 to-indigo-600' },
  { label: 'Accessories', emoji: '💍', query: 'accessories', gradient: 'from-violet-500 to-purple-600' },
  { label: 'On Sale 🔥', emoji: '🏷️', query: 'sale', gradient: 'from-red-500 to-rose-600' },
];

const TRENDING_PK = [
  'Lawn suits', 'Wireless earbuds', 'Watches for men', 'Summer kurtis', 'Kids shoes', 'Gold earrings', 'Shalwar kameez', 'Sunglasses', 'Casual sneakers', 'Bridal jewelry', 'Office bags', 'Perfume',
];

const TRENDING_US = [
  'Summer dresses', 'Sneakers', 'Watches', 'Sunglasses', 'Handbags', 'Jewelry', 'Kids clothes', 'Casual shirts',
];

const FAQS_PK = [
  { q: 'Kya MaestraVibe Cash on Delivery offer karta hai?', a: 'Haan! Hum poore Pakistan mein Cash on Delivery offer karte hain. Order receive karte waqt payment karein — koi advance nahi.' },
  { q: 'Delivery mein kitna waqt lagta hai?', a: 'Lahore, Karachi, Islamabad mein 1-2 din. Baqi cities mein 2-4 business days.' },
  { q: 'Kya main order return kar sakta hun?', a: '7-din ka hassle-free return policy hai. Damaged ya wrong item mili toh full refund ya replacement.' },
  { q: 'Products genuine hain?', a: 'Haan, 100%. Har product humari team quality verify karti hai.' },
  { q: 'Minimum order kitna hai?', a: 'Koi minimum order nahi! Rs. 1,500 se upar free delivery milti hai.' },
  { q: 'MaestraVibe se paise kaise kama saktay hain?', a: 'Reseller program join karein — products share karein, khud profit set karein, hum delivery handle karein.' },
];

const FAQS_US = [
  { q: 'Do you offer free shipping?', a: 'Yes! Free shipping on all orders above $50. Standard delivery in 3-7 business days.' },
  { q: 'What is your return policy?', a: 'We offer a 7-day hassle-free return policy. Damaged or wrong items get a full refund.' },
  { q: 'Are the products authentic?', a: 'Absolutely. Every product is quality-verified by our team before dispatch.' },
  { q: 'How do I track my order?', a: 'You will receive a tracking link via email once your order is dispatched.' },
  { q: 'Can I earn with MaestraVibe?', a: 'Yes! Join our affiliate program — share products and earn commission on every sale.' },
];

// ─── MARKET CONFIG ────────────────────────────────────────────────────────────
const MARKET_CONFIG: Record<string, {
  currency: string; symbol: string; freeDeliveryMin: string;
  phone: string; conversionRate: number; label: string; flag: string;
  codAvailable: boolean;
}> = {
  pk: { currency: 'PKR', symbol: 'Rs.',  freeDeliveryMin: '1,500', phone: '03274050806',    conversionRate: 1,   label: 'Pakistan', flag: '🇵🇰', codAvailable: true  },
  us: { currency: 'USD', symbol: '$',    freeDeliveryMin: '50',    phone: '+1-800-000-0000', conversionRate: 280, label: 'USA',      flag: '🇺🇸', codAvailable: false },
  ae: { currency: 'AED', symbol: 'AED',  freeDeliveryMin: '150',   phone: '+971-000-0000',   conversionRate: 76,  label: 'UAE',      flag: '🇦🇪', codAvailable: false },
  uk: { currency: 'GBP', symbol: '£',    freeDeliveryMin: '30',    phone: '+44-000-0000',    conversionRate: 355, label: 'UK',       flag: '🇬🇧', codAvailable: false },
};

// ─── SITE SETTINGS TYPE — matches lib/supabase.ts SiteSettings ──────────────
interface SiteSettings {
  flash_sale_enabled:  boolean;
  flash_sale_ends_at:  string;
  flash_sale_discount: number;
  flash_sale_category: string;

  festival_enabled:    boolean;
  festival_ends_at:    string;
  festival_discount:   number;
  festival_category:   string;
  pk_festival_label:   string;
  us_festival_label:   string;
  festival_theme_pk:   string;
  festival_theme_us:   string;

  pk_banner_title:     string;
  us_banner_title:     string;

  trending_pk?: string[];
  trending_us?: string[];

  stats_customers:     string;
  stats_products:      string;
  stats_rating:        string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  flash_sale_enabled:  true,
  flash_sale_ends_at:  '2030-01-01T00:00:00.000Z',
  flash_sale_discount: 50,
  flash_sale_category: 'sale',

  festival_enabled:    false,
  festival_ends_at:    '2030-01-08T00:00:00.000Z',
  festival_discount:   30,
  festival_category:   'sale',
  pk_festival_label:   '',
  us_festival_label:   '',
  festival_theme_pk:   'emerald',
  festival_theme_us:   'blue',

  pk_banner_title:     '🎉 Sale up to 50% off · Free delivery above Rs. 1,500 · Cash on Delivery · 7-day returns',
  us_banner_title:     '🎉 Sale up to 50% off · Free shipping above $50 · Secure Checkout · Easy Returns',

  trending_pk:         TRENDING_PK,
  trending_us:         TRENDING_US,

  stats_customers:     '10K+',
  stats_products:      '500+',
  stats_rating:        '4.9★',
};

// Tailwind only picks up class names it can see statically, so map known
// theme names to fixed gradient classes instead of building the class
// string dynamically (e.g. `bg-${theme}-600` would get purged in prod).
const FESTIVAL_THEME_CLASSES: Record<string, string> = {
  emerald: 'from-emerald-600 to-emerald-500',
  green:   'from-green-600 to-green-500',
  blue:    'from-blue-600 to-blue-500',
  cyan:    'from-cyan-600 to-cyan-500',
  violet:  'from-violet-600 to-purple-500',
  rose:    'from-rose-600 to-pink-500',
  orange:  'from-orange-600 to-amber-500',
  yellow:  'from-yellow-500 to-amber-400',
  gray:    'from-gray-800 to-gray-600',
};
const festivalGradient = (theme: string) => FESTIVAL_THEME_CLASSES[theme] ?? FESTIVAL_THEME_CLASSES.violet;

// ─── CMS TYPES ───────────────────────────────────────────────────────────────
interface CmsBanner {
  id: string; title: string; subtitle: string; tag: string;
  image_url: string; button_label: string; button_link: string;
  market: 'pk' | 'us' | 'both'; is_active: boolean; sort_order: number;
}
interface CmsCategory {
  id: string; label: string; value: string; image_url: string;
  emoji: string; is_active: boolean; sort_order: number;
}
interface ProductVariant {
  id: string; size: string; color: string;
  price: number; actual_price?: number | null; stock?: number | null;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const loadCart  = () => { try { const s = localStorage.getItem('mv_cart2'); return s ? JSON.parse(s) : []; } catch { return []; } };
const saveCart  = (c: any[]) => { try { localStorage.setItem('mv_cart2', JSON.stringify(c)); } catch {} };
const loadWish  = () => { try { const s = localStorage.getItem('mv_wish');  return s ? JSON.parse(s) : []; } catch { return []; } };
const saveWish  = (w: any[]) => { try { localStorage.setItem('mv_wish',  JSON.stringify(w));  } catch {} };
const loadRecentlyViewed = (): any[] => { try { const s = localStorage.getItem('mv_recent'); return s ? JSON.parse(s) : []; } catch { return []; } };
const saveRecentlyViewed = (items: any[]) => { try { localStorage.setItem('mv_recent', JSON.stringify(items)); } catch {} };
const playSound = () => { try { const a = new Audio('/sound/mixkit-happy-bells-notification-937.wav'); a.volume = 0.7; a.play().catch(() => {}); } catch {} };

/**
 * formatPrice — PKR base price ko active market ki currency mein convert karta hai.
 */
const formatPrice = (pricePKR: number, market: string): string => {
  const cfg = MARKET_CONFIG[market] ?? MARKET_CONFIG['pk'];
  if (market === 'pk') return `Rs. ${pricePKR.toLocaleString()}`;
  const converted = pricePKR / cfg.conversionRate;
  if (market === 'us') return `$${converted.toFixed(2)}`;
  if (market === 'ae') return `AED ${converted.toFixed(0)}`;
  if (market === 'uk') return `£${converted.toFixed(2)}`;
  return `${cfg.symbol}${converted.toFixed(2)}`;
};

/**
 * findVariant — product ke variants array mein se selected size+color
 * se match karta hai. Variant na ho to null returns karta hai, taake
 * caller flat price/stock pe gracefully fallback kar sake.
 */
function findVariant(product: any, size: string, color: string): ProductVariant | null {
  if (!product?.variants?.length) return null;
  const v = product.variants.find((v: ProductVariant) =>
    (v.size || '') === (size || '') && (v.color || '') === (color || ''));
  return v ?? null;
}

/**
 * effectivePrice — variant price agar match ho to wo, warna product.price.
 */
function effectivePrice(product: any, size: string, color: string): number {
  const v = findVariant(product, size, color);
  return v ? v.price : product.price;
}

// ─── SLIDE IMAGE ─────────────────────────────────────────────────────────────
function SlideImage({ src, fallback, alt }: { src: string; fallback?: string; alt: string }) {
  const [current, setCurrent] = useState(src);
  return <img src={current} alt={alt} className="w-full h-full object-cover" onError={() => { if (fallback && current !== fallback) setCurrent(fallback); }} />;
}

// ─── FLASH / FESTIVAL COUNTDOWN ──────────────────────────────────────────────
function CountdownTimer({ endsAt, dark = true }: { endsAt: string; dark?: boolean }) {
  const calcRemaining = () => {
    const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
    return { h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) };
  };
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    setTime(calcRemaining());
    const id = window.setInterval(() => setTime(calcRemaining()), 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-1.5">
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className={`text-sm font-black px-2.5 py-1.5 rounded-lg tabular-nums ${dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>{v}</span>
          {i < 2 && <span className={`font-black text-sm ${dark ? 'text-gray-900' : 'text-white'}`}>:</span>}
        </span>
      ))}
    </div>
  );
}

// ─── RECENTLY VIEWED SECTION ─────────────────────────────────────────────────
function RecentlyViewedSection({ items, market, onOpen, onAddToCart, onBuyNow, wishlist, onToggleWish, addedToCart }: {
  items: any[]; market: string;
  onOpen: (p: any) => void; onAddToCart: (p: any) => void; onBuyNow: (p: any) => void;
  wishlist: string[]; onToggleWish: (id: string) => void; addedToCart: string | null;
}) {
  if (items.length === 0) return null;
  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Your History</p>
            <h2 className="text-2xl font-black text-gray-800">Recently Viewed</h2>
          </div>
          <button onClick={() => { saveRecentlyViewed([]); window.location.reload(); }} className="text-xs text-gray-400 hover:text-gray-600 font-medium underline">Clear</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map((product: any, idx: number) => (
            <div key={product._id ?? idx} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col">
              <div className="relative overflow-hidden cursor-pointer bg-gray-50" style={{ height: '210px' }}>
                <img src={product.images?.[0] ?? 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} onClick={() => onOpen(product)} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button onClick={e => { e.stopPropagation(); onToggleWish(product._id); }} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"><HeartIco filled={wishlist.includes(product._id)} /></button>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 onClick={() => onOpen(product)} className="font-semibold text-sm mb-2 line-clamp-2 cursor-pointer hover:text-violet-600 transition-colors text-gray-800">{product.name}</h3>
                <p className="text-violet-700 font-black text-lg mt-auto mb-3">{formatPrice(product.price, market)}</p>
                <div className="flex gap-2">
                  <button onClick={() => onAddToCart(product)} className={`flex-1 py-2.5 text-xs rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${addedToCart === product._id ? 'bg-green-500 text-white scale-95' : 'bg-gray-900 text-white hover:bg-gray-700'}`}>
                    {addedToCart === product._id ? <><CheckIco /> Added</> : <><CartIco cls="w-3.5 h-3.5" /> Add to Cart</>}
                  </button>
                  <button onClick={() => onBuyNow(product)} className="flex-1 py-2.5 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-all duration-200">Buy Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TRENDING NOW — auto-sliding carousel ───────────────────────────────────
function TrendingNowSection({ items, market, onOpen, onAddToCart, onBuyNow, wishlist, onToggleWish, addedToCart }: {
  items: any[]; market: string;
  onOpen: (p: any) => void; onAddToCart: (p: any) => void; onBuyNow: (p: any) => void;
  wishlist: string[]; onToggleWish: (id: string) => void; addedToCart: string | null;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const loopItems = items.length > 0 ? [...items, ...items] : [];

  useEffect(() => {
    if (items.length === 0) return;
    const track = trackRef.current;
    if (!track) return;
    let raf: number;
    const speed = 0.6;
    const step = () => {
      if (!paused && track) {
        track.scrollLeft += speed;
        if (track.scrollLeft >= track.scrollWidth / 2) track.scrollLeft -= track.scrollWidth / 2;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, items.length]);

  if (items.length === 0) return null;

  return (
    <section className="py-10 bg-gradient-to-b from-violet-50/60 to-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shrink-0"><TrendIco /></div>
            <div>
              <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Hot right now</p>
              <h2 className="text-2xl font-black text-gray-800">Trending Now</h2>
            </div>
          </div>
          <span className="hidden md:inline-flex text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full">🔥 Updated live</span>
        </div>
      </div>
      <div ref={trackRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)} className="flex gap-5 overflow-x-hidden px-4 max-w-7xl mx-auto" style={{ scrollBehavior: 'auto' }}>
        {loopItems.map((product: any, idx: number) => (
          <div key={`${product._id ?? idx}-${idx}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group border border-gray-100 flex flex-col shrink-0" style={{ width: '230px' }}>
            <div className="relative overflow-hidden cursor-pointer bg-gray-50" style={{ height: '190px' }}>
              <img src={product.images?.[0] ?? 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} onClick={() => onOpen(product)} draggable={false} />
              <div className="absolute top-2 left-2"><span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><FlashIco /> Trending</span></div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button onClick={e => { e.stopPropagation(); onToggleWish(product._id); }} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"><HeartIco filled={wishlist.includes(product._id)} /></button>
              </div>
            </div>
            <div className="p-3.5 flex flex-col flex-1">
              <h3 onClick={() => onOpen(product)} className="font-semibold text-sm mb-2 line-clamp-2 cursor-pointer hover:text-violet-600 transition-colors text-gray-800">{product.name}</h3>
              <p className="text-violet-700 font-black text-base mt-auto mb-3">{formatPrice(product.price, market)}</p>
              <div className="flex gap-2">
                <button onClick={() => onAddToCart(product)} className={`flex-1 py-2 text-xs rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${addedToCart === product._id ? 'bg-green-500 text-white scale-95' : 'bg-gray-900 text-white hover:bg-gray-700'}`}>
                  {addedToCart === product._id ? <><CheckIco /> Added</> : <><CartIco cls="w-3.5 h-3.5" /> Add</>}
                </button>
                <button onClick={() => onBuyNow(product)} className="flex-1 py-2 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-all duration-200">Buy Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
interface HomePageProps {
  onCartCountChange?: (count: number) => void;
  showCart?: boolean;
  onCartClose?: () => void;
}

export default function HomePage({ onCartCountChange, showCart: showCartProp = false, onCartClose }: HomePageProps) {
  // ── MarketContext se market lo — Header ke saath sync rahega ──
  const { market } = useMarket();
  const marketCfg  = MARKET_CONFIG[market] ?? MARKET_CONFIG['pk'];
  const isPK        = market === 'pk';

  const [view,            setView]            = useState('home');
  const [currentSlide,    setCurrentSlide]    = useState(0);
  const [allProducts,     setAllProducts]     = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [catSlide,        setCatSlide]        = useState(0);

  const [siteSettings,   setSiteSettings]   = useState<SiteSettings>(DEFAULT_SETTINGS);

  // ── CMS-driven banners & categories ──
  const [cmsBanners,     setCmsBanners]     = useState<CmsBanner[]>([]);
  const [cmsCategories,  setCmsCategories]  = useState<CmsCategory[]>([]);
  const [cmsLoading,     setCmsLoading]     = useState(true);

  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [searchInput,    setSearchInput]    = useState('');
  const [sortBy,         setSortBy]         = useState('default');
  const [priceMin,       setPriceMin]       = useState('');
  const [priceMax,       setPriceMax]       = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes,  setSelectedSizes]  = useState<string[]>([]);
  const [showFilters,    setShowFilters]    = useState(false);
  const [faqOpen,        setFaqOpen]        = useState(0);

  const [selectedProduct,    setSelectedProduct]    = useState<any>(null);
  const [selectedColor,      setSelectedColor]      = useState('');
  const [selectedSize,       setSelectedSize]       = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity,           setQuantity]           = useState(1);
  const [viewProductPage,    setViewProductPage]    = useState<any>(null);

  const [cart,        setCart]        = useState<any[]>([]);
  const [cartLoaded,  setCartLoaded]  = useState(false);
  const [showCart,    setShowCart]    = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [wishlist,    setWishlist]    = useState<string[]>([]);
  const [wishLoaded,  setWishLoaded]  = useState(false);

  const [showCheckout,    setShowCheckout]    = useState(false);
  const [checkoutStep,    setCheckoutStep]    = useState(1);
  const [checkoutProduct, setCheckoutProduct] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [orderLoading,    setOrderLoading]    = useState(false);
  const [showSuccess,     setShowSuccess]     = useState(false);
  const [customerInfo,    setCustomerInfo]    = useState({ name: '', email: '', phone: '', address: '', city: '', area: '' });

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone,  setNewsletterDone]  = useState(false);

  // ── Init ──
  useEffect(() => {
    setCart(loadCart());     setCartLoaded(true);
    setWishlist(loadWish()); setWishLoaded(true);
    setRecentlyViewed(loadRecentlyViewed());
  }, []);

  // Fetch site settings
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setSiteSettings(prev => ({ ...prev, ...data })); })
      .catch(() => {});
  }, []);

  // ── Fetch CMS banners + categories (admin-managed Homepage CMS) ──
  const loadCms = useCallback(async () => {
    setCmsLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        fetch('/api/banners').catch(() => null),
        fetch('/api/categories').catch(() => null),
      ]);
      const banners    = bRes && bRes.ok ? await bRes.json() : [];
      const categories  = cRes && cRes.ok ? await cRes.json() : [];
      setCmsBanners(Array.isArray(banners) ? banners : []);
      setCmsCategories(Array.isArray(categories) ? categories : []);
    } catch {
      // CMS unreachable — fallbacks below will kick in
    } finally {
      setCmsLoading(false);
    }
  }, []);
  useEffect(() => { loadCms(); }, [loadCms]);

  useEffect(() => { if (cartLoaded) saveCart(cart); }, [cart, cartLoaded]);
  useEffect(() => { if (wishLoaded) saveWish(wishlist); }, [wishlist, wishLoaded]);
  useEffect(() => { onCartCountChange?.(cart.reduce((s, i) => s + i.quantity, 0)); }, [cart, onCartCountChange]);
  useEffect(() => { if (showCartProp) setShowCart(true); }, [showCartProp]);

  // ── Derived: active banners for this market, active categories ──
  const activeBanners = cmsBanners
    .filter(b => b.is_active && (b.market === 'both' || b.market === market))
    .sort((a, b) => a.sort_order - b.sort_order);

  const slides = activeBanners.length > 0
    ? activeBanners.map(b => ({ id: b.id, image: b.image_url, fallback: '', title: b.title, sub: b.subtitle, tag: b.tag, buttonLabel: b.button_label || 'Shop Now', buttonLink: b.button_link || 'all' }))
    : FALLBACK_SLIDES.map((s, i) => ({ id: `fallback-${i}`, image: s.image, fallback: s.fallback, title: s.title, sub: s.sub, tag: s.tag, buttonLabel: 'Shop Now', buttonLink: 'all' }));

  const activeCategories = cmsCategories.filter(c => c.is_active).sort((a, b) => a.sort_order - b.sort_order);

  const categoriesForGrid = activeCategories.length > 0
    ? activeCategories.map(c => ({ label: c.label, value: c.value, image: c.image_url, emoji: c.emoji }))
    : FALLBACK_CATEGORIES.map(c => ({ label: c.label, value: c.value, image: c.image_url, emoji: c.emoji }));

  const categoriesForFilter = [{ label: 'All', value: 'all', image: '', emoji: '' }, ...categoriesForGrid];

  useEffect(() => {
    if (slides.length === 0) return;
    const id = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load');
      setAllProducts(await res.json());
    } catch { console.error('Products load failed'); }
    finally { setProductsLoading(false); }
  }, []);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Derived ──
  const allColors = [...new Set(allProducts.flatMap(p => p.colors ?? []))];
  const allSizes  = [...new Set(allProducts.flatMap(p => p.sizes  ?? []))];

  let filtered = allProducts.filter(p => {
    const matchCat    = activeCategory === 'all' || p.category === activeCategory;
    const q           = searchQuery.trim().toLowerCase();
    const matchSearch = !q || [p.name, p.description, p.category].some((f: string) => f?.toLowerCase().includes(q));
    const minP = priceMin ? +priceMin : 0;
    const maxP = priceMax ? +priceMax : Infinity;
    const matchPrice  = p.price >= minP && p.price <= maxP;
    const matchColor  = !selectedColors.length || selectedColors.some(c => p.colors?.includes(c));
    const matchSize   = !selectedSizes.length  || selectedSizes.some(s => p.sizes?.includes(s));
    return matchCat && matchSearch && matchPrice && matchColor && matchSize;
  });
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc')  return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-asc')   return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc')  return b.name.localeCompare(a.name);
    return 0;
  });

  const checkoutItems = checkoutProduct ? [checkoutProduct] : cart;
  const orderTotal    = checkoutItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  const cartTotal     = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount     = cart.reduce((s, i) => s + i.quantity, 0);
  const featured      = allProducts.slice(0, 8);
  const newArrivals   = [...allProducts].reverse().slice(0, 8);
  const trendingNow   = allProducts.length > 4
    ? [...allProducts].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 10)
    : allProducts;
  const festivalProducts = siteSettings.festival_enabled
    ? allProducts.filter(p => p.festival_tag && p.festival_tag === siteSettings.festival_category).slice(0, 8)
    : [];
  const activeFiltersCount = (priceMin || priceMax ? 1 : 0) + (selectedColors.length ? 1 : 0) + (selectedSizes.length ? 1 : 0);
  const occasions = isPK ? OCCASIONS_PK : OCCASIONS_US;
  const trendingSearches = isPK ? (siteSettings.trending_pk ?? TRENDING_PK) : (siteSettings.trending_us ?? TRENDING_US);
  const faqList = isPK ? FAQS_PK : FAQS_US;

  // ── Actions ──
  const navigateTo = (cat = 'all', q = '') => {
    setActiveCategory(cat); setSearchQuery(q); setSearchInput(q);
    setView('shop'); setViewProductPage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProduct = (product: any) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors?.[0] ?? '');
    setSelectedSize(product.sizes?.[0] ?? 'Standard');
    setSelectedImageIndex(0);
  };

  const openProductPage = (product: any) => {
    setViewProductPage(product);
    setSelectedColor(product.colors?.[0] ?? '');
    setSelectedSize(product.sizes?.[0] ?? 'Standard');
    setSelectedImageIndex(0);
    setQuantity(1);
    setRecentlyViewed(prev => {
      const f = prev.filter(p => p._id !== product._id);
      const u = [product, ...f].slice(0, 8);
      saveRecentlyViewed(u);
      return u;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product: any, color?: string, size?: string, qty = 1) => {
    const finalColor = color ?? selectedColor ?? product.colors?.[0] ?? '';
    const finalSize  = size ?? selectedSize ?? product.sizes?.[0] ?? 'Standard';
    const finalPrice = effectivePrice(product, finalSize, finalColor);
    const item = { ...product, price: finalPrice, selectedColor: finalColor, selectedSize: finalSize, quantity: qty };
    setCart(prev => {
      const idx = prev.findIndex(i => i._id === item._id && i.selectedColor === item.selectedColor && i.selectedSize === item.selectedSize);
      if (idx >= 0) { const u = [...prev]; u[idx] = { ...u[idx], quantity: u[idx].quantity + qty }; return u; }
      return [...prev, item];
    });
    setAddedToCart(product._id);
    setTimeout(() => setAddedToCart(null), 1800);
    setSelectedProduct(null);
  };

  const handleBuyNow = (product: any, color?: string, size?: string, qty = 1) => {
    const finalColor = color ?? product.colors?.[0] ?? '';
    const finalSize  = size ?? product.sizes?.[0] ?? 'Standard';
    const finalPrice = effectivePrice(product, finalSize, finalColor);
    const item = { ...product, price: finalPrice, selectedColor: finalColor, selectedSize: finalSize, quantity: qty };
    setCheckoutProduct(item);
    setSelectedProduct(null); setViewProductPage(null);
    setCheckoutStep(1); setShowCheckout(true);
  };

  const toggleWish = (id: string) => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const detectLocation = () => {
    if (!navigator.geolocation) { alert('Location not supported.'); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords;
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const addr = data.address;
          setCustomerInfo(prev => ({
            ...prev,
            city:    addr.city || addr.town || addr.village || addr.state_district || '',
            area:    addr.neighbourhood || addr.suburb || addr.road || '',
            address: [addr.road, addr.neighbourhood || addr.suburb, addr.city || addr.town].filter(Boolean).join(', ') || prev.address,
          }));
        } catch { alert('Location detection failed. Please fill manually.'); }
        finally { setLocationLoading(false); }
      },
      () => { setLocationLoading(false); alert('Location permission denied.'); },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerInfo, market,
          items: checkoutItems.map(item => ({
            productId: item._id, name: item.name, price: item.price,
            quantity: item.quantity || 1, selectedColor: item.selectedColor,
            selectedSize: item.selectedSize, image: item.images?.[0] ?? '',
          })),
          total: orderTotal, status: 'new',
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Order failed');
      playSound();
      setShowCheckout(false); setCheckoutProduct(null); setCart([]);
      setCustomerInfo({ name: '', email: '', phone: '', address: '', city: '', area: '' });
      setShowSuccess(true);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Order failed'}`);
    } finally { setOrderLoading(false); }
  };

  const clearFilters = () => { setPriceMin(''); setPriceMax(''); setSelectedColors([]); setSelectedSizes([]); setSortBy('default'); };
  const inputCls = 'w-full p-3.5 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none text-sm transition-colors bg-white';

  // ─── AI Chat ke liye products format karna ─────────────────────────────────
  const chatProducts = allProducts.map(p => ({
    _id: p._id, name: p.name, price: p.price, images: p.images ?? [],
    category: p.category, description: p.description ?? '',
    colors: p.colors ?? [], sizes: p.sizes ?? [],
  }));

  // ─ PRODUCT TAGS + FESTIVAL BADGE (shared between card & full page) ─
  const ProductBadges = ({ product, className = '' }: { product: any; className?: string }) => {
    const tags: string[] = product.tags ?? [];
    if (tags.length === 0 && !product.festival_tag) return null;
    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {product.festival_tag && (
          <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
            <FestIco /> Festival
          </span>
        )}
        {tags.slice(0, 2).map((t: string, i: number) => (
          <span key={i} className="bg-violet-600/90 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm whitespace-nowrap">{t}</span>
        ))}
      </div>
    );
  };

  // ─ PRODUCT CARD ─
  const ProductCard = ({ product }: { product: any }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col">
      <div className="relative overflow-hidden cursor-pointer bg-gray-50" style={{ height: '210px' }}>
        <img src={product.images?.[0] ?? 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} onClick={() => openProductPage(product)} />
        <div className="absolute top-2 left-2 flex flex-col gap-1 max-w-[70%]">
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2.5 py-1 rounded-full font-semibold capitalize shadow-sm w-fit">{product.category}</span>
          <ProductBadges product={product} />
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <button onClick={e => { e.stopPropagation(); toggleWish(product._id); }} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"><HeartIco filled={wishlist.includes(product._id)} /></button>
          <button onClick={e => { e.stopPropagation(); openProduct(product); }} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"><EyeIco /></button>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" onClick={() => openProductPage(product)} />
        {Number.isFinite(product.discount_percent) && product.discount_percent > 0 && (
          <span className="absolute top-2 left-2 mt-12 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm">
            {product.discount_percent}% OFF
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 onClick={() => openProductPage(product)} className="font-semibold text-sm mb-1.5 line-clamp-2 cursor-pointer hover:text-violet-600 transition-colors text-gray-800">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">{[1,2,3,4,5].map(s => <StarIco key={s} />)}<span className="text-xs text-gray-400 ml-1">(4.8)</span></div>
        {(product.colors?.length ?? 0) > 0 && (
          <div className="flex gap-1 mb-2.5 flex-wrap">
            {product.colors.slice(0, 6).map((c: string, i: number) => <span key={i} className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 shrink-0" style={{ backgroundColor: c }} title={c} />)}
            {product.colors?.length > 6 && <span className="text-xs text-gray-400 self-center">+{(product.colors?.length ?? 0) - 6}</span>}
          </div>
        )}
        {/* ── Market se price format hoga ── */}
        <p className="text-violet-700 font-black text-lg mt-auto mb-3">{formatPrice(product.price, market)}</p>
        <div className="flex gap-2">
          <button onClick={() => addToCart(product, product.colors?.[0], product.sizes?.[0])} className={`flex-1 py-2.5 text-xs rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${addedToCart === product._id ? 'bg-green-500 text-white scale-95' : 'bg-gray-900 text-white hover:bg-gray-700'}`}>
            {addedToCart === product._id ? <><CheckIco /> Added</> : <><CartIco cls="w-3.5 h-3.5" /> Add to Cart</>}
          </button>
          <button onClick={() => handleBuyNow(product, product.colors?.[0], product.sizes?.[0])} className="flex-1 py-2.5 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-all duration-200">Buy Now</button>
        </div>
      </div>
    </div>
  );

  const Skeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
          <div className="h-52 bg-gray-200" />
          <div className="p-4 space-y-2"><div className="h-3 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /><div className="h-9 bg-gray-200 rounded-xl mt-3" /></div>
        </div>
      ))}
    </div>
  );

  // ─ FULL PRODUCT PAGE ─
  if (viewProductPage) {
    const p = viewProductPage;
    const related = allProducts.filter(x => x.category === p.category && x._id !== p._id).slice(0, 4);
    const activeVariant = findVariant(p, selectedSize, selectedColor);
    const displayPrice   = activeVariant ? activeVariant.price : p.price;
    const displayStock   = activeVariant ? activeVariant.stock : null;
    const outOfStock     = activeVariant && activeVariant.stock !== null && activeVariant.stock !== undefined && activeVariant.stock <= 0;

    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="bg-violet-600 text-white text-center text-xs py-2 font-medium tracking-wide">
          7-day returns &nbsp;·&nbsp; Free delivery above {isPK ? `Rs. ${marketCfg.freeDeliveryMin}` : `${marketCfg.symbol}${marketCfg.freeDeliveryMin}`} &nbsp;·&nbsp; {isPK ? 'Cash on Delivery' : 'Secure Checkout'} &nbsp;·&nbsp; {marketCfg.phone}
        </div>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-xs text-gray-500">
          <button onClick={() => { setViewProductPage(null); setView('home'); }} className="hover:text-violet-600 font-medium">Home</button>
          <span>/</span>
          <button onClick={() => navigateTo(p.category)} className="hover:text-violet-600 font-medium capitalize">{p.category}</button>
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
                  {p.images.map((img: string, i: number) => <img key={i} src={img} onClick={() => setSelectedImageIndex(i)} className={`cursor-pointer rounded-xl border-2 h-20 w-20 object-cover shrink-0 transition-all ${selectedImageIndex === i ? 'border-violet-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`} alt={`thumb-${i}`} />)}
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
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 font-bold text-gray-700 transition">−</button>
                  <span className="w-12 text-center font-black text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 font-bold text-gray-700 transition">+</button>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 whitespace-pre-line">{p.description}</p>
              {p.colors?.length > 0 && (
                <div className="mb-5">
                  <p className="font-bold text-sm mb-2 text-gray-800">Color: <span className="text-gray-500 font-normal">{selectedColor}</span></p>
                  <div className="flex gap-3 flex-wrap">{p.colors.map((color: string, i: number) => <button key={i} onClick={() => setSelectedColor(color)} title={color} className={`w-10 h-10 rounded-full border-4 transition-all ${selectedColor === color ? 'border-violet-500 scale-110 shadow-md' : 'border-gray-200 hover:border-violet-300'}`} style={{ backgroundColor: color }} />)}</div>
                </div>
              )}
              {p.sizes?.length > 0 && (
                <div className="mb-3">
                  <p className="font-bold text-sm mb-2 text-gray-800">Size</p>
                  <div className="flex gap-2 flex-wrap">{p.sizes.map((size: string, i: number) => <button key={i} onClick={() => setSelectedSize(size)} className={`px-5 py-2 border-2 rounded-xl text-sm font-semibold transition-all ${selectedSize === size ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 hover:border-violet-400 text-gray-700'}`}>{size}</button>)}</div>
                </div>
              )}
              {p.has_variants && p.variants?.length > 0 && (
                <p className="text-xs text-gray-400 mb-7">Price &amp; availability update automatically based on the size/color you pick.</p>
              )}
              {!(p.has_variants && p.variants?.length > 0) && <div className="mb-7" />}
              <div className="flex gap-3 mb-4">
                <button onClick={() => addToCart(p, selectedColor, selectedSize, quantity)} disabled={!!outOfStock} className="flex-1 py-4 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"><CartIco cls="w-4 h-4" /> Add to Cart</button>
                <button onClick={() => handleBuyNow(p, selectedColor, selectedSize, quantity)} disabled={!!outOfStock} className="flex-1 py-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-colors">Buy Now</button>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{related.map((rp: any, idx: number) => <ProductCard key={rp._id ?? idx} product={rp} />)}</div>
            </div>
          )}
        </div>
        {/* ── Full AI Chat — product page par bhi ── */}
        <AIChat
          products={chatProducts}
          onOpenProduct={openProductPage}
          onAddToCart={addToCart}
          pageContext={`Product Page • ${p.category} • ${p.name} • ${selectedSize} • ${selectedColor || 'Default'}`}
          cartItems={cart.map(item => ({ name: item.name, price: item.price, qty: item.quantity }))}
        />
      </main>
    );
  }

  // ─ MAIN RENDER ─
  return (
    <main className="bg-gray-50 text-gray-900 min-h-screen">

      {/* Market-aware announcement bar — ab CMS settings se aata hai */}
      <div className="bg-gradient-to-r from-violet-700 to-purple-800 text-white text-center text-xs py-2 font-medium tracking-wide">
        {isPK
          ? (siteSettings.pk_banner_title || DEFAULT_SETTINGS.pk_banner_title)
          : (siteSettings.us_banner_title || DEFAULT_SETTINGS.us_banner_title)
        }
      </div>

      {view === 'home' && (
        <>
          {/* ── Market info strip — Header se sync ── */}
          <div className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                {marketCfg.flag} Shopping in {marketCfg.label} · {marketCfg.symbol} ({marketCfg.currency})
                {isPK && ' · Cash on Delivery Available'}
              </span>
              <span className="text-xs text-violet-500 font-semibold">
                Switch market from the header menu ↑
              </span>
            </div>
          </div>

          {/* HERO SLIDER — ab admin ke Hero Banners CMS se aata hai */}
          <section className="relative w-full overflow-hidden" style={{ height: 'clamp(280px,55vw,600px)' }}>
            {slides.map((slide, i) => (
              <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <SlideImage src={slide.image} fallback={slide.fallback} alt={slide.title} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                <div className="absolute inset-0 flex items-center px-8 md:px-20">
                  <div className="max-w-lg">
                    {slide.tag && <span className="inline-block bg-violet-500/30 backdrop-blur-sm text-violet-200 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">{slide.tag}</span>}
                    <h2 className="text-white text-4xl md:text-6xl font-black leading-tight mb-2">{slide.title}</h2>
                    {slide.sub && <p className="text-white/75 text-sm mb-8">{slide.sub}</p>}
                    <div className="flex gap-3">
                      <button onClick={() => navigateTo(slide.buttonLink === 'all' ? 'all' : slide.buttonLink)} className="bg-violet-600 hover:bg-violet-500 active:scale-95 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-600/40">{slide.buttonLabel}</button>
                      <button onClick={() => navigateTo('sale')} className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition-all border border-white/30">View Sale 🔥</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {slides.map((s, i) => <button key={s.id} onClick={() => setCurrentSlide(i)} className={`transition-all rounded-full ${i === currentSlide ? 'w-7 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'}`} />)}
            </div>
            <button onClick={() => setCurrentSlide(p => (p - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"><ChevL /></button>
            <button onClick={() => setCurrentSlide(p => (p + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"><ChevR /></button>
          </section>

          {/* TRUST STRIP */}
          <section className="bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { icon: <TruckIco />, t: isPK ? 'Free Delivery' : 'Free Shipping', s: `Above ${marketCfg.symbol}${marketCfg.freeDeliveryMin}` },
                  { icon: <span className="text-xl">💳</span>, t: isPK ? 'Cash on Delivery' : 'Secure Checkout', s: isPK ? 'No advance needed' : 'Card / PayPal' },
                  { icon: <span className="text-xl">🔄</span>, t: '7-Day Returns', s: 'Hassle-free policy' },
                  { icon: <ShieldIco />, t: '100% Genuine', s: 'Authentic guarantee' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 shrink-0">{f.icon}</div>
                    <div><p className="text-sm font-bold text-gray-800">{f.t}</p><p className="text-xs text-gray-500">{f.s}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FLASH SALE BANNER */}
          {siteSettings.flash_sale_enabled && new Date(siteSettings.flash_sale_ends_at) > new Date() && (
            <section className="bg-gradient-to-r from-rose-600 to-orange-500 py-5">
              <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-xl p-2.5"><FlashIco /></div>
                  <div>
                    <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">Limited Time</p>
                    <h3 className="text-white font-black text-xl">Flash Sale — Up to {siteSettings.flash_sale_discount}% Off!</h3>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-white/70 text-xs mb-1 font-medium">Ends in</p>
                    <CountdownTimer endsAt={siteSettings.flash_sale_ends_at} />
                  </div>
                  <button onClick={() => navigateTo(siteSettings.flash_sale_category)} className="bg-white text-rose-600 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-rose-50 transition-colors shadow-lg shrink-0">Shop Sale →</button>
                </div>
              </div>
            </section>
          )}

          {/* FESTIVAL SALE BANNER — Eid, Ramadan, Black Friday, etc (admin-controlled) */}
          {siteSettings.festival_enabled && new Date(siteSettings.festival_ends_at) > new Date() && (
            <section className={`bg-gradient-to-r ${festivalGradient(isPK ? siteSettings.festival_theme_pk : siteSettings.festival_theme_us)} py-5`}>
              <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-xl p-2.5"><FestIco /></div>
                  <div>
                    <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">Festival Offer</p>
                    <h3 className="text-white font-black text-xl">
                      {(isPK ? siteSettings.pk_festival_label : siteSettings.us_festival_label) || `Festival Sale — Up to ${siteSettings.festival_discount}% Off!`}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-white/70 text-xs mb-1 font-medium">Ends in</p>
                    <CountdownTimer endsAt={siteSettings.festival_ends_at} dark={false} />
                  </div>
                  <button onClick={() => navigateTo(siteSettings.festival_category)} className="bg-white text-gray-900 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-gray-50 transition-colors shadow-lg shrink-0">Shop Now →</button>
                </div>
              </div>
            </section>
          )}

          {/* FESTIVAL PRODUCTS */}
          {!productsLoading && festivalProducts.length > 0 && (
            <section className="py-10 bg-gradient-to-b from-rose-50/40 to-white border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shrink-0"><FestIco /></div>
                    <div>
                      <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">Limited time</p>
                      <h2 className="text-2xl font-black text-gray-800">
                        {(isPK ? siteSettings.pk_festival_label : siteSettings.us_festival_label) || 'Festival Picks'}
                      </h2>
                    </div>
                  </div>
                  <button onClick={() => navigateTo(siteSettings.festival_category)} className="text-sm text-rose-600 font-semibold hover:underline flex items-center gap-1">View All <ChevR /></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{festivalProducts.map((p: any, idx: number) => <ProductCard key={p._id ?? idx} product={p} />)}</div>
              </div>
            </section>
          )}

          {/* CATEGORIES — admin Homepage CMS se */}
          <section className="py-12 max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div><p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Browse by</p><h2 className="text-2xl font-black text-gray-800">Categories</h2></div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCatSlide(p => Math.max(0, p - 1))} className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-violet-400 transition-colors"><ChevL /></button>
                <button onClick={() => setCatSlide(p => Math.min(Math.max(0, categoriesForGrid.length - 4), p + 1))} className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-violet-400 transition-colors"><ChevR /></button>
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="flex gap-4 transition-transform duration-500" style={{ transform: `translateX(-${catSlide * (100 / 4)}%)` }}>
                {categoriesForGrid.map(cat => (
                  <div key={cat.value} onClick={() => navigateTo(cat.value)} className="shrink-0 cursor-pointer group rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300" style={{ width: 'calc(25% - 12px)' }}>
                    <div className="relative overflow-hidden" style={{ height: '160px' }}>
                      {cat.image
                        ? <img src={cat.image} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center bg-violet-50 text-5xl">{cat.emoji || '🛍️'}</div>
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-3"><p className="text-white font-black text-base">{cat.emoji} {cat.label}</p></div>
                    </div>
                    <div className="p-3 flex items-center justify-between"><span className="text-xs text-gray-500">Explore collection</span><ChevR /></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FEATURED PRODUCTS */}
          {!productsLoading && featured.length > 0 && (
            <section className="py-10 bg-white border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <div><p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Hand-picked</p><h2 className="text-2xl font-black text-gray-800">Featured Products</h2></div>
                  <button onClick={() => navigateTo()} className="text-sm text-violet-600 font-semibold hover:underline flex items-center gap-1">View All <ChevR /></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{featured.map((p: any, idx: number) => <ProductCard key={p._id ?? idx} product={p} />)}</div>
              </div>
            </section>
          )}
          {productsLoading && <div className="max-w-7xl mx-auto px-4 py-10"><Skeleton /></div>}

          {/* RECENTLY VIEWED */}
          <RecentlyViewedSection
            items={recentlyViewed} market={market}
            onOpen={openProductPage}
            onAddToCart={p => addToCart(p, p.colors?.[0], p.sizes?.[0])}
            onBuyNow={p => handleBuyNow(p, p.colors?.[0], p.sizes?.[0])}
            wishlist={wishlist} onToggleWish={toggleWish} addedToCart={addedToCart}
          />

          {/* TRENDING NOW */}
          {!productsLoading && (
            <TrendingNowSection
              items={trendingNow} market={market}
              onOpen={openProductPage}
              onAddToCart={p => addToCart(p, p.colors?.[0], p.sizes?.[0])}
              onBuyNow={p => handleBuyNow(p, p.colors?.[0], p.sizes?.[0])}
              wishlist={wishlist} onToggleWish={toggleWish} addedToCart={addedToCart}
            />
          )}

          {/* MARKET PROMO STRIP */}
          <section className={`py-8 ${isPK ? 'bg-emerald-50 border-y border-emerald-100' : 'bg-blue-50 border-y border-blue-100'}`}>
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              {isPK ? (
                <><div><p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Pakistan's Favorite Store</p><h3 className="text-xl font-black text-gray-900 mt-0.5">Cash on Delivery Available Nationwide</h3><p className="text-sm text-gray-600 mt-1">Lahore · Karachi · Islamabad · Peshawar · Quetta · Multan and beyond</p></div><div className="text-3xl">🇵🇰</div></>
              ) : (
                <><div><p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Shipping to {marketCfg.label}</p><h3 className="text-xl font-black text-gray-900 mt-0.5">Free Shipping on Orders Over {marketCfg.symbol}{marketCfg.freeDeliveryMin}</h3><p className="text-sm text-gray-600 mt-1">Fast, reliable international delivery</p></div><div className="text-3xl">{marketCfg.flag}</div></>
              )}
            </div>
          </section>

          {/* BANNER STRIP */}
          <section className="py-8 max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-5">
              <div onClick={() => navigateTo('women')} className="relative cursor-pointer rounded-3xl overflow-hidden group" style={{ height: '200px' }}>
                <img src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Women's Collection" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-purple-900/20" />
                <div className="absolute inset-0 flex items-center px-8"><div><p className="text-purple-200 text-xs font-bold uppercase tracking-widest">New Arrivals</p><h3 className="text-white text-3xl font-black">Women's Collection</h3><button className="mt-3 bg-white text-purple-700 px-5 py-2 rounded-xl text-sm font-bold hover:bg-purple-50 transition-colors">Shop Now</button></div></div>
              </div>
              <div onClick={() => navigateTo('men')} className="relative cursor-pointer rounded-3xl overflow-hidden group" style={{ height: '200px' }}>
                <img src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Men's Styles" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-gray-900/20" />
                <div className="absolute inset-0 flex items-center px-8"><div><p className="text-gray-300 text-xs font-bold uppercase tracking-widest">Trending</p><h3 className="text-white text-3xl font-black">Men's Styles</h3><button className="mt-3 bg-white text-gray-900 px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors">Shop Now</button></div></div>
              </div>
            </div>
          </section>

          {/* NEW ARRIVALS */}
          {!productsLoading && newArrivals.length > 0 && (
            <section className="py-10 max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <div><p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Just added</p><h2 className="text-2xl font-black text-gray-800">New Arrivals</h2></div>
                <button onClick={() => navigateTo()} className="text-sm text-violet-600 font-semibold hover:underline flex items-center gap-1">View All <ChevR /></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{newArrivals.map((p: any, idx: number) => <ProductCard key={p._id ?? idx} product={p} />)}</div>
            </section>
          )}

          {/* WHY CHOOSE US */}
          <section className="py-16 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-10"><p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Why MaestraVibe</p><h2 className="text-2xl font-black text-gray-800">Shopping Made Simple</h2></div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: '🎯', title: 'Curated Selection', desc: 'Every product is hand-picked by our team for quality, style, and value.' },
                  { icon: isPK ? '💵' : '🔒', title: isPK ? 'Pay on Delivery' : 'Secure Payment', desc: isPK ? 'Order with full confidence. Pay cash when your order arrives — no advance required.' : 'SSL-secured checkout with card, PayPal, and more.' },
                  { icon: '🔄', title: 'Easy Returns', desc: 'Changed your mind? No problem. Our 7-day hassle-free return policy has you covered.' },
                ].map((item, i) => (
                  <div key={i} className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 border border-violet-100 hover:shadow-lg transition-all">
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="font-black text-gray-900 text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="py-14 bg-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-10"><p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Reviews</p><h2 className="text-2xl font-black text-gray-800">What Customers Say</h2></div>
              <div className="grid md:grid-cols-4 gap-5">
                {TESTIMONIALS.map((r, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex gap-0.5 mb-3">{[1,2,3,4,5].map(s => <StarIco key={s} />)}</div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs">{r.name[0]}</div>
                      <div><p className="text-sm font-bold text-gray-800">{r.name}</p><p className="text-xs text-gray-400">{r.city}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="bg-gradient-to-r from-violet-700 via-purple-700 to-violet-900 py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { num: siteSettings.stats_customers, label: 'Happy Customers' },
                  { num: siteSettings.stats_products,  label: 'Products Available' },
                  { num: siteSettings.stats_rating,    label: 'Average Rating' },
                  { num: isPK ? 'COD' : 'SSL', label: isPK ? 'Cash on Delivery' : 'Secure Checkout' },
                ].map((s, i) => (
                  <div key={i}><p className="text-white text-3xl font-black">{s.num}</p><p className="text-violet-300 text-sm mt-1">{s.label}</p></div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 bg-white relative overflow-hidden border-t border-gray-100">
            <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
              <p className="text-violet-600 text-xs font-bold uppercase tracking-widest mb-2">MaestraVibe</p>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3">Explore All Products</h2>
              <p className="text-gray-500 mb-8">Thousands of products — fashion to accessories — all in one place</p>
              <button onClick={() => navigateTo()} className="bg-violet-600 text-white px-12 py-4 rounded-xl font-black text-base hover:bg-violet-700 transition-all active:scale-95 shadow-xl shadow-violet-200">Start Shopping →</button>
            </div>
          </section>

          {/* NEWSLETTER */}
          <section className="bg-gray-900 py-14">
            <div className="max-w-xl mx-auto px-4 text-center">
              <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Newsletter</p>
              <h2 className="text-2xl font-black text-white mb-2">Get 10% Off Your First Order</h2>
              <p className="text-gray-400 text-sm mb-6">Subscribe for exclusive deals, new arrivals &amp; special offers.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="your@email.com" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} className="flex-1 px-4 py-3 rounded-xl text-sm bg-gray-800 border-2 border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors" />
                <button onClick={() => { if (newsletterEmail.trim()) setNewsletterDone(true); }} className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm transition-colors whitespace-nowrap">Subscribe</button>
              </div>
              {newsletterDone && <p className="text-green-400 text-sm mt-3 font-semibold">✅ You're subscribed! Welcome to MaestraVibe.</p>}
            </div>
          </section>

          {/* FOOTER */}
          <footer className="bg-black text-gray-400 py-10">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h3 className="text-white font-black text-lg mb-3">MaestraVibe</h3>
                  <p className="text-sm leading-relaxed">Your one-stop destination for fashion, accessories and more.</p>
                  <p className="text-xs mt-3 text-gray-500">{marketCfg.flag} Shipping to {marketCfg.label}</p>
                </div>
                {[
                  { title: 'Shop',    links: categoriesForGrid.slice(0, 5).map(c => c.label) },
                  { title: 'Help',    links: ['Returns', 'Track Order', 'FAQ', 'Contact Us'] },
                  { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Press'] },
                ].map((col, i) => (
                  <div key={i}>
                    <h4 className="text-white font-bold text-sm mb-3">{col.title}</h4>
                    <ul className="space-y-2">
                      {col.links.map(l => <li key={l}><button onClick={() => col.title === 'Shop' ? navigateTo(l.toLowerCase()) : undefined} className="text-sm hover:text-violet-400 transition-colors">{l}</button></li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                <p className="text-xs">© 2025 MaestraVibe. All rights reserved.</p>
                <p className="text-xs">Made with ❤️ in Pakistan 🇵🇰</p>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* SHOP VIEW */}
      {view === 'shop' && (
        <>
          <div className="max-w-7xl mx-auto px-4 pt-5 pb-2 flex items-center gap-2 text-xs text-gray-500">
            <button onClick={() => { setView('home'); setActiveCategory('all'); setSearchQuery(''); setSearchInput(''); }} className="hover:text-violet-600 font-medium">Home</button>
            <span>/</span>
            <span className="font-semibold text-gray-700 capitalize">
              {activeCategory !== 'all' ? categoriesForFilter.find(c => c.value === activeCategory)?.label : 'All Products'}
              {searchQuery && ` — "${searchQuery}"`}
            </span>
          </div>
          <div className="max-w-7xl mx-auto px-4 pb-4">
            <form onSubmit={e => { e.preventDefault(); setSearchQuery(searchInput.trim()); }} className="flex gap-2">
              <div className="relative flex-1 max-w-lg">
                <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search by product, category, color…" className="w-full border-2 border-gray-200 rounded-xl py-2.5 pl-4 pr-11 text-sm focus:outline-none focus:border-violet-500 transition-colors bg-white" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg w-7 h-7 flex items-center justify-center transition-colors"><SearchIco /></button>
              </div>
            </form>
          </div>
          <div className="max-w-7xl mx-auto px-4 pb-10">
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {categoriesForFilter.map(cat => (
                <button key={cat.value} onClick={() => setActiveCategory(cat.value)} className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeCategory === cat.value ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-violet-50 hover:text-violet-600 border border-gray-200'}`}>
                  {cat.emoji} {cat.label}
                </button>
              ))}s
            </div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {activeCategory !== 'all' && <span className="bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-violet-100">{categoriesForFilter.find(c => c.value === activeCategory)?.label}<button onClick={() => setActiveCategory('all')} className="hover:text-violet-900"><CloseIco /></button></span>}
                {searchQuery && <span className="bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-violet-100">&ldquo;{searchQuery}&rdquo;<button onClick={() => { setSearchInput(''); setSearchQuery(''); }} className="hover:text-violet-900"><CloseIco /></button></span>}
                <span className="text-xs text-gray-400 font-medium">{filtered.length} products</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Market indicator in shop view */}
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{marketCfg.flag} {marketCfg.symbol}</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs border-2 border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-violet-500 bg-white transition-colors">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-xs bg-white border-2 border-gray-200 hover:border-violet-400 hover:text-violet-600 px-3 py-2 rounded-xl font-semibold transition-colors relative">
                  Filters {activeFiltersCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{activeFiltersCount}</span>}
                </button>
              </div>
            </div>
            <div className="flex gap-6">
              {showFilters && (
                <aside className="w-52 shrink-0">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24 space-y-5">
                    <div className="flex items-center justify-between"><h3 className="font-black text-sm text-gray-800">Filters</h3>{activeFiltersCount > 0 && <button onClick={clearFilters} className="text-xs text-violet-500 font-semibold hover:text-violet-700">Clear all</button>}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price ({marketCfg.symbol})</p>
                      <div className="flex gap-2 mb-2">
                        <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-violet-400 transition-colors" />
                        <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-violet-400 transition-colors" />
                      </div>
                    </div>
                    {allColors.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Colors</p>
                        <div className="flex flex-wrap gap-2">{allColors.slice(0, 16).map((c: string, i: number) => <button key={i} onClick={() => setSelectedColors(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])} title={c} className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColors.includes(c) ? 'border-violet-500 scale-110 shadow-md' : 'border-gray-200 hover:border-violet-300'}`} style={{ backgroundColor: c }} />)}</div>
                      </div>
                    )}
                    {allSizes.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sizes</p>
                        <div className="flex flex-wrap gap-1.5">{allSizes.map((s: string, i: number) => <button key={i} onClick={() => setSelectedSizes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])} className={`px-2.5 py-1 text-xs rounded-lg border-2 font-semibold transition-colors ${selectedSizes.includes(s) ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-600 hover:border-violet-300'}`}>{s}</button>)}</div>
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
                    <button onClick={() => { setSearchInput(''); setSearchQuery(''); clearFilters(); setActiveCategory('all'); }} className="mt-5 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">View All Products</button>
                  </div>
                ) : (
                  <div className={`grid gap-5 ${showFilters ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                    {filtered.map((product: any, idx: number) => <ProductCard key={product._id ?? idx} product={product} />)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* PRODUCT MODAL */}
      {selectedProduct && (() => {
        const activeVariant = findVariant(selectedProduct, selectedSize, selectedColor);
        const modalPrice     = activeVariant ? activeVariant.price : selectedProduct.price;
        const modalOutOfStock = activeVariant && activeVariant.stock !== null && activeVariant.stock !== undefined && activeVariant.stock <= 0;
        return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-4xl rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[94vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-5 bg-gray-50">
                <img src={selectedProduct.images?.[selectedImageIndex] ?? 'https://via.placeholder.com/600'} className="w-full rounded-2xl shadow object-cover" style={{ maxHeight: '340px' }} alt={selectedProduct.name} />
                {selectedProduct.images?.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {selectedProduct.images.map((img: string, i: number) => <img key={i} src={img} onClick={() => setSelectedImageIndex(i)} className={`cursor-pointer rounded-xl border-2 h-16 w-16 object-cover shrink-0 transition-all ${selectedImageIndex === i ? 'border-violet-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`} alt={`t${i}`} />)}
                  </div>
                )}
              </div>
              <div className="md:w-1/2 p-5 md:p-7">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs uppercase text-violet-500 font-bold tracking-wider capitalize">{selectedProduct.category}</span>
                      <ProductBadges product={selectedProduct} />
                    </div>
                    <h1 className="text-xl md:text-2xl font-black mt-0.5 text-gray-900">{selectedProduct.name}</h1>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors ml-2 shrink-0"><CloseIco /></button>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <p className="text-3xl font-black text-violet-700">{formatPrice(modalPrice, market)}</p>
                  {modalOutOfStock && <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>}
                </div>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed whitespace-pre-line">{selectedProduct.description}</p>
                {selectedProduct.colors?.length > 0 && (
                  <div className="mb-5">
                    <p className="font-bold text-sm mb-2 text-gray-800">Color: <span className="text-gray-500 font-normal">{selectedColor}</span></p>
                    <div className="flex gap-3 flex-wrap">{selectedProduct.colors.map((color: string, i: number) => <button key={i} onClick={() => setSelectedColor(color)} title={color} className={`w-9 h-9 rounded-full border-4 transition-all ${selectedColor === color ? 'border-violet-500 scale-110 shadow-md' : 'border-gray-200 hover:border-violet-300'}`} style={{ backgroundColor: color }} />)}</div>
                  </div>
                )}
                {selectedProduct.sizes?.length > 0 && (
                  <div className="mb-6">
                    <p className="font-bold text-sm mb-2 text-gray-800">Size</p>
                    <div className="flex gap-2 flex-wrap">{selectedProduct.sizes.map((size: string, i: number) => <button key={i} onClick={() => setSelectedSize(size)} className={`px-4 py-2 border-2 rounded-xl text-sm font-semibold transition-all ${selectedSize === size ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 hover:border-violet-400 text-gray-700'}`}>{size}</button>)}</div>
                  </div>
                )}
                <div className="flex gap-3 mb-3">
                  <button onClick={() => addToCart(selectedProduct)} disabled={!!modalOutOfStock} className="flex-1 py-3.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"><CartIco cls="w-4 h-4" /> Add to Cart</button>
                  <button onClick={() => handleBuyNow(selectedProduct)} disabled={!!modalOutOfStock} className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-colors">Buy Now</button>
                </div>
                <button onClick={() => { openProductPage(selectedProduct); setSelectedProduct(null); }} className="w-full py-3 border-2 border-gray-200 hover:border-violet-400 text-gray-600 hover:text-violet-600 rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"><EyeIco /> View Full Details</button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* CART */}
      {showCart && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-end" onClick={() => { setShowCart(false); onCartClose?.(); }}>
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center bg-white">
              <h2 className="text-lg font-black text-gray-900">Your Cart <span className="text-violet-600">({cartCount} {cartCount === 1 ? 'item' : 'items'})</span></h2>
              <button onClick={() => { setShowCart(false); onCartClose?.(); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><CloseIco /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20"><div className="text-5xl mb-4">🛒</div><p className="text-gray-500 font-semibold">Your cart is empty</p><button onClick={() => { setShowCart(false); navigateTo(); }} className="mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">Start Shopping</button></div>
              ) : cart.map((item, index) => (
                <div key={index} className="flex gap-3 border border-gray-100 rounded-2xl p-3 bg-gray-50">
                  <img src={item.images?.[0]} className="w-20 h-20 object-cover rounded-xl shrink-0" alt={item.name} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-2 text-gray-800">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1"><span className="w-3.5 h-3.5 rounded-full border shrink-0 ring-1 ring-gray-200" style={{ backgroundColor: item.selectedColor }} /><span className="text-xs text-gray-500">{item.selectedColor}</span>{item.selectedSize && item.selectedSize !== 'Standard' && <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">{item.selectedSize}</span>}</div>
                    {/* Price active market mein ── */}
                    <p className="font-black text-violet-700 text-sm mt-1">{formatPrice(item.price * item.quantity, market)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => setCart(p => p.map((x, i) => i === index ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))} className="w-7 h-7 border-2 rounded-lg text-sm font-bold hover:border-violet-400 transition-colors flex items-center justify-center text-gray-600">−</button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => setCart(p => p.map((x, i) => i === index ? { ...x, quantity: x.quantity + 1 } : x))} className="w-7 h-7 border-2 rounded-lg text-sm font-bold hover:border-violet-400 transition-colors flex items-center justify-center text-gray-600">+</button>
                      <button onClick={() => setCart(p => p.filter((_, i) => i !== index))} className="text-red-400 text-xs ml-2 hover:text-red-600 font-semibold">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t bg-white">
                <div className="flex justify-between mb-4"><span className="font-bold text-gray-700">Total</span><span className="font-black text-xl text-violet-700">{formatPrice(cartTotal, market)}</span></div>
                <button onClick={() => { setCheckoutProduct(null); setCheckoutStep(1); setShowCart(false); setShowCheckout(true); }} className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-base transition-all">Proceed to Checkout ({cartCount} items)</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl max-h-[96vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <button onClick={() => checkoutStep === 2 ? setCheckoutStep(1) : (setShowCheckout(false), setCheckoutProduct(null))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><BackIco /></button>
                <div>
                  <h2 className="text-lg font-black">{checkoutStep === 1 ? 'Order Review' : 'Delivery Details'}</h2>
                  <div className="flex items-center gap-1 mt-1"><div className="h-1.5 w-10 rounded-full bg-violet-600" /><div className={`h-1.5 w-10 rounded-full transition-colors ${checkoutStep >= 2 ? 'bg-violet-600' : 'bg-gray-200'}`} /></div>
                </div>
              </div>
              <button onClick={() => { setShowCheckout(false); setCheckoutProduct(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><CloseIco /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              {checkoutStep === 1 && (
                <div>
                  <div className="space-y-3 mb-5">
                    {checkoutItems.map((item, i) => (
                      <div key={i} className="flex gap-3 bg-gray-50 rounded-2xl p-4 items-center border border-gray-100">
                        <img src={item.images?.[0]} className="w-16 h-16 object-cover rounded-xl shrink-0" alt={item.name} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm line-clamp-2 text-gray-800">{item.name}</p>
                          <p className="font-black text-violet-700 mt-1">{formatPrice(item.price * (item.quantity || 1), market)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-violet-50 rounded-2xl p-4 flex justify-between items-center mb-4 border border-violet-100"><span className="font-bold text-gray-700">Total Amount</span><span className="font-black text-violet-700 text-xl">{formatPrice(orderTotal, market)}</span></div>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-sm text-amber-800">
                    {isPK ? <><strong>Cash on Delivery</strong> — Pay when you receive your order. No advance required.</> : <><strong>Secure Payment</strong> — Pay safely online. Currency: {marketCfg.currency}</>}
                  </div>
                  <button onClick={() => setCheckoutStep(2)} className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2">Continue to Delivery <ChevR /></button>
                </div>
              )}
              {checkoutStep === 2 && (
                <form onSubmit={submitOrder}>
                  <button type="button" onClick={detectLocation} disabled={locationLoading} className="w-full mb-5 py-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                    {locationLoading ? <><SpinIco /> Detecting location…</> : <><LocIco /> Auto-detect My Location</>}
                  </button>
                  <div className="space-y-4">
                    {[
                      { label: 'Full Name', key: 'name',  type: 'text',  placeholder: 'Your full name',                                         required: true  },
                      { label: 'Phone',     key: 'phone', type: 'tel',   placeholder: isPK ? '03XX-XXXXXXX' : marketCfg.phone,                  required: true  },
                      { label: 'Email',     key: 'email', type: 'email', placeholder: 'email@example.com',                                       required: false },
                      { label: 'City',      key: 'city',  type: 'text',  placeholder: isPK ? 'Karachi, Lahore…' : 'Your city',                   required: true  },
                      { label: 'Area',      key: 'area',  type: 'text',  placeholder: isPK ? 'Gulshan, DHA…' : 'District / suburb',              required: true  },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-sm font-bold mb-1.5 text-gray-700">{field.label} {field.required && <span className="text-red-400">*</span>}</label>
                        <input type={field.type} placeholder={field.placeholder} required={field.required} className={inputCls} value={(customerInfo as any)[field.key]} onChange={e => setCustomerInfo({ ...customerInfo, [field.key]: e.target.value })} />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-bold mb-1.5 text-gray-700">Full Address <span className="text-red-400">*</span></label>
                      <textarea placeholder="House/flat number, street, area, landmark…" required rows={3} className={`${inputCls} resize-none`} value={customerInfo.address} onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })} />
                    </div>
                  </div>
                  <div className="mt-5 bg-gray-50 rounded-2xl p-4 flex justify-between items-center border border-gray-100"><span className="text-sm text-gray-500">{checkoutItems.length} item(s)</span><span className="font-black text-violet-700">{formatPrice(orderTotal, market)}</span></div>
                  <button type="submit" disabled={orderLoading} className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2">
                    {orderLoading ? <><SpinIco /> Processing…</> : <><CheckIco /> Place Order</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ORDER SUCCESS */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">✅</div>
            <h1 className="text-3xl font-black text-green-600 mb-2">Order Placed!</h1>
            <p className="text-gray-500 mb-6">Thank you for choosing MaestraVibe!</p>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-6 text-left text-sm space-y-2 text-gray-700">
              {['Order confirmed', 'Packaging will begin shortly', 'Delivery in 2–4 business days', isPK ? 'Pay the delivery person on arrival' : 'Payment collected online'].map((s, i) => <p key={i} className="flex items-center gap-2"><CheckIco /> {s}</p>)}
            </div>
            <button onClick={() => setShowSuccess(false)} className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-4 rounded-2xl font-black transition-all">Continue Shopping</button>
          </div>
        </div>
      )}

      {/* ── ASTRO BHAI AI CHAT — Full version, har page par ── */}
      <AIChat
        products={chatProducts}
        onOpenProduct={openProductPage}
        onAddToCart={addToCart}
        pageContext={`${view === 'shop' ? 'Shop' : 'Home'} • ${activeCategory !== 'all' ? activeCategory : 'All categories'} • ${searchQuery || 'No search'} • ${viewProductPage ? `Viewing ${viewProductPage.name}` : 'Browsing'}`}
        cartItems={cart.map(item => ({ name: item.name, price: item.price, qty: item.quantity }))}
      />

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 border-t border-gray-200 backdrop-blur-xl shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.25)]">
        <div className="grid grid-cols-4 px-2 py-2">
          <button onClick={() => { setView('home'); setViewProductPage(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex flex-col items-center gap-1 py-2 text-xs font-semibold text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3"/></svg>
            Home
          </button>
          <button onClick={() => { setView('shop'); setActiveCategory('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex flex-col items-center gap-1 py-2 text-xs font-semibold text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7"/></svg>
            Shop
          </button>
          <button onClick={() => setShowCart(true)} className="flex flex-col items-center gap-1 py-2 text-xs font-semibold text-gray-700">
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z"/></svg>
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] font-black rounded-full min-w-[14px] h-[14px] px-1 flex items-center justify-center">{cartCount}</span>}
            </div>
            Cart
          </button>
          <button onClick={() => setShowCart(true)} className="flex flex-col items-center gap-1 py-2 text-xs font-semibold text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7"/></svg>
            More
          </button>
        </div>
      </div>

    </main>
  );
}