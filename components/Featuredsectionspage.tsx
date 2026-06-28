'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useMarket } from '@/lib/market-context';

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  description?: string;
  colors?: string[];
  sizes?: string[];
  festival?: string;       // admin panel se: 'eid' | 'christmas' | 'independence' | 'wedding' | ''
  festivalImage?: string;  // product ke saath festival banner image
  isNew?: boolean;
  isTrending?: boolean;
  createdAt?: string;
}

// ─── MARKET CONFIG ────────────────────────────────────────────────────────────
const MARKET_CONFIG: Record<string, { symbol: string; conversionRate: number }> = {
  pk: { symbol: 'Rs.',  conversionRate: 1   },
  us: { symbol: '$',    conversionRate: 280  },
  ae: { symbol: 'AED',  conversionRate: 76   },
  uk: { symbol: '£',    conversionRate: 355  },
};

const formatPrice = (pricePKR: number, market: string): string => {
  const cfg = MARKET_CONFIG[market] ?? MARKET_CONFIG['pk'];
  const val = pricePKR / cfg.conversionRate;
  if (market === 'pk') return `Rs. ${pricePKR.toLocaleString()}`;
  return `${cfg.symbol}${val.toFixed(market === 'ae' ? 0 : 2)}`;
};

// ─── FESTIVAL CONFIG ──────────────────────────────────────────────────────────
const FESTIVAL_CONFIG: Record<string, {
  label: string; emoji: string;
  gradient: string; accentColor: string; textColor: string;
  pattern: string; badge: string;
  defaultBannerImage: string;
}> = {
  eid: {
    label: 'Eid Collection',
    emoji: '🌙',
    gradient: 'linear-gradient(135deg, #1a472a 0%, #2d6a4f 40%, #52b788 100%)',
    accentColor: '#d4a017',
    textColor: '#fff8e1',
    pattern: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a017' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
    badge: 'Eid Mubarak Special',
    defaultBannerImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop',
  },
  christmas: {
    label: 'Christmas Collection',
    emoji: '🎄',
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
    accentColor: '#fbbf24',
    textColor: '#fef3c7',
    pattern: "url(\"data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='0.07'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
    badge: 'Christmas Special',
    defaultBannerImage: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&auto=format&fit=crop',
  },
  independence: {
    label: 'Independence Day Collection',
    emoji: '🇵🇰',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    pattern: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.06' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
    badge: '14 August Special',
    defaultBannerImage: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop',
  },
  wedding: {
    label: 'Wedding Season Collection',
    emoji: '💍',
    gradient: 'linear-gradient(135deg, #4c0519 0%, #881337 50%, #be123c 100%)',
    accentColor: '#fbbf24',
    textColor: '#fff1f2',
    pattern: "url(\"data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l15.092 15.092-1.414 1.414L40 9.414 23.908 25.506l-1.414-1.414L37.586 8H24V6h22v22h-2V8.414z' fill='%23fbbf24' fill-opacity='0.07' fill-rule='evenodd'/%3E%3C/svg%3E\")",
    badge: 'Bridal & Wedding Special',
    defaultBannerImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop',
  },
  sale: {
    label: 'Mega Sale',
    emoji: '🔥',
    gradient: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #c2410c 100%)',
    accentColor: '#fbbf24',
    textColor: '#fff7ed',
    pattern: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.06' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
    badge: 'Mega Sale — Up to 70% Off',
    defaultBannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop',
  },
};

// ─── ICONS ───────────────────────────────────────────────────────────────────
const StarIco = () => (
  <svg className="w-3 h-3 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
const CartIco = ({ cls = 'w-4 h-4' }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" />
  </svg>
);
const HeartIco = ({ filled }: { filled: boolean }) =>
  filled ? (
    <svg className="w-4 h-4 fill-rose-500 text-rose-500" viewBox="0 0 24 24">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ) : (
    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
const ChevL = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevR = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
  </svg>
);
const SparkleIco = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
);
const FlameIco = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2c0 0-5 5-5 10a5 5 0 0010 0c0-2-1-4-2-5 0 2-1 3-2 3-1 0-1.5-1-1-2.5C12 6 12 2 12 2z" />
  </svg>
);
const CheckIco = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({
  product, market, onOpen, onAddToCart, onBuyNow,
  wishlisted, onToggleWish, addedToCart, variant = 'default',
}: {
  product: Product; market: string;
  onOpen: (p: Product) => void; onAddToCart: (p: Product) => void; onBuyNow: (p: Product) => void;
  wishlisted: boolean; onToggleWish: (id: string) => void;
  addedToCart: string | null; variant?: 'default' | 'festival';
}) {
  const isFestival = variant === 'festival';
  const festCfg = product.festival ? FESTIVAL_CONFIG[product.festival] : null;

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 cursor-pointer shrink-0"
      style={{
        width: isFestival ? '260px' : '220px',
        background: isFestival && festCfg
          ? `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, white 60%)`
          : 'white',
        borderColor: isFestival && festCfg ? festCfg.accentColor + '44' : '#f3f4f6',
        boxShadow: isFestival
          ? `0 4px 24px -4px ${festCfg?.accentColor ?? '#9333ea'}33`
          : '0 2px 12px -2px rgba(0,0,0,0.08)',
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50" style={{ height: isFestival ? '220px' : '200px' }}>
        <img
          src={product.images?.[0] ?? 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onClick={() => onOpen(product)}
          draggable={false}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-violet-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">New ✨</span>
          )}
          {product.isTrending && (
            <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">🔥 Hot</span>
          )}
          {isFestival && festCfg && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full shadow-lg"
              style={{ background: festCfg.accentColor, color: '#1a1a1a' }}
            >
              {festCfg.emoji} {product.festival?.charAt(0).toUpperCase()}{product.festival?.slice(1)}
            </span>
          )}
        </div>

        {/* Wishlist btn */}
        <button
          onClick={e => { e.stopPropagation(); onToggleWish(product._id); }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        >
          <HeartIco filled={wishlisted} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 capitalize mb-1 font-medium">{product.category}</p>
        <h3
          onClick={() => onOpen(product)}
          className="font-semibold text-sm text-gray-800 line-clamp-2 mb-2 leading-snug hover:text-violet-600 transition-colors"
        >
          {product.name}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map(s => <StarIco key={s} />)}
          <span className="text-xs text-gray-400 ml-1">4.8</span>
        </div>

        {/* Color swatches */}
        {product.colors && product.colors?.length > 0 && (
          <div className="flex gap-1 mb-3">
            {product.colors.slice(0, 5).map((c, i) => (
              <span key={i} className="w-3.5 h-3.5 rounded-full border border-white ring-1 ring-gray-200" style={{ backgroundColor: c }} />
            ))}
            {product.colors?.length > 5 && <span className="text-xs text-gray-400 self-center">+{product.colors?.length ?? 0 - 5}</span>}
          </div>
        )}

        {/* Price */}
        <p
          className="font-black text-lg mt-auto mb-3"
          style={{ color: isFestival && festCfg ? festCfg.accentColor.replace('24', '00').slice(0, 7) !== '#fbbf' ? festCfg.accentColor : '#d97706' : '#7c3aed' }}
        >
          {formatPrice(product.price, market)}
        </p>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className={`flex-1 py-2.5 text-xs rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              addedToCart === product._id
                ? 'bg-green-500 text-white scale-95'
                : 'bg-gray-900 text-white hover:bg-gray-700'
            }`}
          >
            {addedToCart === product._id ? <><CheckIco /> Added</> : <><CartIco cls="w-3.5 h-3.5" /> Add</>}
          </button>
          <button
            onClick={() => onBuyNow(product)}
            className="flex-1 py-2.5 text-xs rounded-xl font-semibold text-white transition-all duration-200"
            style={{
              background: isFestival && festCfg
                ? festCfg.gradient
                : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTO SCROLL SLIDER ───────────────────────────────────────────────────────
function AutoScrollSlider({
  children, speed = 0.5,
}: {
  children: React.ReactNode; speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(0);
  const scrollStart = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf: number;
    const step = () => {
      if (!paused && !isDragging && track) {
        track.scrollLeft += speed;
        if (track.scrollLeft >= track.scrollWidth / 2) {
          track.scrollLeft -= track.scrollWidth / 2;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, isDragging, speed]);

  return (
    <div
      ref={trackRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); setIsDragging(false); }}
      onMouseDown={e => { setIsDragging(true); dragStart.current = e.clientX; scrollStart.current = trackRef.current?.scrollLeft ?? 0; }}
      onMouseMove={e => { if (!isDragging || !trackRef.current) return; trackRef.current.scrollLeft = scrollStart.current - (e.clientX - dragStart.current); }}
      onMouseUp={() => setIsDragging(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      className="flex gap-5 overflow-x-hidden select-none"
      style={{ scrollBehavior: 'auto', cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {children}
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({
  eyebrow, title, icon, accentColor = '#7c3aed', onViewAll,
}: {
  eyebrow: string; title: string; icon: React.ReactNode;
  accentColor?: string; onViewAll?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-7">
      <div className="flex items-center gap-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
          style={{ background: accentColor }}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>
            {eyebrow}
          </p>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">{title}</h2>
        </div>
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-sm font-semibold flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 transition-all hover:scale-105"
          style={{ color: accentColor, borderColor: accentColor + '33', background: accentColor + '0d' }}
        >
          View All <ChevR />
        </button>
      )}
    </div>
  );
}

// ─── FESTIVAL BANNER ─────────────────────────────────────────────────────────
function FestivalBanner({
  festival, products, bannerImage,
}: {
  festival: string; products: Product[]; bannerImage?: string;
}) {
  const cfg = FESTIVAL_CONFIG[festival];
  if (!cfg) return null;

  const [imgErr, setImgErr] = useState(false);
  const heroImg = !imgErr && bannerImage ? bannerImage : cfg.defaultBannerImage;

  return (
    <div
      className="relative rounded-3xl overflow-hidden mb-8"
      style={{ background: cfg.gradient, minHeight: '220px' }}
    >
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-100" style={{ backgroundImage: cfg.pattern }} />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
        {/* Left: Text */}
        <div className="flex-1 min-w-0">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-3"
            style={{ background: cfg.accentColor + '22', color: cfg.accentColor, border: `1px solid ${cfg.accentColor}44` }}
          >
            <span>{cfg.emoji}</span> {cfg.badge}
          </div>
          <h2
            className="text-3xl md:text-4xl font-black leading-tight mb-2"
            style={{ color: cfg.textColor }}
          >
            {cfg.label}
          </h2>
          <p className="text-sm mb-4 opacity-80" style={{ color: cfg.textColor }}>
            {products.length} exclusive products — curated for the occasion
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 cursor-pointer shadow-lg"
              style={{ background: cfg.accentColor, color: '#1a1a1a' }}
            >
              Shop Collection →
            </span>
            <span className="text-xs opacity-60" style={{ color: cfg.textColor }}>
              {products.length} items
            </span>
          </div>
        </div>

        {/* Right: Banner image */}
        <div className="relative shrink-0 md:w-72 w-full" style={{ height: '160px' }}>
          <img
            src={heroImg}
            alt={cfg.label}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover rounded-2xl shadow-2xl"
            style={{ border: `2px solid ${cfg.accentColor}44` }}
          />
          {/* Glow effect */}
          <div
            className="absolute -inset-2 rounded-2xl blur-xl opacity-30 -z-10"
            style={{ background: cfg.accentColor }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── FESTIVAL SECTION ─────────────────────────────────────────────────────────
function FestivalSection({
  festivalGroups, market, onOpen, onAddToCart, onBuyNow,
  wishlist, onToggleWish, addedToCart,
}: {
  festivalGroups: Record<string, { products: Product[]; bannerImage?: string }>;
  market: string;
  onOpen: (p: Product) => void; onAddToCart: (p: Product) => void; onBuyNow: (p: Product) => void;
  wishlist: string[]; onToggleWish: (id: string) => void; addedToCart: string | null;
}) {
  const festivals = Object.keys(festivalGroups).filter(k => festivalGroups[k].products.length > 0);
  if (festivals.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-2">Special Occasions</p>
          <h2 className="text-3xl font-black text-gray-900">Festival Collections</h2>
          <p className="text-gray-500 text-sm mt-2">Curated picks for every celebration</p>
        </div>

        {/* Each festival */}
        {festivals.map(fest => {
          const { products, bannerImage } = festivalGroups[fest];
          const cfg = FESTIVAL_CONFIG[fest];
          if (!cfg) return null;
          const loopItems = [...products, ...products];

          return (
            <div key={fest} className="mb-14">
              {/* Banner */}
              <FestivalBanner festival={fest} products={products} bannerImage={bannerImage} />

              {/* Products strip */}
              <div className="overflow-hidden">
                <AutoScrollSlider speed={0.4}>
                  {loopItems.map((product, idx) => (
                    <ProductCard
                      key={`${product._id}-${idx}`}
                      product={product}
                      market={market}
                      onOpen={onOpen}
                      onAddToCart={onAddToCart}
                      onBuyNow={onBuyNow}
                      wishlisted={wishlist.includes(product._id)}
                      onToggleWish={onToggleWish}
                      addedToCart={addedToCart}
                      variant="festival"
                    />
                  ))}
                </AutoScrollSlider>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── NAVIGATION DOT SLIDER ───────────────────────────────────────────────────
function DotSlider({
  items, market, onOpen, onAddToCart, onBuyNow,
  wishlist, onToggleWish, addedToCart, visibleCount = 4,
}: {
  items: Product[]; market: string;
  onOpen: (p: Product) => void; onAddToCart: (p: Product) => void; onBuyNow: (p: Product) => void;
  wishlist: string[]; onToggleWish: (id: string) => void;
  addedToCart: string | null; visibleCount?: number;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / visibleCount);
  const visible = items.slice(page * visibleCount, page * visibleCount + visibleCount);

  // Auto-advance every 4s
  useEffect(() => {
    if (totalPages <= 1) return;
    const id = setInterval(() => setPage(p => (p + 1) % totalPages), 4000);
    return () => clearInterval(id);
  }, [totalPages]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        {visible.map(product => (
          <ProductCard
            key={product._id}
            product={product}
            market={market}
            onOpen={onOpen}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
            wishlisted={wishlist.includes(product._id)}
            onToggleWish={onToggleWish}
            addedToCart={addedToCart}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => (p - 1 + totalPages) % totalPages)} className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-violet-400 hover:text-violet-600 transition-all">
            <ChevL />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`transition-all rounded-full ${i === page ? 'w-6 h-2.5 bg-violet-600' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'}`} />
            ))}
          </div>
          <button onClick={() => setPage(p => (p + 1) % totalPages)} className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-violet-400 hover:text-violet-600 transition-all">
            <ChevR />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN: FEATURED SECTIONS PAGE ────────────────────────────────────────────
interface FeaturedSectionsPageProps {
  onOpenProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export default function FeaturedSectionsPage({
  onOpenProduct,
  onAddToCart,
  onBuyNow,
}: FeaturedSectionsPageProps) {
  const { market } = useMarket();

  const [allProducts, setAllProducts]   = useState<Product[]>([]);
  const [loading,     setLoading]       = useState(true);
  const [wishlist,    setWishlist]      = useState<string[]>([]);
  const [addedToCart, setAddedToCart]   = useState<string | null>(null);

  // Load products
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.ok ? r.json() : [])
      .then((data: Product[]) => setAllProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));

    try {
      const w = localStorage.getItem('mv_wish');
      if (w) setWishlist(JSON.parse(w));
    } catch {}
  }, []);

  const toggleWish = (id: string) =>
    setWishlist(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem('mv_wish', JSON.stringify(next)); } catch {}
      return next;
    });

  const handleAddToCart = (product: Product) => {
    onAddToCart?.(product);
    setAddedToCart(product._id);
    setTimeout(() => setAddedToCart(null), 1800);
  };

  const handleOpen   = (p: Product) => onOpenProduct?.(p);
  const handleBuyNow = (p: Product) => onBuyNow?.(p);

  // ── Derive sections ──
  // New Arrivals: latest 12 by createdAt or just last 12 in array
  const newArrivals = [...allProducts]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 16);

  // Trending: highest priced / marked isTrending
  const trending = [...allProducts]
    .sort((a, b) => {
      if (a.isTrending && !b.isTrending) return -1;
      if (!a.isTrending && b.isTrending) return 1;
      return (b.price || 0) - (a.price || 0);
    })
    .slice(0, 16);

  // Festival groups: group by festival tag, get banner image from first product that has festivalImage
  const festivalGroups: Record<string, { products: Product[]; bannerImage?: string }> = {};
  allProducts.forEach(p => {
    if (!p.festival) return;
    if (!festivalGroups[p.festival]) {
      festivalGroups[p.festival] = { products: [], bannerImage: p.festivalImage };
    }
    festivalGroups[p.festival].products.push(p);
    if (p.festivalImage && !festivalGroups[p.festival].bannerImage) {
      festivalGroups[p.festival].bannerImage = p.festivalImage;
    }
  });

  const hasFestivals = Object.values(festivalGroups).some(g => g.products.length > 0);

  // Skeleton
  const SkeletonRow = () => (
    <div className="flex gap-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="shrink-0 w-52 rounded-2xl overflow-hidden animate-pulse bg-white shadow-sm border border-gray-100">
          <div className="h-48 bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded-xl mt-3" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — NEW ARRIVALS (dot-pagination grid slider)
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader
            eyebrow="Just Landed"
            title="New Arrivals"
            icon={<SparkleIco />}
            accentColor="#7c3aed"
            onViewAll={() => window.dispatchEvent(new CustomEvent('mv:navigate', { detail: { cat: 'all' } }))}
          />

          {loading ? (
            <SkeletonRow />
          ) : newArrivals.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-semibold">No new arrivals yet</p>
            </div>
          ) : (
            /* Grid with dot-nav — pauses on hover, auto-pages every 4s */
            <DotSlider
              items={newArrivals}
              market={market}
              onOpen={handleOpen}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              wishlist={wishlist}
              onToggleWish={toggleWish}
              addedToCart={addedToCart}
              visibleCount={4}
            />
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — TRENDING (infinite auto-scroll strip)
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-gradient-to-b from-violet-50/50 to-white border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-7">
          <SectionHeader
            eyebrow="Hot Right Now"
            title="Trending Products"
            icon={<FlameIco />}
            accentColor="#e11d48"
            onViewAll={() => window.dispatchEvent(new CustomEvent('mv:navigate', { detail: { cat: 'all' } }))}
          />
        </div>

        {loading ? (
          <div className="max-w-7xl mx-auto px-4">
            <SkeletonRow />
          </div>
        ) : trending.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔥</p>
            <p className="font-semibold">No trending products yet</p>
          </div>
        ) : (
          /* Infinite scroll — hover to pause, drag to scroll manually */
          <div className="px-4 max-w-7xl mx-auto">
            <div className="relative">
              {/* Left fade */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-white/60 to-transparent" />
              {/* Right fade */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-white/60 to-transparent" />

              <AutoScrollSlider speed={0.55}>
                {[...trending, ...trending].map((product, idx) => (
                  <ProductCard
                    key={`${product._id}-${idx}`}
                    product={{ ...product, isTrending: true }}
                    market={market}
                    onOpen={handleOpen}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    wishlisted={wishlist.includes(product._id)}
                    onToggleWish={toggleWish}
                    addedToCart={addedToCart}
                  />
                ))}
              </AutoScrollSlider>
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — FESTIVAL (only shows when products have festival tag)
      ══════════════════════════════════════════════════════════════ */}
      {!loading && hasFestivals && (
        <div className="border-b border-gray-100">
          <FestivalSection
            festivalGroups={festivalGroups}
            market={market}
            onOpen={handleOpen}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            wishlist={wishlist}
            onToggleWish={toggleWish}
            addedToCart={addedToCart}
          />
        </div>
      )}

      {/* Empty state when no festivals */}
      {!loading && !hasFestivals && (
        <section className="py-12 max-w-7xl mx-auto px-4">
          <div
            className="rounded-3xl p-10 text-center border-2 border-dashed border-gray-200"
            style={{ background: 'linear-gradient(135deg, #f5f3ff, #faf5ff)' }}
          >
            <div className="text-5xl mb-4">🎊</div>
            <h3 className="text-xl font-black text-gray-700 mb-2">Festival Collections</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Festival section activates automatically when products with a festival tag are added from the admin panel — Eid, Christmas, Independence Day, Wedding, or Sale.
            </p>
          </div>
        </section>
      )}

    </div>
  );
}