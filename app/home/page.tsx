'use client';

import { useEffect, useState, useCallback } from "react";

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
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  area: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function playSuccessSound() {
  try {
    const audio = new Audio("/sound/mixkit-happy-bells-notification-937.wav");
    audio.volume = 0.85;
    audio.play().catch(() => {});
  } catch {}
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  // Slider
  const [currentSlide, setCurrentSlide] = useState(0);

  // Products / filters
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  // Product detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Checkout
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [checkoutProduct, setCheckoutProduct] = useState<CartItem | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // Success
  const [showSuccess, setShowSuccess] = useState(false);

  // Customer form
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "", email: "", phone: "", address: "", city: "", area: "",
  });

  // ── Slider data ──────────────────────────────────────────────────────────────
  const slides = [
    { id: 1, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop", title: "Premium Electronics" },
    { id: 2, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop", title: "Trending Fashion" },
    { id: 3, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop", title: "Modern Lifestyle" },
  ];

  const categories = [
    { name: "All", value: "all" },
    { name: "Electronics", value: "electronics" },
    { name: "Fashion", value: "fashion" },
    { name: "Home & Kitchen", value: "home" },
    { name: "Beauty", value: "beauty" },
    { name: "Sports", value: "sports" },
  ];

  // ── Effects ──────────────────────────────────────────────────────────────────

  // Auto-rotate slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load products from MongoDB API
  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Product[] = await res.json();
      setAllProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ── Derived ───────────────────────────────────────────────────────────────────

  const filteredProducts =
    activeCategory === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory);

  const checkoutItems: CartItem[] = checkoutProduct ? [checkoutProduct] : cart;
  const orderTotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors?.[0] || "");
    setSelectedSize(product.sizes?.[0] || "Standard");
    setSelectedImageIndex(0);
  };

  const addToCart = (product: Product) => {
    const item: CartItem = {
      ...product,
      selectedColor: selectedColor || product.colors?.[0] || "",
      selectedSize: selectedSize || product.sizes?.[0] || "Standard",
      quantity: 1,
    };
    setCart((prev) => [...prev, item]);
    setSelectedProduct(null);
    alert(`✅ ${product.name} cart mein add ho gaya!`);
  };

  const handleBuyNow = (product: Product) => {
    const item: CartItem = {
      ...product,
      selectedColor: selectedColor || product.colors?.[0] || "",
      selectedSize: selectedSize || product.sizes?.[0] || "Standard",
      quantity: 1,
    };
    setCheckoutProduct(item);
    setSelectedProduct(null);
    setCheckoutStep(1);
    setShowCheckout(true);
  };

  const openCartCheckout = () => {
    setCheckoutProduct(null);
    setCheckoutStep(1);
    setShowCart(false);
    setShowCheckout(true);
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Aapka browser location support nahi karta.");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.address;

          const city =
            addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
          const area =
            addr.neighbourhood || addr.suburb || addr.quarter || addr.road || "";
          const fullAddress = [addr.road, addr.neighbourhood || addr.suburb, addr.city || addr.town || addr.village]
            .filter(Boolean)
            .join(", ");

          setCustomerInfo((prev) => ({ ...prev, city, area, address: fullAddress || prev.address }));
          alert("✅ Location detect ho gayi!");
        } catch {
          alert("Location detect nahi ho saka. Please manually fill karein.");
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === 1) {
          alert("Location permission deny ki gayi. Browser settings mein allow karein.");
        } else {
          alert("Location detect nahi ho saka. Manual fill karein.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);

    try {
      const orderPayload = {
        customer: customerInfo,
        items: checkoutItems.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          image: item.images?.[0] || "",
        })),
        total: orderTotal,
        status: "new",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Order failed");
      }

      playSuccessSound();
      setShowCheckout(false);
      setCheckoutProduct(null);
      setCart([]);
      setCustomerInfo({ name: "", email: "", phone: "", address: "", city: "", area: "" });
      setShowSuccess(true);
    } catch (err: any) {
      alert(`❌ Order place karne mein masla: ${err.message}`);
    } finally {
      setOrderLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <main className="bg-white text-gray-900 min-h-screen">

      {/* ── HEADER ──────────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-purple-600">MAESTRA VIBE</h1>
          <div className="flex items-center gap-5">
            <a href="https://wa.me/923274050806" target="_blank" rel="noreferrer" className="text-2xl hover:scale-110 transition">💬</a>
            <a href="tel:+923274050806" className="text-2xl hover:scale-110 transition">📞</a>
            <button onClick={() => setShowCart(true)} className="relative text-2xl hover:text-purple-600 transition">
              🛒
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── SLIDER ──────────────────────────────────────────────────────────────── */}
      <section className="relative w-full h-64 md:h-96 overflow-hidden">
        <img
          src={slides[currentSlide].image}
          alt="slider"
          className="w-full h-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-white text-4xl md:text-6xl font-bold text-center px-4">MAESTRA VIBE</h1>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition ${currentSlide === i ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────────────────────────── */}
      <section className="py-4 bg-gray-50 border-b sticky top-[60px] z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.value
                    ? "bg-purple-600 text-white"
                    : "bg-white border hover:bg-gray-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS GRID ───────────────────────────────────────────────────────── */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-purple-700">
            {activeCategory === "all"
              ? "Featured Products"
              : categories.find((c) => c.value === activeCategory)?.name}
          </h2>

          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-44 bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center py-20 text-gray-400 text-lg">Koi product nahi mila...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                >
                  <div
                    onClick={() => openProduct(product)}
                    className="overflow-hidden cursor-pointer relative"
                  >
                    <img
                      src={product.images?.[0] || "https://via.placeholder.com/400"}
                      className="h-44 w-full object-cover group-hover:scale-105 transition-all duration-300"
                      alt={product.name}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-purple-600 font-bold text-base">Rs. {product.price.toLocaleString()}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => openProduct(product)}
                        className="flex-1 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openProduct(product)}
                        className="flex-1 py-2 text-xs bg-black text-white hover:bg-gray-800 rounded-xl font-medium transition"
                      >
                        Add Cart
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedColor(product.colors?.[0] || "");
                        setSelectedSize(product.sizes?.[0] || "Standard");
                        handleBuyNow(product);
                      }}
                      className="w-full mt-2 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUCT DETAIL MODAL ────────────────────────────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-4xl rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[95vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row">
              {/* Images */}
              <div className="md:w-1/2 p-5 bg-gray-50">
                <img
                  src={selectedProduct.images?.[selectedImageIndex] || "https://via.placeholder.com/600"}
                  className="w-full rounded-2xl shadow object-cover max-h-72 md:max-h-96"
                  alt={selectedProduct.name}
                />
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {selectedProduct.images?.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`cursor-pointer rounded-xl border-2 h-16 w-16 object-cover shrink-0 transition ${
                        selectedImageIndex === index ? "border-purple-600" : "border-transparent"
                      }`}
                      alt={`thumb-${index}`}
                    />
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="md:w-1/2 p-5 md:p-8">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs uppercase text-gray-400 font-medium capitalize">
                      {selectedProduct.category}
                    </span>
                    <h1 className="text-xl md:text-2xl font-bold mt-1">{selectedProduct.name}</h1>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-3xl text-gray-400 hover:text-black leading-none"
                  >
                    ×
                  </button>
                </div>

                <p className="text-3xl font-bold text-purple-600 mb-4">
                  Rs. {selectedProduct.price.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm mb-5 whitespace-pre-line">
                  {selectedProduct.description}
                </p>

                {/* Colors */}
                {selectedProduct.colors?.length > 0 && (
                  <div className="mb-5">
                    <p className="font-semibold text-sm mb-2">Color</p>
                    <div className="flex gap-3 flex-wrap">
                      {selectedProduct.colors.map((color, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedColor(color)}
                          title={color}
                          className={`w-10 h-10 rounded-full border-4 transition ${
                            selectedColor === color
                              ? "border-purple-600 scale-110"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {selectedProduct.sizes?.length > 0 && (
                  <div className="mb-6">
                    <p className="font-semibold text-sm mb-2">Size</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedProduct.sizes.map((size, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 border rounded-xl text-sm font-medium transition ${
                            selectedSize === size
                              ? "bg-purple-600 text-white border-purple-600"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => addToCart(selectedProduct)}
                    className="flex-1 py-3.5 bg-black text-white rounded-2xl font-semibold text-sm"
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    onClick={() => handleBuyNow(selectedProduct)}
                    className="flex-1 py-3.5 bg-purple-600 text-white rounded-2xl font-semibold text-sm"
                  >
                    ⚡ Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CART SIDEBAR ────────────────────────────────────────────────────────── */}
      {showCart && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col">
            <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Cart ({cart.length} items)</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-3xl text-gray-400 hover:text-black"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <p className="text-center py-20 text-gray-400">Cart khali hai</p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="flex gap-3 border rounded-2xl p-3">
                    <img
                      src={item.images?.[0]}
                      className="w-20 h-20 object-cover rounded-xl shrink-0"
                      alt={item.name}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-2">{item.name}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className="w-4 h-4 rounded-full border inline-block shrink-0"
                          style={{ backgroundColor: item.selectedColor }}
                        />
                        <span className="text-xs text-gray-500">{item.selectedSize}</span>
                      </div>
                      <p className="font-bold text-purple-600 text-sm mt-1">
                        Rs. {(item.price * (item.quantity || 1)).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}
                          className="w-7 h-7 border rounded-lg text-sm font-bold"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}
                          className="w-7 h-7 border rounded-lg text-sm font-bold"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-red-400 text-xs ml-2 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t bg-white">
                <div className="flex justify-between mb-4 font-bold text-lg">
                  <span>Total</span>
                  <span className="text-purple-700">
                    Rs.{" "}
                    {cart
                      .reduce((s, i) => s + i.price * (i.quantity || 1), 0)
                      .toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={openCartCheckout}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-bold transition"
                >
                  Checkout →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CHECKOUT MODAL ──────────────────────────────────────────────────────── */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl max-h-[96vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    checkoutStep === 2
                      ? setCheckoutStep(1)
                      : (setShowCheckout(false), setCheckoutProduct(null))
                  }
                  className="text-2xl text-gray-400 hover:text-black"
                >
                  ←
                </button>
                <div>
                  <h2 className="text-lg font-bold">
                    {checkoutStep === 1 ? "Order Review" : "Delivery Details"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-1.5 w-12 rounded-full ${checkoutStep >= 1 ? "bg-purple-600" : "bg-gray-200"}`} />
                    <div className={`h-1.5 w-12 rounded-full ${checkoutStep >= 2 ? "bg-purple-600" : "bg-gray-200"}`} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setShowCheckout(false); setCheckoutProduct(null); }}
                className="text-2xl text-gray-400"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              {/* Step 1: Order Review */}
              {checkoutStep === 1 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-4">Aapka Order</h3>
                  <div className="space-y-3 mb-6">
                    {checkoutItems.map((item, i) => (
                      <div key={i} className="flex gap-4 bg-gray-50 rounded-2xl p-4 items-center">
                        <img
                          src={item.images?.[0] || "https://via.placeholder.com/100"}
                          className="w-20 h-20 object-cover rounded-xl shrink-0"
                          alt={item.name}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                          <div className="flex flex-wrap gap-x-3 mt-1.5">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <span
                                className="w-3.5 h-3.5 rounded-full border inline-block"
                                style={{ backgroundColor: item.selectedColor }}
                              />
                              {item.selectedColor}
                            </span>
                            <span className="text-xs text-gray-500">
                              Size: <strong>{item.selectedSize}</strong>
                            </span>
                            <span className="text-xs text-gray-500">
                              Qty: <strong>{item.quantity || 1}</strong>
                            </span>
                          </div>
                          <p className="font-bold text-purple-600 mt-1">
                            Rs. {(item.price * (item.quantity || 1)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-purple-50 rounded-2xl p-4 flex justify-between items-center mb-6">
                    <span className="font-bold">Total Amount</span>
                    <span className="font-bold text-purple-700 text-xl">
                      Rs. {orderTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 text-sm text-yellow-800">
                    💵 <strong>Cash on Delivery</strong> — delivery ke waqt payment karein
                  </div>

                  <button
                    onClick={() => setCheckoutStep(2)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-bold text-lg transition"
                  >
                    Delivery Details Bharein →
                  </button>
                </div>
              )}

              {/* Step 2: Customer Details */}
              {checkoutStep === 2 && (
                <form onSubmit={submitOrder}>
                  {/* GPS */}
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locationLoading}
                    className="w-full mb-6 py-3.5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60"
                  >
                    {locationLoading ? (
                      <><span className="animate-spin">⏳</span> Location detect ho raha hai...</>
                    ) : (
                      <>📍 Apni Location Auto-Detect Karein</>
                    )}
                  </button>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5 text-gray-700">Full Name *</label>
                      <input
                        type="text"
                        placeholder="Apna poora naam likhein"
                        required
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none text-base"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1.5 text-gray-700">Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="03XX-XXXXXXX"
                        required
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none text-base"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                        Email <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none text-base"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1.5 text-gray-700">City *</label>
                      <input
                        type="text"
                        placeholder="Maslan: Karachi, Lahore, Islamabad"
                        required
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none text-base"
                        value={customerInfo.city}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1.5 text-gray-700">Area / Sector *</label>
                      <input
                        type="text"
                        placeholder="Maslan: Gulshan, DHA, F-10"
                        required
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none text-base"
                        value={customerInfo.area}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, area: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1.5 text-gray-700">Full Address *</label>
                      <textarea
                        placeholder="Ghar/flat number, gali, mohalla, landmark..."
                        required
                        rows={3}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none text-base resize-none"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-5 bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">{checkoutItems.length} item(s)</span>
                    <span className="font-bold text-purple-700">Rs. {orderTotal.toLocaleString()}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={orderLoading}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-4 rounded-2xl font-bold text-lg transition"
                  >
                    {orderLoading ? "⏳ Processing..." : "✅ Order Place Karein"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS SCREEN ──────────────────────────────────────────────────────── */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/90 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center">
            <div className="text-7xl mb-5">🎉</div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Order Ho Gaya!</h1>
            <p className="text-gray-600 mb-6">
              Shukriya MaestraVibe choose karne ka. Jald hi delivery ho gi!
            </p>
            <div className="bg-green-50 rounded-2xl p-5 mb-6 text-left text-sm space-y-1">
              <p>✅ Order confirm ho gaya</p>
              <p>📦 Packaging shuru hogi</p>
              <p>🚚 Delivery 2-4 din mein</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold"
            >
              Shopping Jaari Rakhein
            </button>
          </div>
        </div>
      )}
    </main>
  );
}