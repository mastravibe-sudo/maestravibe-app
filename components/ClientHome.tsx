// components/ClientHome.tsx
'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation'; // NEW
import { useMarket } from '@/lib/market-context';
import { CreditCard, MapPin, RotateCcw } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const AIChat = dynamic(() => import('@/components/AIChat'), { ssr: false });

import {
  DEFAULT_SETTINGS, FALLBACK_CATEGORIES, FALLBACK_SLIDES,
  MARKET_CONFIG,
} from '@/lib/home/constants';
import {
  effectivePrice, loadCart, loadRecentlyViewed, loadWish,
  playSound, saveCart, saveRecentlyViewed, saveWish,
} from '@/lib/home/helpers';
import { calculateDeliveryCharge } from '@/lib/home/delivery'; // NEW
import type { CmsBanner, CmsCategory, CustomerInfo, DetectedLocation, SiteSettings, Slide } from '@/lib/home/types';

import CartDrawer from '@/components/home/CartDrawer';
import CategoriesSection from '@/components/home/CategoriesSection';
import CheckoutFlow from '@/components/home/CheckoutFlow';
import FestivalBanner from '@/components/home/FestivalBanner';
import FlashSaleBanner from '@/components/home/FlashSaleBanner';
import HeroSlider from '@/components/home/HeroSlider';
import HeroBackground from '@/components/home/HeroBackground';
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

// Supabase rows use `id`; the storefront uses `_id`. If `_id` is missing every product looks identical
// (all hearts light up, cart rows merge, checkout loses productId), so normalise once, here.
const normalizeProducts = (list: any[]): any[] =>
  (Array.isArray(list) ? list : []).map((p) => ({ ...p, _id: String(p._id ?? p.id ?? '') }));

// ── HomePageProps ─────────────────────────────────────────────────────────────
interface HomePageProps {
  initialProducts?: any[];
  cartCount?: number;
  onCartCountChange?: React.Dispatch<React.SetStateAction<number>>;
  showCart?: boolean;
  onCartClose?: () => void;
}

export default function HomePage({
  initialProducts,
  cartCount,
  onCartCountChange,
  showCart: showCartProp = false,
  onCartClose,
}: HomePageProps) {
  void cartCount;

  const { market } = useMarket();
  const marketCfg = MARKET_CONFIG[market] ?? MARKET_CONFIG['pk'];
  const isPK = market === 'pk';

  const searchParams = useSearchParams(); // NEW
  const router = useRouter(); // NEW

  const [view, setView] = useState('home');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>(normalizeProducts(initialProducts ?? []));
  const [productsLoading, setProductsLoading] = useState(initialProducts === undefined);

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
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '', email: '', phone: '', address: '', city: '', area: '',
    district: '', block: '', locationLink: undefined, lat: undefined, lng: undefined,
  });
  // NEW: a just-detected GPS location, held here until the customer
  // explicitly confirms it before it's written into customerInfo.
  const [pendingLocation, setPendingLocation] = useState<DetectedLocation | null>(null);
  const suppressQuickViewRef = useRef(false);

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
      setAllProducts(normalizeProducts(await res.json()));
    } catch { console.error('Products load failed'); }
    finally { setProductsLoading(false); }
  }, []);
  useEffect(() => {
    if (initialProducts === undefined) loadProducts();
  }, [initialProducts, loadProducts]);

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

  // NEW: delivery charge, computed live from the customer's city + order
  // subtotal, and the grand total that actually gets charged/shown/submitted.
  const deliveryCharge = useMemo(() => {
    const freeMin = parseFloat(String(marketCfg.freeDeliveryMin).replace(/,/g, '')) || 0;
    return calculateDeliveryCharge(market, customerInfo.city, orderTotal, freeMin);
  }, [market, customerInfo.city, orderTotal, marketCfg.freeDeliveryMin]);
  const grandTotal = orderTotal + deliveryCharge;

  const featured = useMemo(() => allProducts.slice(0, 8), [allProducts]);
  const newArrivals = useMemo(() => [...allProducts].reverse().slice(0, 8), [allProducts]);
  const trendingNow = useMemo(() => (
    allProducts.length > 4
      ? [...allProducts].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 10)
      : allProducts
  ), [allProducts]);

  // FIX: Date check hata diya — sirf enabled flag check karo
  const showFlashSale = siteSettings.flash_sale_enabled;
  const showFestival  = siteSettings.festival_enabled;

  // ── Market-specific Flash Sale fields (fall back to legacy shared fields
  // so nothing breaks if /api/settings hasn't been updated yet) ──
  const flashSaleDiscount = isPK
    ? (siteSettings.flash_sale_discount_pk ?? siteSettings.flash_sale_discount)
    : (siteSettings.flash_sale_discount_us ?? siteSettings.flash_sale_discount);
  const flashSaleEndsAt = isPK
    ? (siteSettings.flash_sale_ends_at_pk ?? siteSettings.flash_sale_ends_at)
    : (siteSettings.flash_sale_ends_at_us ?? siteSettings.flash_sale_ends_at);
  const flashSaleCategory = isPK
    ? (siteSettings.flash_sale_category_pk ?? siteSettings.flash_sale_category)
    : (siteSettings.flash_sale_category_us ?? siteSettings.flash_sale_category);
  const flashSaleTheme = isPK
    ? siteSettings.flash_sale_theme_pk
    : siteSettings.flash_sale_theme_us;
  const flashSaleLabel = isPK
    ? siteSettings.flash_sale_label_pk
    : siteSettings.flash_sale_label_us;
  const flashSaleImage = isPK
    ? siteSettings.flash_sale_image_pk
    : siteSettings.flash_sale_image_us;

  // ── Market-specific Festival fields ──
  const festivalDiscount = isPK
    ? (siteSettings.festival_discount_pk ?? siteSettings.festival_discount)
    : (siteSettings.festival_discount_us ?? siteSettings.festival_discount);
  const festivalEndsAt = isPK
    ? (siteSettings.festival_ends_at_pk ?? siteSettings.festival_ends_at)
    : (siteSettings.festival_ends_at_us ?? siteSettings.festival_ends_at);
  const festivalCategory = isPK
    ? (siteSettings.festival_category_pk ?? siteSettings.festival_category)
    : (siteSettings.festival_category_us ?? siteSettings.festival_category);
  const festivalImage = isPK
    ? siteSettings.festival_image_pk
    : siteSettings.festival_image_us;

  const festivalProducts = useMemo(() => (
    showFestival
      ? allProducts.filter(p => p.festival_tag && p.festival_tag === festivalCategory).slice(0, 8)
      : []
  ), [showFestival, allProducts, festivalCategory]);

  const activeFiltersCount = (priceMin || priceMax ? 1 : 0) + (selectedColors.length ? 1 : 0) + (selectedSizes.length ? 1 : 0);

  // ── Actions ──
  const navigateTo = (cat = 'all', q = '') => {
    setActiveCategory(cat); setSearchQuery(q); setSearchInput(q);
    setView('shop'); setViewProductPage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProduct = (product: any, updateUrl = true) => {
    suppressQuickViewRef.current = false;
    setSelectedProduct(product);
    setSelectedColor(product.colors?.[0] ?? '');
    setSelectedSize(product.sizes?.[0] ?? 'Standard');
    setSelectedImageIndex(0);
    if (updateUrl) {
      const productId = product._id ?? product.id;
      if (productId) router.push(`/?quickView=${encodeURIComponent(productId)}`, { scroll: false });
    }
  };

  const closeQuickView = () => {
    if (searchParams.get('quickView')) {
      suppressQuickViewRef.current = true;
      router.replace('/', { scroll: false });
    }
    setSelectedProduct(null);
  };

  const openProductPage = (product: any, updateUrl = true) => {
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
    if (updateUrl) {
      const productId = product._id ?? product.id;
      if (productId) router.push(`/?product=${encodeURIComponent(productId)}`, { scroll: false });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setShowCheckout(searchParams.get('checkout') === '1');
  }, [searchParams]);

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlCategory = searchParams.get('category');
    const urlOpenProduct = searchParams.get('openProduct');
    const urlProduct = searchParams.get('product');
    const urlQuickView = searchParams.get('quickView');
    if (!urlQuickView) suppressQuickViewRef.current = false;

    if (urlOpenProduct || urlProduct || urlQuickView) {
      if (allProducts.length === 0) return;
      const requestedProductId = urlOpenProduct || urlProduct || urlQuickView;
      const product = allProducts.find(
        (p: any) => p._id === requestedProductId || p.id === requestedProductId || p.slug === requestedProductId
      );
      if (!product) return;
      if (urlQuickView) {
        if (suppressQuickViewRef.current) return;
        openProduct(product, false);
      } else {
        openProductPage(product, false);
      }
      if (urlOpenProduct) {
        const productId = product._id ?? product.id;
        router.replace(`/?product=${encodeURIComponent(productId)}`, { scroll: false });
      }
      return;
    }

    if (viewProductPage) {
      setViewProductPage(null);
      setView('home');
    }
    if (selectedProduct) setSelectedProduct(null);

    if (urlSearch || urlCategory) {
      navigateTo(urlCategory || 'all', urlSearch || '');
      router.replace('/', { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allProducts, router, selectedProduct, viewProductPage]);

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
    closeQuickView();
  };

  const handleBuyNow = (product: any, color?: string, size?: string, qty = 1) => {
    const finalColor = color ?? product.colors?.[0] ?? '';
    const finalSize = size ?? product.sizes?.[0] ?? 'Standard';
    const finalPrice = effectivePrice(product, finalSize, finalColor);
    const item = { ...product, price: finalPrice, selectedColor: finalColor, selectedSize: finalSize, quantity: qty };
    setCheckoutProduct(item);
    setSelectedProduct(null);
    suppressQuickViewRef.current = true;
    setCheckoutStep(1);
    setShowCheckout(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('quickView');
    params.set('checkout', '1');
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const closeCheckout = () => {
    setShowCheckout(false);
    setCheckoutProduct(null);
    setPendingLocation(null);
    const params = new URLSearchParams(searchParams.toString());
    if (params.has('checkout')) {
      params.delete('checkout');
      const query = params.toString();
      router.replace(query ? `/?${query}` : '/', { scroll: false });
    }
  };

  const startCartCheckout = () => {
    setCheckoutProduct(null);
    setCheckoutStep(1);
    setShowCart(false);
    setShowCheckout(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('quickView');
    params.set('checkout', '1');
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const toggleWish = (id: string) => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // FIXED (round 2): a single zoom=18 call to Nominatim isn't reliable for
  // Pakistani addresses — the "city" tag is often missing at building-level,
  // so the code fell back to whatever was in `county` (frequently a tehsil
  // name like "Model Town Tehsil", not the actual city), and in some replies
  // a numeric postcode ends up in a field it shouldn't. Free OSM data for PK
  // just isn't consistently tagged — no fallback chain alone fixes that.
  //
  // Fix (still 100% free, no API key): query Nominatim TWICE at different
  // zoom levels for the same coordinate —
  //   • zoom=10 ("city" resolution per Nominatim's docs) → asks specifically
  //     for the enclosing city/district boundary, which is far more reliably
  //     tagged than relying on a building-level point's inherited tags.
  //   • zoom=18 (building resolution) → gives the accurate street/area/
  //     house-number breakdown.
  // Plus a defensive filter so a stray postcode (e.g. "54000") can never
  // land in City/Area/District/Block.
  //
  // Nothing is written into customerInfo yet — the result sits in
  // `pendingLocation` until the customer confirms it (see
  // confirmDetectedLocation / dismissDetectedLocation below), and we build a
  // live Google Maps link from the exact GPS coordinates for the rider.
  const looksLikePostcode = (v: string) => /^\d{4,6}$/.test(v.trim());
  const clean = (v: string) => (v && !looksLikePostcode(v) ? v : '');

  const detectLocation = () => {
    if (!navigator.geolocation) { alert('Location not supported.'); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords;

          const [detailRes, cityRes] = await Promise.all([
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`),
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=10`),
          ]);
          const detailData = await detailRes.json();
          const cityData = await cityRes.json();
          const detailAddr = detailData.address || {};
          const cityAddr = cityData.address || {};

          const city = clean(
            cityAddr.city || cityAddr.town || cityAddr.municipality || cityAddr.county ||
            detailAddr.city || detailAddr.town || detailAddr.county || ''
          );
          const district = clean(
            cityAddr.state_district || cityAddr.county || detailAddr.state_district || city
          );
          const area = clean(
            detailAddr.suburb || detailAddr.neighbourhood || detailAddr.quarter || detailAddr.village || ''
          );
          const address = [detailAddr.house_number, detailAddr.road, area].filter(Boolean).join(', ') || detailData.display_name || '';
          const locationLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

          setPendingLocation({ city, area, district, address, locationLink, lat: latitude, lng: longitude });
        } catch {
          alert('Location detection failed. Please fill manually.');
        } finally {
          setLocationLoading(false);
        }
      },
      () => { setLocationLoading(false); alert('Location permission denied.'); },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  // NEW: customer explicitly agreed "yes, deliver here" — now it's safe
  // to write the detected fields (incl. the live map link) into the form.
  const confirmDetectedLocation = () => {
    if (!pendingLocation) return;
    setCustomerInfo(prev => ({
      ...prev,
      city: pendingLocation.city,
      area: pendingLocation.area,
      district: pendingLocation.district,
      address: pendingLocation.address || prev.address,
      locationLink: pendingLocation.locationLink,
      lat: pendingLocation.lat,
      lng: pendingLocation.lng,
    }));
    setPendingLocation(null);
  };

  // NEW: customer wants to fill it manually instead — discard the detection.
  const dismissDetectedLocation = () => setPendingLocation(null);

  // PAYMENTS: Pakistan = Cash on Delivery (unchanged). USA = online card payment
  // (customer is redirected to the hosted payment page; cart is cleared on /payment/success).
  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    let redirecting = false;
    try {
      const paymentMethod = isPK ? 'cod' : 'online';

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerInfo, market, paymentMethod,
          items: checkoutItems.map(item => ({
            productId: item._id, name: item.name, price: item.price,
            quantity: item.quantity || 1, selectedColor: item.selectedColor,
            selectedSize: item.selectedSize, image: item.images?.[0] ?? '',
          })),
          // NEW: subtotal / deliveryCharge broken out, `total` is now the
          // grand total (subtotal + delivery) actually charged to the customer.
          subtotal: orderTotal,
          deliveryCharge,
          total: grandTotal,
          status: 'new',
        }),
      });
      const responseData = await res.json();
      if (!res.ok) {
        const fields = responseData.fieldErrors ? Object.entries(responseData.fieldErrors).map(([field, message]) => `${field}: ${message}`).join(' ') : '';
        throw new Error(fields || responseData.message || 'Order failed');
      }

      if (responseData.paymentUrl) {
        redirecting = true;
        window.location.href = responseData.paymentUrl;
        return;
      }

      playSound();
      closeCheckout(); setCart([]);
      setCustomerInfo({
        name: '', email: '', phone: '', address: '', city: '', area: '',
        district: '', block: '', locationLink: undefined, lat: undefined, lng: undefined,
      });
      setPendingLocation(null);
      setShowSuccess(true);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Order failed'}`);
    } finally {
      if (!redirecting) setOrderLoading(false);
    }
  };

  const clearFilters = () => { setPriceMin(''); setPriceMax(''); setSelectedColors([]); setSelectedSizes([]); setSortBy('default'); };

  // FIX: _id ?? id — Supabase id ko AI ke liye _id mein convert karo (memoized)
  const chatProducts = useMemo(() => (
    allProducts.map(p => ({
      _id: p._id ?? p.id,
      name: p.name, price: p.price, images: p.images ?? [],
      category: p.category, description: p.description ?? '',
      colors: p.colors ?? [], sizes: p.sizes ?? [],
    }))
  ), [allProducts]);

  const checkoutOverlay = showCheckout && (
    <CheckoutFlow
      checkoutStep={checkoutStep}
      checkoutItems={checkoutItems}
      orderTotal={orderTotal}
      deliveryCharge={deliveryCharge}
      grandTotal={grandTotal}
      market={market}
      marketCfg={marketCfg}
      isPK={isPK}
      customerInfo={customerInfo}
      pendingLocation={pendingLocation}
      locationLoading={locationLoading}
      orderLoading={orderLoading}
      onBack={() => {
        if (checkoutStep === 3) { setCheckoutStep(2); return; }
        if (checkoutStep === 2) { setCheckoutStep(1); return; }
        closeCheckout();
      }}
      onClose={closeCheckout}
      onContinueToDelivery={() => setCheckoutStep(2)}
      onContinueToConfirm={() => setCheckoutStep(3)}
      onDetectLocation={detectLocation}
      onConfirmLocation={confirmDetectedLocation}
      onDismissLocation={dismissDetectedLocation}
      onCustomerInfoChange={setCustomerInfo}
      onSubmit={submitOrder}
    />
  );

  // ─ FULL PRODUCT PAGE ─
  if (viewProductPage) {
    return (
      <>
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
        {checkoutOverlay}
      </>
    );
  }

  // ─ MAIN RENDER ─
  return (
    <main className="bg-gray-50 text-gray-900 min-h-screen">

      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white text-center text-xs py-2 font-medium tracking-wide">
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
                <MapPin className="inline w-3.5 h-3.5 -mt-0.5 mr-1" aria-hidden="true" />Shopping in {marketCfg.label} · {marketCfg.symbol} ({marketCfg.currency})
                {isPK && ' · Cash on Delivery Available'}
              </span>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs text-violet-500 font-semibold">Switch market from the header menu</span>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Hero — wrapped with the animated 3D background, slider content sits above it */}
          <div className="relative">
            <HeroBackground />
            <div className="relative z-10">
              <HeroSlider slides={slides} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} onNavigate={navigateTo} />
            </div>
          </div>

          {/* TRUST STRIP */}
          <section className="bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { icon: <TruckIco />, t: isPK ? 'Free Delivery' : 'Free Shipping', s: `Above ${marketCfg.symbol}${marketCfg.freeDeliveryMin}` },
                  { icon: <CreditCard className="w-5 h-5" aria-hidden="true" />, t: isPK ? 'Cash on Delivery' : 'Secure Checkout', s: isPK ? 'No advance needed' : 'Card / PayPal' },
                  { icon: <RotateCcw className="w-5 h-5" aria-hidden="true" />, t: '7-Day Returns', s: 'Hassle-free policy' },
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
              discount={flashSaleDiscount}
              endsAt={flashSaleEndsAt}
              category={flashSaleCategory}
              theme={flashSaleTheme}
              label={flashSaleLabel}
              image={flashSaleImage}
              onNavigate={navigateTo}
            />
          )}

          {showFestival && (
            <FestivalBanner
              theme={isPK ? siteSettings.festival_theme_pk : siteSettings.festival_theme_us}
              label={isPK ? siteSettings.pk_festival_label : siteSettings.us_festival_label}
              discount={festivalDiscount}
              endsAt={festivalEndsAt}
              category={festivalCategory}
              image={festivalImage}
              onNavigate={navigateTo}
            />
          )}

          {!productsLoading && festivalProducts.length > 0 && (
            <section className="py-10 bg-gradient-to-b from-violet-50/40 to-white border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Limited time</p>
                    <h2 className="text-2xl font-black text-gray-800">
                      {(isPK ? siteSettings.pk_festival_label : siteSettings.us_festival_label) || 'Festival Picks'}
                    </h2>
                  </div>
                  <button onClick={() => navigateTo(festivalCategory)} className="text-sm text-indigo-600 font-semibold hover:underline">View All →</button>
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
                <><div><p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Pakistan's Favorite Store</p><h3 className="text-xl font-black text-gray-900 mt-0.5">Cash on Delivery Available Nationwide</h3><p className="text-sm text-gray-600 mt-1">Lahore · Karachi · Islamabad · Peshawar · Quetta · Multan and beyond</p></div><MapPin className="w-9 h-9 text-emerald-600 shrink-0" aria-hidden="true" /></>
              ) : (
                <><div><p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Shipping to {marketCfg.label}</p><h3 className="text-xl font-black text-gray-900 mt-0.5">Free Shipping on Orders Over {marketCfg.symbol}{marketCfg.freeDeliveryMin}</h3><p className="text-sm text-gray-600 mt-1">Fast, reliable international delivery</p></div><MapPin className="w-9 h-9 text-blue-600 shrink-0" aria-hidden="true" /></>
              )}
            </div>
          </section>

          <section className="py-8 max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-5">
              <div onClick={() => navigateTo('women')} className="relative cursor-pointer rounded-3xl overflow-hidden group" style={{ height: '200px' }}>
                <Image src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&auto=format&fit=crop" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" alt="Women's clothing collection" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-900/70 to-violet-900/20" />
                <div className="absolute inset-0 flex items-center px-8"><div><p className="text-violet-200 text-xs font-bold uppercase tracking-widest">New Arrivals</p><h3 className="text-white text-3xl font-black">Women's Collection</h3><button className="mt-3 bg-white text-violet-700 px-5 py-2 rounded-xl text-sm font-bold hover:bg-violet-50 transition-colors">Shop Now</button></div></div>
              </div>
              <div onClick={() => navigateTo('men')} className="relative cursor-pointer rounded-3xl overflow-hidden group" style={{ height: '200px' }}>
                <Image src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&auto=format&fit=crop" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" alt="Men's clothing collection" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/70 to-indigo-900/20" />
                <div className="absolute inset-0 flex items-center px-8"><div><p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Trending</p><h3 className="text-white text-3xl font-black">Men's Styles</h3><button className="mt-3 bg-white text-indigo-700 px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors">Shop Now</button></div></div>
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
              <p className="text-violet-600 text-xs font-bold uppercase tracking-widest mb-2">Maestra Market</p>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3">Explore All Products</h2>
              <p className="text-gray-500 mb-8">Thousands of products — fashion to accessories — all in one place</p>
              <button onClick={() => navigateTo()} className="bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white px-12 py-4 rounded-xl font-black text-base transition-all active:scale-95 shadow-xl shadow-violet-300">Start Shopping →</button>
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
          onClose={closeQuickView}
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
          onCheckout={startCartCheckout}
        />
      )}

      {checkoutOverlay}

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