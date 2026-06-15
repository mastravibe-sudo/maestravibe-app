'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const AIChat = dynamic(() => import('@/components/AIChat'), { ssr: false });

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  colors: string[];
  sizes: string[];
  images: string[];
}
interface CartItem extends Product {
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}
interface CustomerInfo {
  name: string; email: string; phone: string;
  address: string; city: string; area: string;
}
interface HomePageProps {
  onCartCountChange?: (count: number) => void;
  showCart?: boolean;
  onCartClose?: () => void;
}

const SLIDES = [
  { image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop', title: 'New Collection', sub: 'Trendy fashion, one click away' },
  { image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop', title: 'Premium Quality', sub: 'Genuine products at fair prices' },
  { image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop', title: 'Fast Delivery', sub: 'Cash on delivery — all over Pakistan' },
];

const CATEGORIES = [
  { label: 'All',         value: 'all'         },
  { label: 'Men',         value: 'men'         },
  { label: 'Women',       value: 'women'       },
  { label: 'Kids',        value: 'kids'        },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Sale',        value: 'sale'        },
];

const SORT_OPTIONS = [
  { label: 'Default',            value: 'default'    },
  { label: 'Price: Low to High', value: 'price-asc'  },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name A–Z',           value: 'name-asc'   },
  { label: 'Name Z–A',           value: 'name-desc'  },
];

function CartIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}
function LocationIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function SpinIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function loadCart(): CartItem[] {
  try { const s = localStorage.getItem('maestravibe_cart'); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveCart(c: CartItem[]) {
  try { localStorage.setItem('maestravibe_cart', JSON.stringify(c)); } catch {}
}
function playSuccessSound() {
  try { const a = new Audio('/sound/mixkit-happy-bells-notification-937.wav'); a.volume = 0.85; a.play().catch(() => {}); } catch {}
}

export default function HomePage({ onCartCountChange, showCart: showCartProp = false, onCartClose }: HomePageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [allProducts,  setAllProducts]  = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [searchInput,    setSearchInput]    = useState('');
  const [sortBy,         setSortBy]         = useState('default');
  const [priceMin,       setPriceMin]       = useState('');
  const [priceMax,       setPriceMax]       = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes,  setSelectedSizes]  = useState<string[]>([]);
  const [showSidebar,    setShowSidebar]    = useState(false);
  const [viewMode,       setViewMode]       = useState<'grid' | 'list'>('grid');

  // ✅ FIX: 'home' se shuru karo — window.location SSR mein crash karta tha
  const [view, setView] = useState<'home' | 'shop'>('home');

  const [selectedProduct,    setSelectedProduct]    = useState<Product | null>(null);
  const [selectedColor,      setSelectedColor]      = useState('');
  const [selectedSize,       setSelectedSize]       = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [cart,        setCart]        = useState<CartItem[]>([]);
  const [cartLoaded,  setCartLoaded]  = useState(false);
  const [showCart,    setShowCart]    = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const [showCheckout,    setShowCheckout]    = useState(false);
  const [checkoutStep,    setCheckoutStep]    = useState<1 | 2>(1);
  const [checkoutProduct, setCheckoutProduct] = useState<CartItem | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [orderLoading,    setOrderLoading]    = useState(false);
  const [showSuccess,     setShowSuccess]     = useState(false);
  const [customerInfo,    setCustomerInfo]    = useState<CustomerInfo>({
    name: '', email: '', phone: '', address: '', city: '', area: '',
  });

  const [showNewsletter,  setShowNewsletter]  = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone,  setNewsletterDone]  = useState(false);

  useEffect(() => { setCart(loadCart()); setCartLoaded(true); }, []);
  useEffect(() => { if (cartLoaded) saveCart(cart); }, [cart, cartLoaded]);
  useEffect(() => {
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    onCartCountChange?.(count);
  }, [cart, onCartCountChange]);
  useEffect(() => { if (showCartProp) setShowCart(true); }, [showCartProp]);

  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const q   = searchParams.get('search')   || '';
    setActiveCategory(cat);
    setSearchQuery(q);
    setSearchInput(q);
    setView((cat !== 'all' || q) ? 'shop' : 'home');
  }, [searchParams]);

  useEffect(() => {
    const id = setInterval(() => setCurrentSlide(p => (p + 1) % SLIDES.length), 4500);
    return () => clearInterval(id);
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error();
      setAllProducts(await res.json());
    } catch { console.error('Failed to load products'); }
    finally { setProductsLoading(false); }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const allColors = Array.from(new Set(allProducts.flatMap(p => p.colors ?? [])));
  const allSizes  = Array.from(new Set(allProducts.flatMap(p => p.sizes  ?? [])));

  let filteredProducts = allProducts.filter(p => {
    const matchCat    = activeCategory === 'all' || p.category === activeCategory;
    const q           = searchQuery.trim().toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.description?.toLowerCase() ?? '').includes(q) || (p.category?.toLowerCase() ?? '').includes(q);
    const minP        = priceMin ? Number(priceMin) : 0;
    const maxP        = priceMax ? Number(priceMax) : Infinity;
    const matchPrice  = p.price >= minP && p.price <= maxP;
    const matchColor  = selectedColors.length === 0 || selectedColors.some(c => p.colors?.includes(c));
    const matchSize   = selectedSizes.length  === 0 || selectedSizes.some(s  => p.sizes?.includes(s));
    return matchCat && matchSearch && matchPrice && matchColor && matchSize;
  });

  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc')  return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-asc')   return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc')  return b.name.localeCompare(a.name);
    return 0;
  });

  const checkoutItems      = checkoutProduct ? [checkoutProduct] : cart;
  const orderTotal         = checkoutItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  const cartTotal          = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartItemsCount     = cart.reduce((s, i) => s + i.quantity, 0);
  const activeFiltersCount = (priceMin || priceMax ? 1 : 0) + (selectedColors.length > 0 ? 1 : 0) + (selectedSizes.length > 0 ? 1 : 0);
  const featured           = allProducts.slice(0, 8);
  const newArrivals        = [...allProducts].reverse().slice(0, 8);

  const navigateTo = (cat = 'all', q = '') => {
    setActiveCategory(cat);
    setSearchQuery(q);
    setSearchInput(q);
    setView('shop');
    const params = new URLSearchParams();
    if (cat !== 'all') params.set('category', cat);
    if (q) params.set('search', q);
    router.push(params.toString() ? `/?${params.toString()}` : '/', { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(activeCategory, searchInput.trim());
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors?.[0] || '');
    setSelectedSize(product.sizes?.[0] || 'Standard');
    setSelectedImageIndex(0);
  };

  const addToCart = (product: Product, color?: string, size?: string) => {
    const item: CartItem = {
      ...product,
      selectedColor: color ?? selectedColor ?? product.colors?.[0] ?? '',
      selectedSize:  size  ?? selectedSize  ?? product.sizes?.[0]  ?? 'Standard',
      quantity: 1,
    };
    setCart(prev => {
      const idx = prev.findIndex(i => i._id === item._id && i.selectedColor === item.selectedColor && i.selectedSize === item.selectedSize);
      if (idx >= 0) { const u = [...prev]; u[idx] = { ...u[idx], quantity: u[idx].quantity + 1 }; return u; }
      return [...prev, item];
    });
    setAddedToCart(product._id);
    setTimeout(() => setAddedToCart(null), 1500);
    setSelectedProduct(null);
  };

  const handleBuyNow = (product: Product, color?: string, size?: string) => {
    const item: CartItem = {
      ...product,
      selectedColor: color ?? product.colors?.[0] ?? '',
      selectedSize:  size  ?? product.sizes?.[0]  ?? 'Standard',
      quantity: 1,
    };
    setCheckoutProduct(item);
    setSelectedProduct(null);
    setCheckoutStep(1);
    setShowCheckout(true);
  };

  const clearFilters = () => {
    setPriceMin(''); setPriceMax(''); setSelectedColors([]); setSelectedSizes([]); setSortBy('default');
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { alert('Location not supported by your browser.'); return; }
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
      { timeout: 10000, enableHighAccuracy: true }
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
          customer: customerInfo,
          items: checkoutItems.map(item => ({
            productId: item._id, name: item.name, price: item.price,
            quantity: item.quantity || 1, selectedColor: item.selectedColor,
            selectedSize: item.selectedSize, image: item.images?.[0] || '',
          })),
          total: orderTotal, status: 'new',
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Order failed');
      playSuccessSound();
      setShowCheckout(false);
      setCheckoutProduct(null);
      setCart([]);
      setCustomerInfo({ name: '', email: '', phone: '', address: '', city: '', area: '' });
      setShowSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Order failed';
      alert(`Error: ${msg}`);
    } finally { setOrderLoading(false); }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col">
      <div
        onClick={() => openProduct(product)}
        className="relative overflow-hidden cursor-pointer bg-gray-50"
        style={{ height: '200px' }}
      >
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={product.name}
        />
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2.5 py-1 rounded-full font-semibold capitalize shadow-sm">
            {product.category}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3
          onClick={() => openProduct(product)}
          className="font-semibold text-sm mb-1.5 line-clamp-2 cursor-pointer hover:text-violet-600 transition-colors text-gray-800"
        >
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4,5].map(s => <StarIcon key={s} />)}
          <span className="text-xs text-gray-400 ml-1">(4.8)</span>
        </div>
        {product.colors?.length > 0 && (
          <div className="flex gap-1 mb-2.5 flex-wrap">
            {product.colors.slice(0, 6).map((c, i) => (
              <span key={i} className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 shrink-0" style={{ backgroundColor: c }} title={c} />
            ))}
            {product.colors.length > 6 && <span className="text-xs text-gray-400 self-center">+{product.colors.length - 6}</span>}
          </div>
        )}
        <p className="text-violet-700 font-black text-lg mt-auto mb-3">Rs. {product.price.toLocaleString()}</p>
        <div className="flex gap-2">
          <button
            onClick={() => addToCart(product, product.colors?.[0], product.sizes?.[0])}
            className={`flex-1 py-2.5 text-xs rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              addedToCart === product._id
                ? 'bg-green-500 text-white scale-95'
                : 'bg-gray-900 text-white hover:bg-gray-700'
            }`}
          >
            {addedToCart === product._id ? <><CheckIcon /> Added</> : <><CartIcon className="w-3.5 h-3.5" /> Add to Cart</>}
          </button>
          <button
            onClick={() => handleBuyNow(product, product.colors?.[0], product.sizes?.[0])}
            className="flex-1 py-2.5 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-all duration-200"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );

  const inputCls = 'w-full p-3.5 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none text-sm transition-colors';

  return (
    <main className="bg-gray-50 text-gray-900 min-h-screen">

      <div className="bg-violet-600 text-white text-center text-xs py-2 font-medium tracking-wide">
        7-day returns &nbsp;&middot;&nbsp; Free delivery above Rs. 1,500 &nbsp;&middot;&nbsp; Cash on Delivery &nbsp;&middot;&nbsp; 03274050806
      </div>

      {/* HOME VIEW */}
      {view === 'home' && (
        <>
          <section className="relative w-full h-72 md:h-115 overflow-hidden">
            {SLIDES.map((slide, i) => (
              <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent flex items-center px-8 md:px-20">
                  <div className="max-w-lg">
                    <p className="text-violet-300 text-xs font-bold uppercase tracking-widest mb-2">MaestraVibe</p>
                    <h2 className="text-white text-4xl md:text-6xl font-black leading-tight">{slide.title}</h2>
                    <p className="text-white/75 text-sm mt-2 mb-8">{slide.sub}</p>
                    <button
                      onClick={() => navigateTo()}
                      className="bg-violet-600 hover:bg-violet-700 active:scale-95 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-600/30"
                    >
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`transition-all rounded-full ${i === currentSlide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
                />
              ))}
            </div>
          </section>

          <section className="bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: '🚚', title: 'Free Delivery',    sub: 'On orders above Rs. 1,500' },
                  { icon: '💳', title: 'Cash on Delivery', sub: 'No advance payment needed'  },
                  { icon: '🔄', title: '7-Day Returns',    sub: 'Hassle-free return policy'  },
                  { icon: '✅', title: 'Genuine Products', sub: '100% authentic guarantee'   },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-2xl">{f.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{f.title}</p>
                      <p className="text-xs text-gray-500">{f.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-800">Browse Categories</h2>
              <button onClick={() => navigateTo()} className="text-sm text-violet-600 font-semibold hover:underline flex items-center gap-1">
                View All <ChevronRight />
              </button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                <button
                  key={cat.value}
                  onClick={() => navigateTo(cat.value)}
                  className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 border border-gray-100 hover:border-violet-300 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-50 group-hover:bg-violet-100 transition-colors flex items-center justify-center">
                    <span className="text-violet-600 font-bold text-xs uppercase tracking-wide">{cat.label.slice(0, 3)}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>

          {featured.length > 0 && (
            <section className="py-10 bg-white border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Hand-picked</p>
                    <h2 className="text-2xl font-black text-gray-800">Featured Products</h2>
                  </div>
                  <button onClick={() => navigateTo()} className="text-sm text-violet-600 font-semibold hover:underline flex items-center gap-1">
                    View All <ChevronRight />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {featured.map((p, idx) => <ProductCard key={p._id ?? idx} product={p} />)}
                </div>
              </div>
            </section>
          )}

          {newArrivals.length > 0 && (
            <section className="py-10 max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Just added</p>
                  <h2 className="text-2xl font-black text-gray-800">New Arrivals</h2>
                </div>
                <button onClick={() => navigateTo()} className="text-sm text-violet-600 font-semibold hover:underline flex items-center gap-1">
                  View All <ChevronRight />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {newArrivals.map((p, idx) => <ProductCard key={p._id ?? idx} product={p} />)}
              </div>
            </section>
          )}

          <section className="py-12 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-8">
                <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Reviews</p>
                <h2 className="text-2xl font-black text-gray-800">What Customers Say</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {[
                  { name: 'Ayesha K.',  city: 'Lahore',    text: 'Delivery was super fast and the product quality exceeded my expectations. Highly recommend MaestraVibe!' },
                  { name: 'Ahmed R.',   city: 'Karachi',   text: 'Cash on delivery made it so easy. The kurta set I ordered looks exactly like the pictures. Will order again.' },
                  { name: 'Fatima S.', city: 'Islamabad', text: 'Very professional service. Packaging was neat and delivery was on time. 10/10 experience.' },
                ].map((r, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex gap-0.5 mb-3">{[1,2,3,4,5].map(s => <StarIcon key={s} />)}</div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-linear-to-r from-violet-700 to-violet-900">
            <div className="max-w-2xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Explore All Products</h2>
              <p className="text-violet-200 mb-8">Thousands of products — fashion to electronics — all in one place</p>
              <button
                onClick={() => navigateTo()}
                className="bg-white text-violet-700 px-10 py-4 rounded-xl font-black text-base hover:bg-violet-50 transition-all active:scale-95 shadow-lg"
              >
                Start Shopping
              </button>
            </div>
          </section>
        </>
      )}

      {/* SHOP VIEW */}
      {view === 'shop' && (
        <>
          <div className="max-w-7xl mx-auto px-4 pt-5 pb-2 flex items-center gap-2 text-xs text-gray-500">
            <button
              onClick={() => {
                setView('home');
                setActiveCategory('all');
                setSearchQuery('');
                setSearchInput('');
                router.push('/', { scroll: false });
              }}
              className="hover:text-violet-600 transition-colors font-medium"
            >
              Home
            </button>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-700">
              {activeCategory !== 'all' ? CATEGORIES.find(c => c.value === activeCategory)?.label : 'All Products'}
              {searchQuery && ` — "${searchQuery}"`}
            </span>
          </div>

          <div className="max-w-7xl mx-auto px-4 pb-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1 max-w-lg">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full border-2 border-gray-200 rounded-xl py-2.5 pl-4 pr-11 text-sm focus:outline-none focus:border-violet-500 transition-colors bg-white"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg w-7 h-7 flex items-center justify-center transition-colors">
                  <SearchIcon />
                </button>
              </div>
            </form>
          </div>

          <div className="max-w-7xl mx-auto px-4 pb-10">
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => navigateTo(cat.value, searchQuery)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeCategory === cat.value
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                      : 'bg-white text-gray-600 hover:bg-violet-50 hover:text-violet-600 border border-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {activeCategory !== 'all' && (
                  <span className="bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-violet-100">
                    {CATEGORIES.find(c => c.value === activeCategory)?.label}
                    <button onClick={() => navigateTo('all', searchQuery)} className="hover:text-violet-900 transition-colors"><CloseIcon /></button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-violet-100">
                    &ldquo;{searchQuery}&rdquo;
                    <button onClick={() => { setSearchInput(''); navigateTo(activeCategory, ''); }} className="hover:text-violet-900"><CloseIcon /></button>
                  </span>
                )}
                <span className="text-xs text-gray-400 font-medium">{filteredProducts.length} products</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-xs border-2 border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-violet-500 bg-white transition-colors"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={`px-2.5 py-2 transition-colors ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><GridIcon /></button>
                  <button onClick={() => setViewMode('list')} className={`px-2.5 py-2 transition-colors ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><ListIcon /></button>
                </div>
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="flex items-center gap-2 text-xs bg-white border-2 border-gray-200 hover:border-violet-400 hover:text-violet-600 px-3 py-2 rounded-xl font-semibold transition-colors relative"
                >
                  <FilterIcon /> Filters
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-6">
              {showSidebar && (
                <aside className="w-52 shrink-0">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-sm text-gray-800">Filters</h3>
                      {activeFiltersCount > 0 && (
                        <button onClick={clearFilters} className="text-xs text-violet-500 font-semibold hover:text-violet-700">Clear all</button>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price (Rs.)</p>
                      <div className="flex gap-2 mb-2">
                        <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-violet-400 transition-colors" />
                        <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-violet-400 transition-colors" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { label: 'Under 1k', min: '',     max: '1000' },
                          { label: '1k–3k',    min: '1000', max: '3000' },
                          { label: '3k–5k',    min: '3000', max: '5000' },
                          { label: '5k+',      min: '5000', max: ''     },
                        ].map(r => (
                          <button key={r.label} onClick={() => { setPriceMin(r.min); setPriceMax(r.max); }}
                            className={`text-xs px-2.5 py-1 rounded-full border-2 transition-colors font-medium ${priceMin === r.min && priceMax === r.max ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-500 hover:border-violet-300'}`}>
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {allColors.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Colors</p>
                        <div className="flex flex-wrap gap-2">
                          {allColors.slice(0, 16).map((c, i) => (
                            <button key={i} onClick={() => setSelectedColors(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])} title={c}
                              className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColors.includes(c) ? 'border-violet-500 scale-110 shadow-md' : 'border-gray-200 hover:border-violet-300'}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                    )}
                    {allSizes.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sizes</p>
                        <div className="flex flex-wrap gap-1.5">
                          {allSizes.map((s, i) => (
                            <button key={i} onClick={() => setSelectedSizes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])}
                              className={`px-2.5 py-1 text-xs rounded-lg border-2 font-semibold transition-colors ${selectedSizes.includes(s) ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-600 hover:border-violet-300'}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </aside>
              )}

              <div className="flex-1 min-w-0">
                {productsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
                        <div className="h-48 bg-gray-200" />
                        <div className="p-4 space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                          <div className="h-9 bg-gray-200 rounded-xl mt-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-24">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <SearchIcon />
                    </div>
                    <p className="text-gray-600 text-lg font-semibold">No products found</p>
                    <p className="text-gray-400 text-sm mt-1">Try changing your filters or search query</p>
                    <button
                      onClick={() => { setSearchInput(''); clearFilters(); navigateTo(); }}
                      className="mt-5 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                    >
                      View All Products
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className={`grid gap-5 ${showSidebar ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                    {filteredProducts.map((product, idx) => <ProductCard key={product._id ?? idx} product={product} />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product, idx) => (
                      <div key={product._id ?? idx} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex gap-4 p-4">
                        <div onClick={() => openProduct(product)} className="cursor-pointer shrink-0 rounded-xl overflow-hidden bg-gray-100 w-24 h-24">
                          <img src={product.images?.[0] || 'https://via.placeholder.com/400'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt={product.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-semibold capitalize">{product.category}</span>
                              <h3 onClick={() => openProduct(product)} className="font-semibold text-sm mt-1 cursor-pointer hover:text-violet-600 transition-colors line-clamp-2">{product.name}</h3>
                              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{product.description}</p>
                            </div>
                            <p className="text-violet-700 font-black text-base shrink-0">Rs. {product.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            {product.colors?.length > 0 && (
                              <div className="flex gap-1">
                                {product.colors.slice(0, 6).map((c, i) => (
                                  <span key={i} className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200" style={{ backgroundColor: c }} />
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2 ml-auto">
                              <button
                                onClick={() => addToCart(product, product.colors?.[0], product.sizes?.[0])}
                                className={`py-2 px-4 text-xs rounded-xl font-semibold transition-all ${addedToCart === product._id ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
                              >
                                {addedToCart === product._id ? 'Added' : 'Add to Cart'}
                              </button>
                              <button
                                onClick={() => handleBuyNow(product, product.colors?.[0], product.sizes?.[0])}
                                className="py-2 px-4 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-colors"
                              >
                                Buy Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 z-55 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-4xl rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[94vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-5 bg-gray-50">
                <img
                  src={selectedProduct.images?.[selectedImageIndex] || 'https://via.placeholder.com/600'}
                  className="w-full rounded-2xl shadow object-cover"
                  style={{ maxHeight: '340px' }}
                  alt={selectedProduct.name}
                />
                {selectedProduct.images?.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {selectedProduct.images.map((img, i) => (
                      <img key={i} src={img} onClick={() => setSelectedImageIndex(i)}
                        className={`cursor-pointer rounded-xl border-2 h-16 w-16 object-cover shrink-0 transition-all ${selectedImageIndex === i ? 'border-violet-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        alt={`thumb-${i}`} />
                    ))}
                  </div>
                )}
              </div>
              <div className="md:w-1/2 p-5 md:p-7">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs uppercase text-violet-500 font-bold tracking-wider">{selectedProduct.category}</span>
                    <h1 className="text-xl md:text-2xl font-black mt-0.5 text-gray-900">{selectedProduct.name}</h1>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors ml-2 shrink-0">
                    <CloseIcon />
                  </button>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <StarIcon key={s} />)}
                  <span className="text-xs text-gray-400 ml-1.5">(4.8 · 124 reviews)</span>
                </div>
                <p className="text-3xl font-black text-violet-700 mb-4">Rs. {selectedProduct.price.toLocaleString()}</p>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed whitespace-pre-line">{selectedProduct.description}</p>
                {selectedProduct.colors?.length > 0 && (
                  <div className="mb-5">
                    <p className="font-bold text-sm mb-2 text-gray-800">Color: <span className="text-gray-500 font-normal">{selectedColor}</span></p>
                    <div className="flex gap-3 flex-wrap">
                      {selectedProduct.colors.map((color, i) => (
                        <button key={i} onClick={() => setSelectedColor(color)} title={color}
                          className={`w-9 h-9 rounded-full border-4 transition-all ${selectedColor === color ? 'border-violet-500 scale-110 shadow-md' : 'border-gray-200 hover:border-violet-300'}`}
                          style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                )}
                {selectedProduct.sizes?.length > 0 && (
                  <div className="mb-6">
                    <p className="font-bold text-sm mb-2 text-gray-800">Size</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedProduct.sizes.map((size, i) => (
                        <button key={i} onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 border-2 rounded-xl text-sm font-semibold transition-all ${selectedSize === size ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 hover:border-violet-400 text-gray-700'}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => addToCart(selectedProduct)} className="flex-1 py-3.5 bg-gray-900 hover:bg-gray-700 text-white rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                    <CartIcon className="w-4 h-4" /> Add to Cart
                  </button>
                  <button onClick={() => handleBuyNow(selectedProduct)} className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold text-sm transition-colors">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART */}
      {showCart && (
        <div className="fixed inset-0 bg-black/70 z-60 flex justify-end" onClick={() => { setShowCart(false); onCartClose?.(); }}>
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center bg-white">
              <h2 className="text-lg font-black text-gray-900">
                Your Cart <span className="text-violet-600">({cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'})</span>
              </h2>
              <button onClick={() => { setShowCart(false); onCartClose?.(); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CartIcon className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-semibold">Your cart is empty</p>
                  <button onClick={() => { setShowCart(false); navigateTo(); }} className="mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">
                    Start Shopping
                  </button>
                </div>
              ) : cart.map((item, index) => (
                <div key={index} className="flex gap-3 border border-gray-100 rounded-2xl p-3 bg-gray-50">
                  <img src={item.images?.[0]} className="w-20 h-20 object-cover rounded-xl shrink-0" alt={item.name} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-2 text-gray-800">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-3.5 h-3.5 rounded-full border shrink-0 ring-1 ring-gray-200" style={{ backgroundColor: item.selectedColor }} />
                      <span className="text-xs text-gray-500">{item.selectedColor}</span>
                      {item.selectedSize && item.selectedSize !== 'Standard' && (
                        <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">{item.selectedSize}</span>
                      )}
                    </div>
                    <p className="font-black text-violet-700 text-sm mt-1">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => { if (item.quantity <= 1) return; setCart(p => p.map((x, i) => i === index ? { ...x, quantity: x.quantity - 1 } : x)); }}
                        className="w-7 h-7 border-2 rounded-lg text-sm font-bold hover:border-violet-400 transition-colors flex items-center justify-center text-gray-600"
                      >−</button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => setCart(p => p.map((x, i) => i === index ? { ...x, quantity: x.quantity + 1 } : x))}
                        className="w-7 h-7 border-2 rounded-lg text-sm font-bold hover:border-violet-400 transition-colors flex items-center justify-center text-gray-600"
                      >+</button>
                      <button
                        onClick={() => setCart(p => p.filter((_, i) => i !== index))}
                        className="text-red-400 text-xs ml-2 hover:text-red-600 font-semibold transition-colors"
                      >Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t bg-white">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-gray-700">Total</span>
                  <span className="font-black text-xl text-violet-700">Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => { setCheckoutProduct(null); setCheckoutStep(1); setShowCart(false); setShowCheckout(true); }}
                  className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-base transition-all"
                >
                  Proceed to Checkout ({cartItemsCount} items)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 z-70 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl max-h-[96vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => checkoutStep === 2 ? setCheckoutStep(1) : (setShowCheckout(false), setCheckoutProduct(null))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  <BackIcon />
                </button>
                <div>
                  <h2 className="text-lg font-black">{checkoutStep === 1 ? 'Order Review' : 'Delivery Details'}</h2>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="h-1.5 w-10 rounded-full bg-violet-600" />
                    <div className={`h-1.5 w-10 rounded-full transition-colors ${checkoutStep >= 2 ? 'bg-violet-600' : 'bg-gray-200'}`} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setShowCheckout(false); setCheckoutProduct(null); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <CloseIcon />
              </button>
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
                          <div className="flex gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full border inline-block ring-1 ring-gray-200" style={{ backgroundColor: item.selectedColor }} />
                              {item.selectedColor}
                            </span>
                            <span>Size: <strong>{item.selectedSize}</strong></span>
                            <span>Qty: <strong>{item.quantity || 1}</strong></span>
                          </div>
                          <p className="font-black text-violet-700 mt-1">Rs. {(item.price * (item.quantity || 1)).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-violet-50 rounded-2xl p-4 flex justify-between items-center mb-4 border border-violet-100">
                    <span className="font-bold text-gray-700">Total Amount</span>
                    <span className="font-black text-violet-700 text-xl">Rs. {orderTotal.toLocaleString()}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-sm text-amber-800">
                    <strong>Cash on Delivery</strong> — Pay when you receive your order. No advance required.
                  </div>
                  <button
                    onClick={() => setCheckoutStep(2)}
                    className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Delivery <ChevronRight />
                  </button>
                </div>
              )}
              {checkoutStep === 2 && (
                <form onSubmit={submitOrder}>
                  <button type="button" onClick={detectLocation} disabled={locationLoading}
                    className="w-full mb-5 py-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                    {locationLoading ? <><SpinIcon /> Detecting location...</> : <><LocationIcon /> Auto-detect My Location</>}
                  </button>
                  <div className="space-y-4">
                    {[
                      { label: 'Full Name', key: 'name',  type: 'text',  placeholder: 'Your full name',        required: true  },
                      { label: 'Phone',     key: 'phone', type: 'tel',   placeholder: '03XX-XXXXXXX',          required: true  },
                      { label: 'Email',     key: 'email', type: 'email', placeholder: 'email@example.com',     required: false },
                      { label: 'City',      key: 'city',  type: 'text',  placeholder: 'Karachi, Lahore...',    required: true  },
                      { label: 'Area',      key: 'area',  type: 'text',  placeholder: 'Gulshan, DHA, F-10...', required: true  },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-sm font-bold mb-1.5 text-gray-700">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                          {!field.required && <span className="text-gray-400 font-normal"> (optional)</span>}
                        </label>
                        <input type={field.type} placeholder={field.placeholder} required={field.required}
                          className={inputCls}
                          value={customerInfo[field.key as keyof CustomerInfo]}
                          onChange={e => setCustomerInfo({ ...customerInfo, [field.key]: e.target.value })} />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-bold mb-1.5 text-gray-700">Full Address <span className="text-red-400">*</span></label>
                      <textarea placeholder="House/flat number, street, area, landmark..." required rows={3}
                        className={`${inputCls} resize-none`}
                        value={customerInfo.address}
                        onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })} />
                    </div>
                  </div>
                  <div className="mt-5 bg-gray-50 rounded-2xl p-4 flex justify-between items-center border border-gray-100">
                    <span className="text-sm text-gray-500">{checkoutItems.length} item(s)</span>
                    <span className="font-black text-violet-700">Rs. {orderTotal.toLocaleString()}</span>
                  </div>
                  <button type="submit" disabled={orderLoading}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2">
                    {orderLoading ? <><SpinIcon /> Processing...</> : <><CheckIcon /> Place Order</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ORDER SUCCESS */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/90 z-80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">✅</div>
            <h1 className="text-3xl font-black text-green-600 mb-2">Order Placed!</h1>
            <p className="text-gray-500 mb-6">Thank you for choosing MaestraVibe!</p>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-6 text-left text-sm space-y-2 text-gray-700">
              <p className="flex items-center gap-2"><CheckIcon /> Order confirmed</p>
              <p className="flex items-center gap-2"><CheckIcon /> Packaging will begin shortly</p>
              <p className="flex items-center gap-2"><CheckIcon /> Delivery in 2–4 business days</p>
              <p className="flex items-center gap-2"><CheckIcon /> Pay the delivery person on arrival</p>
            </div>
            <button
              onClick={() => { setShowSuccess(false); setShowNewsletter(true); }}
              className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-4 rounded-2xl font-black transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* NEWSLETTER */}
      {showNewsletter && (
        <div className="fixed inset-0 bg-black/80 z-80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            {!newsletterDone ? (
              <>
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Stay in the loop!</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Subscribe to get exclusive deals, new arrivals &amp; special offers from MaestraVibe.
                </p>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-violet-500 transition-colors text-center"
                />
                <button
                  onClick={() => { if (newsletterEmail.trim()) setNewsletterDone(true); }}
                  className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-3.5 rounded-2xl font-black text-sm transition-all mb-3"
                >
                  Subscribe Now 🎁
                </button>
                <button
                  onClick={() => setShowNewsletter(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline"
                >
                  No thanks, skip
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">✉️</div>
                <h2 className="text-2xl font-black text-violet-600 mb-2">You&apos;re subscribed!</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Welcome to the MaestraVibe family. Expect amazing deals in your inbox soon!
                </p>
                <button
                  onClick={() => { setShowNewsletter(false); setNewsletterDone(false); setNewsletterEmail(''); }}
                  className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-sm transition-all"
                >
                  Start Shopping
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <AIChat products={allProducts} onOpenProduct={openProduct} />
    </main>
  );
}