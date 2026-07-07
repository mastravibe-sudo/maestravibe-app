'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // ✅ NEW
import { useMarket } from '@/lib/market-context';

import AIChat from '@/components/AIChat';

import {
  DEFAULT_SETTINGS, FALLBACK_CATEGORIES, FALLBACK_SLIDES,
  MARKET_CONFIG,
} from '@/lib/home/constants';
import {
  effectivePrice, loadCart, loadRecentlyViewed, loadWish,
  playSound, saveCart, saveRecentlyViewed, saveWish,
} from '@/lib/home/helpers';
import type { CmsBanner, CmsCategory, CustomerInfo, SiteSettings, Slide } from '@/lib/home/types';

import CartDrawer from '@/components/home/CartDrawer';
import CategoriesSection from '@/components/home/CategoriesSection';
import CheckoutFlow from '@/components/home/CheckoutFlow';
import FestivalBanner from '@/components/home/FestivalBanner';
import FlashSaleBanner from '@/components/home/FlashSaleBanner';
import HeroSlider from '@/components/home/HeroSlider';
import MobileNav from '@/components/home/MobileNav';
import NewsletterSection from '@/components/home/NewsletterSection';
import OrderSuccessModal from '@/components/home/OrderSuccessModal';
import ProductCard from '@/components/home/ProductCard';
import ProductDetailPage from '@/components/home/ProductDetailPage';
import ProductModal from '@/components/home/ProductModal';
import RecentlyViewedSection from '@/components/home/RecentlyViewedSection';
import ShopView from '@/components/home/ShopView';
import Skeleton from '@/components/home/Skeleton';
import SiteFooter from '@/components/home/SiteFooter';
import StatsSection from '@/components/home/StatsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import TrendingNowSection from '@/components/home/TrendingNowSection';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import { ShieldIco, TruckIco } from '@/components/home/icons';

// ── HomePageProps ─────────────────────────────────────────────────────────────
interface HomePageProps {
  cartCount?: number;
  onCartCountChange?: React.Dispatch<React.SetStateAction<number>>;
  showCart?: boolean;
  onCartClose?: () => void;
}

export default function HomePage({
  cartCount,
  onCartCountChange,
  showCart: showCartProp = false,
  onCartClose,
}: HomePageProps) {
  void cartCount;

  const { market } = useMarket();
  const marketCfg = MARKET_CONFIG[market] ?? MARKET_CONFIG['pk'];
  const isPK = market === 'pk';

  const searchParams = useSearchParams(); // ✅ NEW
  const router = useRouter(); // ✅ NEW

  const [view, setView] = useState('home');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  const [cmsBanners, setCmsBanners] = useState<CmsBanner[]>([]);
  const [cmsCategories, setCmsCategories] = useState<CmsCategory[]>([]);

  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [viewProductPage, setViewProductPage] = useState<any>(null);

  const [cart, setCart] = useState<any[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishLoaded, setWishLoaded] = useState(false);

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutProduct, setCheckoutProduct] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', email: '', phone: '', address: '', city: '', area: '' });

  // ── Init ──
  useEffect(() => {
    setCart(loadCart());     setCartLoaded(true);
    setWishlist(loadWish()); setWishLoaded(true);
    setRecentlyViewed(loadRecentlyViewed());
  }, []);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setSiteSettings(prev => ({ ...prev, ...data })); })
      .catch(() => {});
  }, []);

  const loadCms = useCallback(async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        fetch('/api/banners').catch(() => null),
        fetch('/api/categories').catch(() => null),
      ]);
      const banners = bRes && bRes.ok ? await bRes.json() : [];
      const categories = cRes && cRes.ok ? await cRes.json() : [];
      setCmsBanners(Array.isArray(banners) ? banners : []);
      setCmsCategories(Array.isArray(categories) ? categories : []);
    } catch {}
  }, []);
  useEffect(() => { loadCms(); }, [loadCms]);

  useEffect(() => { if (cartLoaded) saveCart(cart); }, [cart, cartLoaded]);
  useEffect(() => { if (wishLoaded) saveWish(wishlist); }, [wishlist, wishLoaded]);
  useEffect(() => { onCartCountChange?.(cart.reduce((s, i) => s + i.quantity, 0)); }, [cart, onCartCountChange]);
  useEffect(() => { if (showCartProp) setShowCart(true); }, [showCartProp]);

  // ── Derived: banners & categories (memoized — only recompute when their source data changes) ──
  const activeBanners = useMemo(() => (
    cmsBanners
      .filter(b => b.is_active && (b.market === 'both' || b.market === market))
      .sort((a, b) => a.sort_order - b.sort_order)
  ), [cmsBanners, market]);

  const slides: Slide[] = useMemo(() => (
    activeBanners.length > 0
      ? activeBanners.map(b => ({ id: b.id, image: b.image_url, fallback: '', title: b.title, sub: b.subtitle, tag: b.tag, buttonLabel: b.button_label || 'Shop Now', buttonLink: b.button_link || 'all' }))
      : FALLBACK_SLIDES.map((s, i) => ({ id: `fallback-${i}`, image: s.image, fallback: s.fallback, title: s.title, sub: s.sub, tag: s.tag, buttonLabel: 'Shop Now', buttonLink: 'all' }))
  ), [activeBanners]);

  const activeCategories = useMemo(() => (
    cmsCategories.filter(c => c.is_active).sort((a, b) => a.sort_order - b.sort_order)
  ), [cmsCategories]);

  const categoriesForGrid = useMemo(() => (
    activeCategories.length > 0
      ? activeCategories.map(c => ({ label: c.label, value: c.value, image: c.image_url, emoji: c.emoji }))
      : FALLBACK_CATEGORIES.map(c => ({ label: c.label, value: c.value, image: c.image_url, emoji: c.emoji }))
  ), [activeCategories]);

  const categoriesForFilter = useMemo(() => (
    [{ label: 'All', value: 'all', image: '', emoji: '' }, ...categoriesForGrid]
  ), [categoriesForGrid]);

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

  // ── Derived: filters (memoized — these used to recompute on every render,
  // including renders caused by unrelated state like sidebarOpen/cart/etc.
  // With 100s of products, that recompute+resort was the main source of lag.) ──
  const allColors = useMemo(() => (
    [...new Set(allProducts.flatMap(p => p.colors ?? []))]
  ), [allProducts]);

  const allSizes = useMemo(() => (
    [...new Set(allProducts.flatMap(p => p.sizes ?? []))]
  ), [allProducts]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const minP = priceMin ? +priceMin : 0;
    const maxP = priceMax ? +priceMax : Infinity;

    let list = allProducts.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = !q || [p.name, p.description, p.category].some((f: string) => f?.toLowerCase().includes(q));
      const matchPrice = p.price >= minP && p.price <= maxP;
      const matchColor = !selectedColors.length || selectedColors.some(c => p.colors?.includes(c));
      const matchSize = !selectedSizes.length || selectedSizes.some(s => p.sizes?.includes(s));
      return matchCat && matchSearch && matchPrice && matchColor && matchSize;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

    return list;
  }, [allProducts, activeCategory, searchQuery, priceMin, priceMax, selectedColors, selectedSizes, sortBy]);

  const checkoutItems = checkoutProduct ? [checkoutProduct] : cart;
  const orderTotal = checkoutItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const currentCartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const featured = useMemo(() => allProducts.slice(0, 8), [allProducts]);
  const newArrivals = useMemo(() => [...allProducts].reverse().slice(0, 8), [allProducts]);
  const trendingNow = useMemo(() => (
    allProducts.length > 4
      ? [...allProducts].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 10)
      : allProducts
  ), [allProducts]);

  // ✅ FIX: Date check hata diya — sirf enabled flag check karo
  const showFlashSale = siteSettings.flash_sale_enabled;
  const showFestival  = siteSettings.festival_enabled;

  const festivalProducts = useMemo(() => (
    showFestival
      ? allProducts.filter(p => p.festival_tag && p.festival_tag === siteSettings.festival_category).slice(0, 8)
      : []
  ), [showFestival, allProducts, siteSettings.festival_category]);

  const activeFiltersCount = (priceMin || priceMax ? 1 : 0) + (selectedColors.length ? 1 : 0) + (selectedSizes.length ? 1 : 0);

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

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlCategory = searchParams.get('category');
    const urlOpenProduct = searchParams.get('openProduct');

    if (urlOpenProduct) {
      if (allProducts.length === 0) return;
      const product = allProducts.find(
        (p: any) => p._id === urlOpenProduct || p.id === urlOpenProduct || p.slug === urlOpenProduct
      );
      if (product) {
        openProductPage(product);
      }
      router.replace('/', { scroll: false });
      return;
    }

    if (urlSearch || urlCategory) {
      navigateTo(urlCategory || 'all', urlSearch || '');
      router.replace('/', { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allProducts]);

  const addToCart = (product: any, color?: string, size?: string, qty = 1) => {
    const finalColor = color ?? selectedColor ?? product.colors?.[0] ?? '';
    const finalSize = size ?? selectedSize ?? product.sizes?.[0] ?? 'Standard';
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
    const finalSize = size ?? product.sizes?.[0] ?? 'Standard';
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
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const addr = data.address;
          setCustomerInfo(prev => ({
            ...prev,
            city: addr.city || addr.town || addr.village || addr.state_district || '',
            area: addr.neighbourhood || addr.suburb || addr.road || '',
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

  // ✅ FIX: _id ?? id — Supabase id ko AI ke liye _id mein convert karo (memoized)
  const chatProducts = useMemo(() => (
    allProducts.map(p => ({
      _id: p._id ?? p.id,
      name: p.name, price: p.price, images: p.images ?? [],
      category: p.category, description: p.description ?? '',
      colors: p.colors ?? [], sizes: p.sizes ?? [],
    }))
  ), [allProducts]);

  // ─ FULL PRODUCT PAGE ─
  if (viewProductPage) {
    return (
      <ProductDetailPage
        product={viewProductPage}
        allProducts={allProducts}
        market={market}
        marketCfg={marketCfg}
        isPK={isPK}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        selectedImageIndex={selectedImageIndex}
        quantity={quantity}
        wishlist={wishlist}
        addedToCart={addedToCart}
        cart={cart}
        chatProducts={chatProducts}
        onSelectColor={setSelectedColor}
        onSelectSize={setSelectedSize}
        onSelectImageIndex={setSelectedImageIndex}
        onQuantityChange={setQuantity}
        onGoHome={() => { setViewProductPage(null); setView('home'); }}
        onNavigateCategory={cat => navigateTo(cat)}
        onAddToCart={addToCart}
        onBuyNow={handleBuyNow}
        onOpenProduct={openProduct}
        onToggleWish={toggleWish}
        onOpenPage={openProductPage}
        onQuickView={openProduct}
      />
    );
  }

  // ─ MAIN RENDER ─
  return (
    <main className="bg-gray-50 text-gray-900 min-h-screen">

      <div className="bg-gradient-to-r from-violet-700 to-purple-800 text-white text-center text-xs py-2 font-medium tracking-wide">
        {isPK
          ? (siteSettings.pk_banner_title || DEFAULT_SETTINGS.pk_banner_title)
          : (siteSettings.us_banner_title || DEFAULT_SETTINGS.us_banner_title)
        }
      </div>

      {view === 'home' && (
        <>
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

          <HeroSlider slides={slides} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} onNavigate={navigateTo} />

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

          {showFlashSale && (
            <FlashSaleBanner
              discount={siteSettings.flash_sale_discount}
              endsAt={siteSettings.flash_sale_ends_at}
              category={siteSettings.flash_sale_category}
              onNavigate={navigateTo}
            />
          )}

          {showFestival && (
            <FestivalBanner
              theme={isPK ? siteSettings.festival_theme_pk : siteSettings.festival_theme_us}
              label={isPK ? siteSettings.pk_festival_label : siteSettings.us_festival_label}
              discount={siteSettings.festival_discount}
              endsAt={siteSettings.festival_ends_at}
              category={siteSettings.festival_category}
              onNavigate={navigateTo}
            />
          )}

          {!productsLoading && festivalProducts.length > 0 && (
            <section className="py-10 bg-gradient-to-b from-rose-50/40 to-white border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">Limited time</p>
                    <h2 className="text-2xl font-black text-gray-800">
                      {(isPK ? siteSettings.pk_festival_label : siteSettings.us_festival_label) || 'Festival Picks'}
                    </h2>
                  </div>
                  <button onClick={() => navigateTo(siteSettings.festival_category)} className="text-sm text-rose-600 font-semibold hover:underline">View All →</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {festivalProducts.map((p: any, idx: number) => (
                    <ProductCard key={p._id ?? idx} product={p} market={market} wishlist={wishlist} addedToCart={addedToCart}
                      onOpenPage={openProductPage} onQuickView={openProduct} onAddToCart={addToCart} onBuyNow={handleBuyNow} onToggleWish={toggleWish} />
                  ))}
                </div>
              </div>
            </section>
          )}

          <CategoriesSection categories={categoriesForGrid} onNavigate={navigateTo} />

          {!productsLoading && featured.length > 0 && (
            <section className="py-10 bg-white border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <div><p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Hand-picked</p><h2 className="text-2xl font-black text-gray-800">Featured Products</h2></div>
                  <button onClick={() => navigateTo()} className="text-sm text-violet-600 font-semibold hover:underline">View All →</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {featured.map((p: any, idx: number) => (
                    <ProductCard key={p._id ?? idx} product={p} market={market} wishlist={wishlist} addedToCart={addedToCart}
                      onOpenPage={openProductPage} onQuickView={openProduct} onAddToCart={addToCart} onBuyNow={handleBuyNow} onToggleWish={toggleWish} />
                  ))}
                </div>
              </div>
            </section>
          )}
          {productsLoading && <div className="max-w-7xl mx-auto px-4 py-10"><Skeleton /></div>}

          <RecentlyViewedSection
            items={recentlyViewed} market={market}
            onOpen={openProductPage}
            onAddToCart={p => addToCart(p, p.colors?.[0], p.sizes?.[0])}
            onBuyNow={p => handleBuyNow(p, p.colors?.[0], p.sizes?.[0])}
            wishlist={wishlist} onToggleWish={toggleWish} addedToCart={addedToCart}
          />

          {!productsLoading && (
            <TrendingNowSection
              items={trendingNow} market={market}
              onOpen={openProductPage}
              onAddToCart={p => addToCart(p, p.colors?.[0], p.sizes?.[0])}
              onBuyNow={p => handleBuyNow(p, p.colors?.[0], p.sizes?.[0])}
              wishlist={wishlist} onToggleWish={toggleWish} addedToCart={addedToCart}
            />
          )}

          <section className={`py-8 ${isPK ? 'bg-emerald-50 border-y border-emerald-100' : 'bg-blue-50 border-y border-blue-100'}`}>
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              {isPK ? (
                <><div><p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Pakistan's Favorite Store</p><h3 className="text-xl font-black text-gray-900 mt-0.5">Cash on Delivery Available Nationwide</h3><p className="text-sm text-gray-600 mt-1">Lahore · Karachi · Islamabad · Peshawar · Quetta · Multan and beyond</p></div><div className="text-3xl">🇵🇰</div></>
              ) : (
                <><div><p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Shipping to {marketCfg.label}</p><h3 className="text-xl font-black text-gray-900 mt-0.5">Free Shipping on Orders Over {marketCfg.symbol}{marketCfg.freeDeliveryMin}</h3><p className="text-sm text-gray-600 mt-1">Fast, reliable international delivery</p></div><div className="text-3xl">{marketCfg.flag}</div></>
              )}
            </div>
          </section>

          <section className="py-8 max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-5">
              <div onClick={() => navigateTo('women')} className="relative cursor-pointer rounded-3xl overflow-hidden group" style={{ height: '200px' }}>
                <img src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Women's Collection" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-purple-900/20" />
                <div className="absolute inset-0 flex items-center px-8"><div><p className="text-purple-200 text-xs font-bold uppercase tracking-widest">New Arrivals</p><h3 className="text-white text-3xl font-black">Women's Collection</h3><button className="mt-3 bg-white text-purple-700 px-5 py-2 rounded-xl text-sm font-bold hover:bg-purple-50 transition-colors">Shop Now</button></div></div>
              </div>
              <div onClick={() => navigateTo('men')} className="relative cursor-pointer rounded-3xl overflow-hidden group" style={{ height: '200px' }}>
                <img src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Men's Styles" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-gray-900/20" />
                <div className="absolute inset-0 flex items-center px-8"><div><p className="text-gray-300 text-xs font-bold uppercase tracking-widest">Trending</p><h3 className="text-white text-3xl font-black">Men's Styles</h3><button className="mt-3 bg-white text-gray-900 px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors">Shop Now</button></div></div>
              </div>
            </div>
          </section>

          {!productsLoading && newArrivals.length > 0 && (
            <section className="py-10 max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <div><p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Just added</p><h2 className="text-2xl font-black text-gray-800">New Arrivals</h2></div>
                <button onClick={() => navigateTo()} className="text-sm text-violet-600 font-semibold hover:underline">View All →</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {newArrivals.map((p: any, idx: number) => (
                  <ProductCard key={p._id ?? idx} product={p} market={market} wishlist={wishlist} addedToCart={addedToCart}
                    onOpenPage={openProductPage} onQuickView={openProduct} onAddToCart={addToCart} onBuyNow={handleBuyNow} onToggleWish={toggleWish} />
                ))}
              </div>
            </section>
          )}

          <WhyChooseUsSection isPK={isPK} />
          <TestimonialsSection />
          <StatsSection siteSettings={siteSettings} isPK={isPK} />

          <section className="py-20 bg-white relative overflow-hidden border-t border-gray-100">
            <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
              <p className="text-violet-600 text-xs font-bold uppercase tracking-widest mb-2">MaestraVibe</p>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3">Explore All Products</h2>
              <p className="text-gray-500 mb-8">Thousands of products — fashion to accessories — all in one place</p>
              <button onClick={() => navigateTo()} className="bg-violet-600 text-white px-12 py-4 rounded-xl font-black text-base hover:bg-violet-700 transition-all active:scale-95 shadow-xl shadow-violet-200">Start Shopping →</button>
            </div>
          </section>

          <NewsletterSection />
          <SiteFooter marketCfg={marketCfg} categoriesForGrid={categoriesForGrid} onNavigate={navigateTo} />
        </>
      )}

      {view === 'shop' && (
        <ShopView
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          searchInput={searchInput}
          sortBy={sortBy}
          priceMin={priceMin}
          priceMax={priceMax}
          selectedColors={selectedColors}
          selectedSizes={selectedSizes}
          showFilters={showFilters}
          allColors={allColors}
          allSizes={allSizes}
          categoriesForFilter={categoriesForFilter}
          filtered={filtered}
          productsLoading={productsLoading}
          market={market}
          marketCfg={marketCfg}
          wishlist={wishlist}
          addedToCart={addedToCart}
          activeFiltersCount={activeFiltersCount}
          onGoHome={() => { setView('home'); setActiveCategory('all'); setSearchQuery(''); setSearchInput(''); }}
          onSearchInputChange={setSearchInput}
          onSearchSubmit={e => { e.preventDefault(); setSearchQuery(searchInput.trim()); }}
          onSetActiveCategory={setActiveCategory}
          onClearSearch={() => { setSearchInput(''); setSearchQuery(''); }}
          onSetSortBy={setSortBy}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onSetPriceMin={setPriceMin}
          onSetPriceMax={setPriceMax}
          onToggleColor={c => setSelectedColors(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])}
          onToggleSize={s => setSelectedSizes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])}
          onClearFilters={clearFilters}
          onResetAll={() => { setSearchInput(''); setSearchQuery(''); clearFilters(); setActiveCategory('all'); }}
          onOpenPage={openProductPage}
          onQuickView={openProduct}
          onAddToCart={addToCart}
          onBuyNow={handleBuyNow}
          onToggleWish={toggleWish}
        />
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          market={market}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          selectedImageIndex={selectedImageIndex}
          onSelectColor={setSelectedColor}
          onSelectSize={setSelectedSize}
          onSelectImageIndex={setSelectedImageIndex}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          onBuyNow={handleBuyNow}
          onViewFullDetails={p => { openProductPage(p); setSelectedProduct(null); }}
        />
      )}

      {showCart && (
        <CartDrawer
          cart={cart}
          market={market}
          cartCount={currentCartCount}
          cartTotal={cartTotal}
          onClose={() => { setShowCart(false); onCartClose?.(); }}
          onUpdateQuantity={(index, updater) => setCart(p => p.map((x, i) => i === index ? updater(x) : x))}
          onRemove={index => setCart(p => p.filter((_, i) => i !== index))}
          onStartShopping={() => { setShowCart(false); navigateTo(); }}
          onCheckout={() => { setCheckoutProduct(null); setCheckoutStep(1); setShowCart(false); setShowCheckout(true); }}
        />
      )}

      {showCheckout && (
        <CheckoutFlow
          checkoutStep={checkoutStep}
          checkoutItems={checkoutItems}
          orderTotal={orderTotal}
          market={market}
          marketCfg={marketCfg}
          isPK={isPK}
          customerInfo={customerInfo}
          locationLoading={locationLoading}
          orderLoading={orderLoading}
          onBack={() => checkoutStep === 2 ? setCheckoutStep(1) : (setShowCheckout(false), setCheckoutProduct(null))}
          onClose={() => { setShowCheckout(false); setCheckoutProduct(null); }}
          onContinueToDelivery={() => setCheckoutStep(2)}
          onDetectLocation={detectLocation}
          onCustomerInfoChange={setCustomerInfo}
          onSubmit={submitOrder}
        />
      )}

      {showSuccess && <OrderSuccessModal isPK={isPK} onClose={() => setShowSuccess(false)} />}

      <AIChat
        products={chatProducts}
        onOpenProduct={openProductPage}
        onAddToCart={addToCart}
        pageContext={`${view === 'shop' ? 'Shop' : 'Home'} • ${activeCategory !== 'all' ? activeCategory : 'All categories'} • ${searchQuery || 'No search'} • Browsing`}
        cartItems={cart.map(item => ({ name: item.name, price: item.price, qty: item.quantity }))}
      />

      <MobileNav
        cartCount={currentCartCount}
        onHome={() => { setView('home'); setViewProductPage(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onShop={() => { setView('shop'); setActiveCategory('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onCart={() => setShowCart(true)}
      />
    </main>
  );
}