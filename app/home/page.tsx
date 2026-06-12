'use client';

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const AIChat = dynamic(() => import("@/components/AIChat"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────
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


const SLIDES = [
  { image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop", title: "New Collection", sub: "Trendy fashion — ek click mein" },
  { image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop", title: "Premium Brands", sub: "Asli quality, sahi daam" },
  { image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop", title: "Fast Delivery", sub: "COD available — poore Pakistan mein" },
];

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Kids", value: "kids" },
  { label: "Accessories", value: "accessories" },
  { label: "Sale", value: "sale" },
];

const SORT_OPTIONS = [
  { label: "Default",           value: "default"    },
  { label: "Price: Low to High",value: "price-asc"  },
  { label: "Price: High to Low",value: "price-desc" },
  { label: "Name A-Z",          value: "name-asc"   },
  { label: "Name Z-A",          value: "name-desc"  },
];

// ─── Cart helpers ─────────────────────────────────────────────────────────────
function loadCart(): CartItem[] {
  try { const s = localStorage.getItem("maestravibe_cart"); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveCart(c: CartItem[]) {
  try { localStorage.setItem("maestravibe_cart", JSON.stringify(c)); } catch {}
}
function playSuccessSound() {
  try { const a = new Audio("/sound/mixkit-happy-bells-notification-937.wav"); a.volume = 0.85; a.play().catch(() => {}); } catch {}
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [shopSectionRef] = useState(() => ({ current: null as HTMLDivElement | null }));

  // Filters
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // View state — initialize from URL so direct category links work
  const [view, setView] = useState<"home" | "shop">(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("category") || p.get("search")) return "shop";
    }
    return "home";
  });

  // Product modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  // Checkout
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [checkoutProduct, setCheckoutProduct] = useState<CartItem | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: "", email: "", phone: "", address: "", city: "", area: "" });

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { setCart(loadCart()); setCartLoaded(true); }, []);
  useEffect(() => { if (cartLoaded) saveCart(cart); }, [cart, cartLoaded]);

  // Sync URL params — if category or search in URL, go to shop view
  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    const q   = searchParams.get("search")   || "";
    setActiveCategory(cat);
    setSearchQuery(q);
    setSearchInput(q);
    if (cat !== "all" || q) setView("shop");
  }, [searchParams]);

  useEffect(() => {
    const id = setInterval(() => setCurrentSlide(p => (p + 1) % SLIDES.length), 4000);
    return () => clearInterval(id);
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error();
      setAllProducts(await res.json());
    } catch { console.error("Failed to load products"); }
    finally { setProductsLoading(false); }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const allColors = Array.from(new Set(allProducts.flatMap(p => p.colors ?? [])));
  const allSizes  = Array.from(new Set(allProducts.flatMap(p => p.sizes  ?? [])));

  let filteredProducts = allProducts.filter(p => {
    const matchCat    = activeCategory === "all" || p.category === activeCategory;
    const q           = searchQuery.trim().toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.description?.toLowerCase() ?? "").includes(q) || (p.category?.toLowerCase() ?? "").includes(q);
    const minP = priceMin ? Number(priceMin) : 0;
    const maxP = priceMax ? Number(priceMax) : Infinity;
    const matchPrice  = p.price >= minP && p.price <= maxP;
    const matchColor  = selectedColors.length === 0 || selectedColors.some(c => p.colors?.includes(c));
    const matchSize   = selectedSizes.length === 0  || selectedSizes.some(s  => p.sizes?.includes(s));
    return matchCat && matchSearch && matchPrice && matchColor && matchSize;
  });

  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc")  return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name-asc")   return a.name.localeCompare(b.name);
    if (sortBy === "name-desc")  return b.name.localeCompare(a.name);
    return 0;
  });

  const checkoutItems = checkoutProduct ? [checkoutProduct] : cart;
  const orderTotal    = checkoutItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  const cartTotal     = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const activeFiltersCount = (priceMin || priceMax ? 1 : 0) + (selectedColors.length > 0 ? 1 : 0) + (selectedSizes.length > 0 ? 1 : 0);

  // Grouped products for home sections
  const featured   = allProducts.slice(0, 8);
  const newArrivals = [...allProducts].reverse().slice(0, 8);
  const byCategory  = CATEGORIES.filter(c => c.value !== "all" && c.value !== "sale").slice(0, 6).map(cat => ({
    ...cat,
    products: allProducts.filter(p => p.category === cat.value).slice(0, 4),
  })).filter(c => c.products.length > 0);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const goToShop = (cat = "all", q = "") => {
    setActiveCategory(cat);
    setSearchQuery(q);
    setSearchInput(q);
    setView("shop");
    const params = new URLSearchParams();
    if (cat !== "all") params.set("category", cat);
    if (q) params.set("search", q);
    router.push(params.toString() ? `/?${params}` : "/", { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    goToShop(activeCategory, q);
  };

  const handleCategoryClick = (value: string) => {
    goToShop(value, searchQuery);
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors?.[0] || "");
    setSelectedSize(product.sizes?.[0] || "Standard");
    setSelectedImageIndex(0);
  };

  const addToCart = (product: Product, color?: string, size?: string) => {
    const item: CartItem = {
      ...product,
      selectedColor: color ?? selectedColor ?? product.colors?.[0] ?? "",
      selectedSize:  size  ?? selectedSize  ?? product.sizes?.[0]  ?? "Standard",
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
      selectedColor: color ?? product.colors?.[0] ?? "",
      selectedSize:  size  ?? product.sizes?.[0]  ?? "Standard",
      quantity: 1,
    };
    setCheckoutProduct(item);
    setSelectedProduct(null);
    setCheckoutStep(1);
    setShowCheckout(true);
  };

  const clearFilters = () => { setPriceMin(""); setPriceMax(""); setSelectedColors([]); setSelectedSizes([]); setSortBy("default"); };

  const detectLocation = () => {
    if (!navigator.geolocation) { alert("Browser location support nahi karta."); return; }
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
            city:    addr.city || addr.town || addr.village || addr.state_district || "",
            area:    addr.neighbourhood || addr.suburb || addr.road || "",
            address: [addr.road, addr.neighbourhood || addr.suburb, addr.city || addr.town].filter(Boolean).join(", ") || prev.address,
          }));
          alert("✅ Location detect ho gayi!");
        } catch { alert("Location detect nahi hua. Manual fill karein."); }
        finally { setLocationLoading(false); }
      },
      () => { setLocationLoading(false); alert("Location permission deny."); },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customerInfo,
          items: checkoutItems.map(item => ({ productId: item._id, name: item.name, price: item.price, quantity: item.quantity || 1, selectedColor: item.selectedColor, selectedSize: item.selectedSize, image: item.images?.[0] || "" })),
          total: orderTotal, status: "new",
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Order failed");
      playSuccessSound();
      setShowCheckout(false); setCheckoutProduct(null); setCart([]);
      setCustomerInfo({ name: "", email: "", phone: "", address: "", city: "", area: "" });
      setShowSuccess(true);
    } catch (err: any) { alert(`❌ ${err.message}`); }
    finally { setOrderLoading(false); }
  };

  // ── Product Card (reusable) ───────────────────────────────────────────────
  const ProductCard = ({ product, compact = false }: { product: Product; compact?: boolean }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-gray-100">
      <div onClick={() => openProduct(product)} className="relative overflow-hidden cursor-pointer bg-gray-100" style={{ height: compact ? "140px" : "180px" }}>
        <img src={product.images?.[0] || "https://via.placeholder.com/400"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={product.name} />
        <span className="absolute top-2 left-2 bg-white/90 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium capitalize backdrop-blur-sm">{product.category}</span>
      </div>
      <div className="p-3">
        <h3 onClick={() => openProduct(product)} className="font-semibold text-sm mb-1 line-clamp-2 cursor-pointer hover:text-rose-600 transition">{product.name}</h3>
        {!compact && product.colors?.length > 0 && (
          <div className="flex gap-1 mb-1.5">
            {product.colors.slice(0, 5).map((c, i) => <span key={i} className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: c }} title={c} />)}
            {product.colors.length > 5 && <span className="text-xs text-gray-400">+{product.colors.length - 5}</span>}
          </div>
        )}
        <p className="text-rose-600 font-black text-base">Rs. {product.price.toLocaleString()}</p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => addToCart(product, product.colors?.[0], product.sizes?.[0])}
            className={`flex-1 py-2 text-xs rounded-xl font-semibold transition ${addedToCart === product._id ? "bg-green-500 text-white" : "bg-gray-900 text-white hover:bg-gray-700"}`}>
            {addedToCart === product._id ? "✓ Added!" : "🛒 Cart"}
          </button>
          <button onClick={() => handleBuyNow(product, product.colors?.[0], product.sizes?.[0])}
            className="flex-1 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition">
            ⚡ Buy
          </button>
        </div>
      </div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <main className="bg-gray-50 text-gray-900 min-h-screen">

      {/* ── NAV ── */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-3">
            <button onClick={() => { setView("home"); router.push("/", { scroll: false }); setActiveCategory("all"); setSearchQuery(""); setSearchInput(""); }}
              className="text-2xl font-black text-rose-600 tracking-tight shrink-0 hover:opacity-80 transition">
              MAESTRA<span className="text-gray-800">VIBE</span>
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg">
              <div className="relative">
                <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  placeholder="Product dhundein..."
                  className="w-full border-2 border-gray-200 rounded-full py-2 pl-4 pr-11 text-sm focus:outline-none focus:border-rose-400 transition" />
                <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-7 h-7 flex items-center justify-center transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </form>
            <div className="flex items-center gap-2 shrink-0">
              <a href="https://wa.me/923274050806" target="_blank" rel="noreferrer"
                className="hidden sm:flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-green-600 transition">
                💬 WhatsApp
              </a>
              <button onClick={() => setShowCart(true)} className="relative p-2 hover:text-rose-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" /></svg>
                {cart.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cart.reduce((s,i)=>s+i.quantity,0)>9?"9+":cart.reduce((s,i)=>s+i.quantity,0)}</span>}
              </button>
            </div>
          </div>
          {/* Category strip */}
          <div className="flex gap-1.5 pb-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => handleCategoryClick(cat.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition shrink-0 ${activeCategory === cat.value && view === "shop" ? "bg-rose-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600"}`}>
                <span>{cat.icon}</span>{cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="bg-rose-600 text-white text-center text-xs py-1.5 font-medium tracking-wide">
        🔄 7 din return &nbsp;|&nbsp; 🚚 Rs.1500+ free delivery &nbsp;|&nbsp; 💵 Cash on Delivery &nbsp;|&nbsp; 📞 03274050806
      </div>

      {/* ════════════════════════════════════════════════════════════
          HOME VIEW
      ════════════════════════════════════════════════════════════ */}
      {view === "home" && (
        <>
          {/* Hero Slider */}
          <section className="relative w-full h-64 md:h-[420px] overflow-hidden">
            {SLIDES.map((slide, i) => (
              <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}>
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent flex items-center px-8 md:px-20">
                  <div className="max-w-lg">
                    <p className="text-rose-300 text-xs font-bold uppercase tracking-widest mb-2">MaestraVibe</p>
                    <h2 className="text-white text-4xl md:text-6xl font-black leading-tight">{slide.title}</h2>
                    <p className="text-white/80 text-sm mt-2 mb-6">{slide.sub}</p>
                    <button onClick={() => goToShop()}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-full font-bold text-sm transition hover:scale-105 active:scale-95">
                      Shop Now →
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  className={`transition-all rounded-full ${i === currentSlide ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"}`} />
              ))}
            </div>
          </section>

          {/* Features strip */}
          <section className="bg-white border-y border-gray-100 py-4">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { icon: "🚚", title: "Free Delivery", sub: "Rs.1500+ par" },
                  { icon: "💵", title: "Cash on Delivery", sub: "Koi advance nahi" },
                  { icon: "🔄", title: "7 Din Return", sub: "Easy return policy" },
                  { icon: "✅", title: "Original Products", sub: "100% authentic" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 justify-center md:justify-start">
                    <span className="text-2xl">{f.icon}</span>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-800">{f.title}</p>
                      <p className="text-xs text-gray-400">{f.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Category Cards */}
          <section className="py-10 max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-black text-gray-800">🛍️ Categories</h2>
              <button onClick={() => goToShop()} className="text-sm text-rose-600 font-semibold hover:underline">Sab dekhein →</button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
              {CATEGORIES.filter(c => c.value !== "all").map(cat => (
                <button key={cat.value} onClick={() => handleCategoryClick(cat.value)}
                  className="flex flex-col items-center gap-2 bg-white rounded-2xl p-3 border border-gray-100 hover:border-rose-300 hover:shadow-md transition-all group">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Featured Products */}
          {featured.length > 0 && (
            <section className="py-8 bg-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-black text-gray-800">⭐ Featured Products</h2>
                  <button onClick={() => goToShop()} className="text-sm text-rose-600 font-semibold hover:underline">Sab dekhein →</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                  {featured.map((p, idx) => <ProductCard key={p._id ?? idx} product={p} />)}
                </div>
              </div>
            </section>
          )}

          {/* New Arrivals */}
          {newArrivals.length > 0 && (
            <section className="py-10 max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-black text-gray-800">🆕 New Arrivals</h2>
                <button onClick={() => goToShop()} className="text-sm text-rose-600 font-semibold hover:underline">Sab dekhein →</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newArrivals.map((p, idx) => <ProductCard key={p._id ?? idx} product={p} />)}
              </div>
            </section>
          )}

          {/* Products by Category sections */}
          {byCategory.map(cat => (
            <section key={cat.value} className="py-8 bg-white border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-black text-gray-800">{cat.icon} {cat.name}</h2>
                  <button onClick={() => handleCategoryClick(cat.value)} className="text-sm text-rose-600 font-semibold hover:underline">
                    Sab {cat.name} →
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {cat.products.map((p, idx) => <ProductCard key={p._id ?? idx} product={p} />)}
                </div>
              </div>
            </section>
          ))}

          {/* CTA Banner */}
          <section className="py-12 bg-gradient-to-r from-rose-600 to-rose-800">
            <div className="max-w-2xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Sab Products Dekhein</h2>
              <p className="text-rose-100 mb-6">Hazaron products — fashion se electronics tak — sab ek jagah</p>
              <button onClick={() => goToShop()}
                className="bg-white text-rose-600 px-10 py-4 rounded-full font-black text-base hover:bg-rose-50 transition hover:scale-105 active:scale-95 shadow-lg">
                Shop Now 🛍️
              </button>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          SHOP VIEW
      ════════════════════════════════════════════════════════════ */}
      {view === "shop" && (
        <>
          {/* Breadcrumb */}
          <div className="max-w-7xl mx-auto px-4 pt-4 pb-1 flex items-center gap-2 text-xs text-gray-500">
            <button onClick={() => { setView("home"); setActiveCategory("all"); setSearchQuery(""); setSearchInput(""); router.push("/", { scroll: false }); }} className="hover:text-rose-600 transition">Home</button>
            <span>›</span>
            <span className="font-semibold text-gray-700">
              {activeCategory !== "all" ? CATEGORIES.find(c => c.value === activeCategory)?.name : "Sab Products"}
              {searchQuery && ` — "${searchQuery}"`}
            </span>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {activeCategory !== "all" && (
                  <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    {CATEGORIES.find(c => c.value === activeCategory)?.icon} {CATEGORIES.find(c => c.value === activeCategory)?.name}
                    <button onClick={() => handleCategoryClick("all")} className="ml-1">✕</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    🔍 &quot;{searchQuery}&quot;
                    <button onClick={() => { setSearchInput(""); goToShop(activeCategory, ""); }} className="ml-1">✕</button>
                  </span>
                )}
                <span className="text-xs text-gray-400">{filteredProducts.length} products</span>
              </div>
              <div className="flex items-center gap-2">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:border-rose-400 bg-white">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode("grid")} className={`px-2 py-1.5 text-xs transition ${viewMode==="grid"?"bg-rose-600 text-white":"bg-white text-gray-500 hover:bg-gray-50"}`}>⊞</button>
                  <button onClick={() => setViewMode("list")} className={`px-2 py-1.5 text-xs transition ${viewMode==="list"?"bg-rose-600 text-white":"bg-white text-gray-500 hover:bg-gray-50"}`}>☰</button>
                </div>
                <button onClick={() => setShowSidebar(!showSidebar)}
                  className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-semibold hover:border-rose-400 hover:text-rose-600 transition relative">
                  🎛 Filters
                  {activeFiltersCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{activeFiltersCount}</span>}
                </button>
              </div>
            </div>

            <div className="flex gap-5">
              {/* Sidebar */}
              <aside className={`shrink-0 transition-all duration-300 ${showSidebar ? "w-52" : "w-0 overflow-hidden"}`}>
                {showSidebar && (
                  <div className="w-52 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-20 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-sm text-gray-800">🎛 Filters</h3>
                      {activeFiltersCount > 0 && <button onClick={clearFilters} className="text-xs text-rose-500 font-semibold">Clear</button>}
                    </div>
                    {/* Price */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price (Rs.)</p>
                      <div className="flex gap-2 mb-2">
                        <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-rose-400" />
                        <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-rose-400" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {[{ label:"U-1k",min:"",max:"1000"},{label:"1k-3k",min:"1000",max:"3000"},{label:"3k-5k",min:"3000",max:"5000"},{label:"5k+",min:"5000",max:""}].map(r=>(
                          <button key={r.label} onClick={()=>{setPriceMin(r.min);setPriceMax(r.max);}}
                            className={`text-xs px-2 py-1 rounded-full border transition ${priceMin===r.min&&priceMax===r.max?"bg-rose-600 text-white border-rose-600":"border-gray-200 text-gray-500 hover:border-rose-300"}`}>{r.label}</button>
                        ))}
                      </div>
                    </div>
                    {/* Colors */}
                    {allColors.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Colors</p>
                        <div className="flex flex-wrap gap-2">
                          {allColors.slice(0,16).map((c,i)=>(
                            <button key={i} onClick={()=>setSelectedColors(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c])} title={c}
                              className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColors.includes(c)?"border-rose-500 scale-110 shadow-md":"border-gray-200 hover:border-rose-300"}`}
                              style={{backgroundColor:c}} />
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Sizes */}
                    {allSizes.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sizes</p>
                        <div className="flex flex-wrap gap-1.5">
                          {allSizes.map((s,i)=>(
                            <button key={i} onClick={()=>setSelectedSizes(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])}
                              className={`px-2.5 py-1 text-xs rounded-lg border-2 font-semibold transition ${selectedSizes.includes(s)?"bg-rose-600 text-white border-rose-600":"border-gray-200 text-gray-600 hover:border-rose-300"}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </aside>

              {/* Products */}
              <div className="flex-1 min-w-0">
                {productsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_,i)=>(
                      <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
                        <div className="h-44 bg-gray-200"/><div className="p-3 space-y-2"><div className="h-3 bg-gray-200 rounded w-3/4"/><div className="h-3 bg-gray-200 rounded w-1/2"/><div className="h-8 bg-gray-200 rounded"/></div>
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-24">
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="text-gray-500 text-lg font-medium">Koi product nahi mila</p>
                    <p className="text-gray-400 text-sm mt-1">Filter change karein ya search clear karein</p>
                    <button onClick={()=>{setSearchInput("");clearFilters();goToShop();}}
                      className="mt-4 px-6 py-2.5 bg-rose-600 text-white rounded-full text-sm font-semibold">Sab Products Dekhein</button>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className={`grid gap-4 ${showSidebar?"grid-cols-2 md:grid-cols-3":"grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
                    {filteredProducts.map((product, idx) => <ProductCard key={product._id ?? idx} product={product} />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product, idx) => (
                      <div key={product._id ?? idx} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex gap-4 p-3">
                        <div onClick={()=>openProduct(product)} className="cursor-pointer shrink-0 rounded-xl overflow-hidden bg-gray-100 w-24 h-24">
                          <img src={product.images?.[0]||"https://via.placeholder.com/400"} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt={product.name}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-medium capitalize">{product.category}</span>
                              <h3 onClick={()=>openProduct(product)} className="font-semibold text-sm mt-1 cursor-pointer hover:text-rose-600 transition line-clamp-2">{product.name}</h3>
                              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{product.description}</p>
                            </div>
                            <p className="text-rose-600 font-black text-base shrink-0">Rs. {product.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            {product.colors?.length>0&&(<div className="flex gap-1">{product.colors.slice(0,6).map((c,i)=>(<span key={i} className="w-4 h-4 rounded-full border border-gray-200" style={{backgroundColor:c}}/>))}</div>)}
                            <div className="flex gap-2 ml-auto">
                              <button onClick={()=>addToCart(product,product.colors?.[0],product.sizes?.[0])}
                                className={`py-1.5 px-3 text-xs rounded-xl font-semibold transition ${addedToCart===product._id?"bg-green-500 text-white":"bg-gray-900 text-white hover:bg-gray-700"}`}>
                                {addedToCart===product._id?"✓ Added!":"🛒 Cart"}
                              </button>
                              <button onClick={()=>handleBuyNow(product,product.colors?.[0],product.sizes?.[0])}
                                className="py-1.5 px-3 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition">⚡ Buy</button>
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

      {/* ── PRODUCT DETAIL MODAL ── */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 z-[55] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-4xl rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[94vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-5 bg-gray-50">
                <img src={selectedProduct.images?.[selectedImageIndex]||"https://via.placeholder.com/600"} className="w-full rounded-2xl shadow object-cover" style={{maxHeight:"320px"}} alt={selectedProduct.name}/>
                {selectedProduct.images?.length>1&&(
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {selectedProduct.images.map((img,i)=>(
                      <img key={i} src={img} onClick={()=>setSelectedImageIndex(i)}
                        className={`cursor-pointer rounded-xl border-2 h-16 w-16 object-cover shrink-0 transition ${selectedImageIndex===i?"border-rose-500":"border-transparent"}`} alt={`thumb-${i}`}/>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:w-1/2 p-5 md:p-7">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs uppercase text-rose-500 font-bold tracking-wider capitalize">{selectedProduct.category}</span>
                    <h1 className="text-xl md:text-2xl font-black mt-0.5">{selectedProduct.name}</h1>
                  </div>
                  <button onClick={()=>setSelectedProduct(null)} className="text-3xl text-gray-400 hover:text-black leading-none ml-2 shrink-0">×</button>
                </div>
                <p className="text-3xl font-black text-rose-600 mb-3">Rs. {selectedProduct.price.toLocaleString()}</p>
                <p className="text-gray-600 text-sm mb-4 whitespace-pre-line leading-relaxed">{selectedProduct.description}</p>
                {selectedProduct.colors?.length>0&&(
                  <div className="mb-4">
                    <p className="font-bold text-sm mb-2">Color: <span className="text-gray-500 font-normal">{selectedColor}</span></p>
                    <div className="flex gap-2.5 flex-wrap">
                      {selectedProduct.colors.map((color,i)=>(
                        <button key={i} onClick={()=>setSelectedColor(color)} title={color}
                          className={`w-9 h-9 rounded-full border-4 transition-all ${selectedColor===color?"border-rose-500 scale-110 shadow-md":"border-gray-200"}`}
                          style={{backgroundColor:color}}/>
                      ))}
                    </div>
                  </div>
                )}
                {selectedProduct.sizes?.length>0&&(
                  <div className="mb-5">
                    <p className="font-bold text-sm mb-2">Size</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedProduct.sizes.map((size,i)=>(
                        <button key={i} onClick={()=>setSelectedSize(size)}
                          className={`px-4 py-1.5 border-2 rounded-xl text-sm font-semibold transition ${selectedSize===size?"bg-rose-600 text-white border-rose-600":"border-gray-200 hover:border-rose-300 hover:text-rose-600"}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={()=>addToCart(selectedProduct)} className="flex-1 py-3.5 bg-gray-900 hover:bg-gray-700 text-white rounded-2xl font-bold text-sm transition">🛒 Cart Mein Daalein</button>
                  <button onClick={()=>handleBuyNow(selectedProduct)} className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm transition">⚡ Abhi Khareedein</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CART ── */}
      {showCart&&(
        <div className="fixed inset-0 bg-black/70 z-[60] flex justify-end" onClick={()=>setShowCart(false)}>
          <div className="bg-white w-full max-w-md h-full flex flex-col" onClick={e=>e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0">
              <h2 className="text-lg font-black">🛒 Cart <span className="text-rose-600">({cart.reduce((s,i)=>s+i.quantity,0)} items)</span></h2>
              <button onClick={()=>setShowCart(false)} className="text-3xl text-gray-400 hover:text-black">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length===0?(
                <div className="text-center py-20"><div className="text-5xl mb-3">🛒</div><p className="text-gray-400 font-medium">Cart khali hai</p><button onClick={()=>setShowCart(false)} className="mt-4 px-5 py-2 bg-rose-600 text-white rounded-full text-sm font-semibold">Shopping Karein</button></div>
              ):cart.map((item,index)=>(
                <div key={index} className="flex gap-3 border rounded-2xl p-3 bg-gray-50">
                  <img src={item.images?.[0]} className="w-20 h-20 object-cover rounded-xl shrink-0" alt={item.name}/>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-2">{item.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-3.5 h-3.5 rounded-full border shrink-0" style={{backgroundColor:item.selectedColor}}/>
                      <span className="text-xs text-gray-500">{item.selectedColor}</span>
                      {item.selectedSize&&item.selectedSize!=="Standard"&&<span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">{item.selectedSize}</span>}
                    </div>
                    <p className="font-black text-rose-600 text-sm mt-1">Rs. {(item.price*item.quantity).toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button onClick={()=>{if(item.quantity-1<1)return;setCart(p=>p.map((x,i)=>i===index?{...x,quantity:x.quantity-1}:x));}} className="w-7 h-7 border-2 rounded-lg text-sm font-bold hover:border-rose-400 transition">−</button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button onClick={()=>setCart(p=>p.map((x,i)=>i===index?{...x,quantity:x.quantity+1}:x))} className="w-7 h-7 border-2 rounded-lg text-sm font-bold hover:border-rose-400 transition">+</button>
                      <button onClick={()=>setCart(p=>p.filter((_,i)=>i!==index))} className="text-red-400 text-xs ml-1 hover:text-red-600 font-medium">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length>0&&(
              <div className="p-4 border-t bg-white">
                <div className="flex justify-between mb-3 font-black text-lg"><span>Total</span><span className="text-rose-600">Rs. {cartTotal.toLocaleString()}</span></div>
                <button onClick={()=>{setCheckoutProduct(null);setCheckoutStep(1);setShowCart(false);setShowCheckout(true);}}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-black text-base transition">
                  Checkout → ({cart.reduce((s,i)=>s+i.quantity,0)} items)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CHECKOUT ── */}
      {showCheckout&&(
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl max-h-[96vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <button onClick={()=>checkoutStep===2?setCheckoutStep(1):(setShowCheckout(false),setCheckoutProduct(null))} className="text-2xl text-gray-400 hover:text-black">←</button>
                <div>
                  <h2 className="text-lg font-black">{checkoutStep===1?"Order Review":"Delivery Details"}</h2>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="h-1.5 w-10 rounded-full bg-rose-600"/>
                    <div className={`h-1.5 w-10 rounded-full ${checkoutStep>=2?"bg-rose-600":"bg-gray-200"}`}/>
                  </div>
                </div>
              </div>
              <button onClick={()=>{setShowCheckout(false);setCheckoutProduct(null);}} className="text-2xl text-gray-400">×</button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              {checkoutStep===1&&(
                <div>
                  <div className="space-y-3 mb-5">
                    {checkoutItems.map((item,i)=>(
                      <div key={i} className="flex gap-3 bg-gray-50 rounded-2xl p-4 items-center">
                        <img src={item.images?.[0]} className="w-16 h-16 object-cover rounded-xl shrink-0" alt={item.name}/>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                          <div className="flex gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border inline-block" style={{backgroundColor:item.selectedColor}}/>{item.selectedColor}</span>
                            <span>Size: <strong>{item.selectedSize}</strong></span>
                            <span>Qty: <strong>{item.quantity||1}</strong></span>
                          </div>
                          <p className="font-black text-rose-600 mt-1">Rs. {(item.price*(item.quantity||1)).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-rose-50 rounded-2xl p-4 flex justify-between items-center mb-4">
                    <span className="font-bold">Total Amount</span>
                    <span className="font-black text-rose-600 text-xl">Rs. {orderTotal.toLocaleString()}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-sm text-amber-800">
                    💵 <strong>Cash on Delivery</strong> — delivery ke waqt payment karein. Koi advance nahi!
                  </div>
                  <button onClick={()=>setCheckoutStep(2)} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-black text-base transition">Delivery Details Bharein →</button>
                </div>
              )}
              {checkoutStep===2&&(
                <form onSubmit={submitOrder}>
                  <button type="button" onClick={detectLocation} disabled={locationLoading}
                    className="w-full mb-5 py-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60">
                    {locationLoading?<><span className="animate-spin">⏳</span>Detect ho raha hai...</>:<>📍 Auto Location Detect Karein</>}
                  </button>
                  <div className="space-y-3.5">
                    {[
                      {label:"Full Name *",key:"name",type:"text",placeholder:"Apna poora naam"},
                      {label:"Phone *",key:"phone",type:"tel",placeholder:"03XX-XXXXXXX"},
                      {label:"Email (optional)",key:"email",type:"email",placeholder:"email@example.com"},
                      {label:"City *",key:"city",type:"text",placeholder:"Karachi, Lahore, Islamabad..."},
                      {label:"Area / Sector *",key:"area",type:"text",placeholder:"Gulshan, DHA, F-10..."},
                    ].map(field=>(
                      <div key={field.key}>
                        <label className="block text-sm font-bold mb-1 text-gray-700">{field.label}</label>
                        <input type={field.type} placeholder={field.placeholder} required={field.label.includes("*")}
                          className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-rose-400 focus:outline-none text-sm transition"
                          value={customerInfo[field.key as keyof CustomerInfo]}
                          onChange={e=>setCustomerInfo({...customerInfo,[field.key]:e.target.value})}/>
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-bold mb-1 text-gray-700">Full Address *</label>
                      <textarea placeholder="Ghar/flat number, gali, mohalla, landmark..." required rows={3}
                        className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-rose-400 focus:outline-none text-sm resize-none transition"
                        value={customerInfo.address} onChange={e=>setCustomerInfo({...customerInfo,address:e.target.value})}/>
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">{checkoutItems.length} item(s)</span>
                    <span className="font-black text-rose-600">Rs. {orderTotal.toLocaleString()}</span>
                  </div>
                  <button type="submit" disabled={orderLoading}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-4 rounded-2xl font-black text-base transition">
                    {orderLoading?"⏳ Processing...":"✅ Order Place Karein"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {showSuccess&&(
        <div className="fixed inset-0 bg-black/90 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="text-7xl mb-4">🎉</div>
            <h1 className="text-3xl font-black text-green-600 mb-2">Order Ho Gaya!</h1>
            <p className="text-gray-500 mb-5">Shukriya MaestraVibe choose karne ka!</p>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-5 text-left text-sm space-y-2">
              <p>✅ Order confirm ho gaya</p><p>📦 Packaging shuru hogi</p>
              <p>🚚 Delivery 2-4 din mein</p><p>💵 Delivery wale ko payment karein</p>
            </div>
            <button onClick={()=>setShowSuccess(false)} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-black transition">Shopping Jaari Rakhein 🛍️</button>
          </div>
        </div>
      )}

      {/* ── AI CHAT ── */}
      <AIChat products={allProducts} onOpenProduct={openProduct} />

    </main>
  );
}