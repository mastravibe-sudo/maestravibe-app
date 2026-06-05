'use client';

import { useState, useEffect, useCallback } from "react";

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

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  image?: string;
}

interface Order {
  _id: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
    city: string;
    area?: string;
    address: string;
  };
  items: OrderItem[];
  total: number;
  status: "new" | "pending" | "completed";
  createdAt: string;
}

interface Subscriber {
  _id: string;
  email: string;
  subscribedAt: string;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: "success" | "error" | "info" }) {
  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-purple-600",
  };
  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] ${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl text-base font-medium flex items-center gap-3 animate-fade-in`}
    >
      {type === "success" && "✅"}
      {type === "error" && "❌"}
      {type === "info" && "💾"}
      {message}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

export default function AdminPanel() {
  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const ADMIN_PASSWORD = "03356935";

  // UI state
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "subscribers">("products");
  const [activeOrderTab, setActiveOrderTab] = useState("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  // Loading states
  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [subscribersLoading, setSubscribersLoading] = useState(false);

  // Product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "fashion",
    description: "",
    colors: [] as string[],
    sizes: [] as string[],
    images: [] as string[],
  });
  const [colorInput, setColorInput] = useState("#000000");
  const [sizeInput, setSizeInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Edit modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // ── Toast helper ─────────────────────────────────────────────────────────────

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  // ── API helpers ───────────────────────────────────────────────────────────────

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProducts(await res.json());
    } catch (err: any) {
      showToast(`Products load failed: ${err.message}`, "error");
    } finally {
      setProductsLoading(false);
    }
  }, [showToast]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setOrders(await res.json());
    } catch (err: any) {
      showToast(`Orders load failed: ${err.message}`, "error");
    } finally {
      setOrdersLoading(false);
    }
  }, [showToast]);

  const loadSubscribers = useCallback(async () => {
    setSubscribersLoading(true);
    try {
      const res = await fetch("/api/subscribers");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubscribers(await res.json());
    } catch (err: any) {
      showToast(`Subscribers load failed: ${err.message}`, "error");
    } finally {
      setSubscribersLoading(false);
    }
  }, [showToast]);

  // Load data after login
  useEffect(() => {
    if (!isLoggedIn) return;
    loadProducts();
    loadOrders();
    loadSubscribers();
  }, [isLoggedIn, loadProducts, loadOrders, loadSubscribers]);

  // ── Auth ──────────────────────────────────────────────────────────────────────

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
    } else {
      showToast("Wrong Password!", "error");
    }
  };

  // ── Image compression ─────────────────────────────────────────────────────────

  const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const compressed: string[] = [];
    for (const file of Array.from(files)) {
      try {
        compressed.push(await compressImage(file));
      } catch {
        showToast(`Image compress failed: ${file.name}`, "error");
      }
    }
    setNewProduct((prev) => ({ ...prev, images: [...prev.images, ...compressed] }));
    setUploading(false);
    e.target.value = "";
  };

  // ── Product CRUD ──────────────────────────────────────────────────────────────

  const addProduct = async () => {
    if (!newProduct.name.trim()) {
      showToast("Product name zaroori hai!", "error");
      return;
    }
    if (!newProduct.price || isNaN(Number(newProduct.price))) {
      showToast("Valid price daalna zaroori hai!", "error");
      return;
    }
    if (newProduct.images.length === 0) {
      showToast("At least 1 image zaroori hai!", "error");
      return;
    }
    if (newProduct.colors.length === 0) {
      showToast("At least one color add karein!", "error");
      return;
    }
    if (newProduct.sizes.length === 0) {
      showToast("At least one size add karein!", "error");
      return;
    }

    setSavingProduct(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name.trim(),
          price: Number(newProduct.price),
          category: newProduct.category,
          description: newProduct.description,
          colors: newProduct.colors,
          sizes: newProduct.sizes,
          images: newProduct.images,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      showToast(`"${newProduct.name}" save ho gaya!`, "success");
      resetNewProduct();
      await loadProducts();
    } catch (err: any) {
      showToast(`Product save failed: ${err.message}`, "error");
    } finally {
      setSavingProduct(false);
    }
  };

  const resetNewProduct = () => {
    setNewProduct({
      name: "", price: "", category: "fashion", description: "",
      colors: [], sizes: [], images: [],
    });
    setColorInput("#000000");
    setSizeInput("");
  };

  const saveEdit = async () => {
    if (!editingProduct) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProduct.name,
          price: Number(editingProduct.price),
          category: editingProduct.category,
          description: editingProduct.description,
          colors: editingProduct.colors,
          sizes: editingProduct.sizes,
          images: editingProduct.images,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      showToast("Product Updated!", "success");
      setEditingProduct(null);
      await loadProducts();
    } catch (err: any) {
      showToast(`Update failed: ${err.message}`, "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Product deleted!", "info");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, "error");
    }
  };

  // ── Order management ──────────────────────────────────────────────────────────

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: status as Order["status"] } : o))
      );
      showToast(`Order marked as ${status}`, "success");
    } catch (err: any) {
      showToast(`Status update failed: ${err.message}`, "error");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setOrders((prev) => prev.filter((o) => o._id !== id));
      showToast("Order deleted", "info");
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, "error");
    }
  };

  // ── Subscriber management ─────────────────────────────────────────────────────

  const deleteSubscriber = async (id: string) => {
    if (!confirm("Delete this subscriber?")) return;
    try {
      const res = await fetch(`/api/subscribers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSubscribers((prev) => prev.filter((s) => s._id !== id));
      showToast("Subscriber deleted", "info");
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, "error");
    }
  };

  // ── Color / size helpers ──────────────────────────────────────────────────────

  const addColor = () => {
    if (!newProduct.colors.includes(colorInput)) {
      setNewProduct((p) => ({ ...p, colors: [...p.colors, colorInput] }));
    }
  };
  const removeColor = (c: string) =>
    setNewProduct((p) => ({ ...p, colors: p.colors.filter((x) => x !== c) }));

  const addSize = () => {
    const s = sizeInput.trim();
    if (s && !newProduct.sizes.includes(s)) {
      setNewProduct((p) => ({ ...p, sizes: [...p.sizes, s] }));
      setSizeInput("");
    }
  };
  const removeSize = (s: string) =>
    setNewProduct((p) => ({ ...p, sizes: p.sizes.filter((x) => x !== s) }));

  // ── Derived ───────────────────────────────────────────────────────────────────

  const getOrderCount = (tab: string) => {
    if (tab === "all") return orders.length;
    if (tab === "new") return orders.filter((o) => !o.status || o.status === "new").length;
    return orders.filter((o) => o.status === tab).length;
  };

  const filteredOrders = orders.filter((order) => {
    if (activeOrderTab === "all") return true;
    if (activeOrderTab === "new") return !order.status || order.status === "new";
    return order.status === activeOrderTab;
  });

  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // ── Login Screen ──────────────────────────────────────────────────────────────

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-8 text-purple-700">🔐 Admin Login</h1>
          <input
            type="password"
            placeholder="Enter Admin Password"
            className="w-full p-5 border border-gray-300 rounded-2xl text-lg mb-6 focus:outline-none focus:border-purple-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-2xl font-bold text-xl transition"
          >
            Login to Admin Panel
          </button>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    );
  }

  // ── Admin Dashboard ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Navbar */}
      <nav className="bg-purple-700 text-white p-5 sticky top-0 z-50 shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">MaestraVibe Admin</h1>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="bg-red-600 px-8 py-3 rounded-xl hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-purple-700">{products.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">Pending Orders</p>
            <p className="text-3xl font-bold text-yellow-500">{getOrderCount("pending")}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">Revenue (Completed)</p>
            <p className="text-2xl font-bold text-green-600">Rs. {totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b pb-4">
          {(["products", "orders", "subscribers"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-medium rounded-t-2xl capitalize transition ${
                activeTab === tab
                  ? "bg-white shadow text-purple-700 border-t border-l border-r"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "products" && "Products"}
              {tab === "orders" && `Orders (${orders.length})`}
              {tab === "subscribers" && `Subscribers (${subscribers.length})`}
            </button>
          ))}
        </div>

        {/* ═══ PRODUCTS TAB ════════════════════════════════════════════════════════ */}
        {activeTab === "products" && (
          <div className="bg-white rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6">Manage Products</h2>

            {/* Add Product Form */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-8 rounded-2xl mb-10">
              <h3 className="text-2xl font-bold text-center mb-6">Add New Product</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  placeholder="Product Name *"
                  className="p-4 border rounded-xl focus:outline-none focus:border-purple-400"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Price (Rs) *"
                  className="p-4 border rounded-xl focus:outline-none focus:border-purple-400"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
                <select
                  className="p-4 border rounded-xl focus:outline-none focus:border-purple-400"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="fashion">Fashion</option>
                  <option value="electronics">Electronics</option>
                  <option value="home">Home & Kitchen</option>
                  <option value="beauty">Beauty</option>
                  <option value="sports">Sports</option>
                </select>

                {/* Images */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Upload Product Images *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-4 border border-dashed border-gray-400 rounded-xl cursor-pointer"
                  />
                  {uploading && (
                    <p className="text-purple-600 mt-2 text-sm">⏳ Uploading images...</p>
                  )}
                  {newProduct.images.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                      {newProduct.images.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            className="w-full h-24 object-cover rounded-xl"
                            alt={`preview-${index}`}
                          />
                          <button
                            onClick={() =>
                              setNewProduct((p) => ({
                                ...p,
                                images: p.images.filter((_, i) => i !== index),
                              }))
                            }
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Colors *</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="w-16 h-12 border rounded-xl cursor-pointer"
                    />
                    <button
                      onClick={addColor}
                      className="px-6 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
                    >
                      Add Color
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {newProduct.colors.map((color, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white border px-4 py-2 rounded-xl">
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm">{color}</span>
                        <button
                          onClick={() => removeColor(color)}
                          className="text-red-500 font-bold ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Sizes *</label>
                  <div className="flex gap-3">
                    <input
                      placeholder="Add custom size"
                      className="flex-1 p-4 border rounded-xl focus:outline-none focus:border-purple-400"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSize()}
                    />
                    <button
                      onClick={addSize}
                      className="px-8 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
                    >
                      Add
                    </button>
                  </div>

                  {/* Suggested sizes */}
                  {newProduct.category === "fashion" && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            if (!newProduct.sizes.includes(s)) {
                              setNewProduct((p) => ({ ...p, sizes: [...p.sizes, s] }));
                            }
                          }}
                          className={`px-3 py-1 text-xs border rounded-lg transition ${
                            newProduct.sizes.includes(s)
                              ? "bg-purple-100 border-purple-400 text-purple-700"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    {newProduct.sizes.map((size, i) => (
                      <div key={i} className="bg-white border px-5 py-2 rounded-xl flex items-center gap-2">
                        <span className="text-sm font-medium">{size}</span>
                        <button
                          onClick={() => removeSize(size)}
                          className="text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <textarea
                  placeholder="Description"
                  className="p-4 border rounded-xl md:col-span-2 focus:outline-none focus:border-purple-400"
                  rows={4}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={addProduct}
                  disabled={savingProduct}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-4 rounded-2xl font-bold text-lg transition"
                >
                  {savingProduct ? "⏳ Saving..." : "💾 Save & Add Product"}
                </button>
                <button
                  onClick={resetNewProduct}
                  className="px-8 bg-gray-200 hover:bg-gray-300 rounded-2xl font-bold transition"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Products List */}
            <h3 className="text-xl font-bold mb-6">All Products ({products.length})</h3>

            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="border rounded-2xl p-6">
                    <Skeleton className="w-full h-48 mb-4" />
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-center py-20 text-gray-500 text-xl">No products added yet...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="border rounded-2xl p-6 bg-white shadow-sm">
                    <img
                      src={product.images?.[0] || "https://via.placeholder.com/400"}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                      alt={product.name}
                    />
                    <h4 className="font-bold text-lg line-clamp-2">{product.name}</h4>
                    <p className="text-purple-600 font-semibold">Rs. {product.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 capitalize mb-1">{product.category}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-5 h-5 rounded-full border border-gray-300 inline-block"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={() => setEditingProduct({ ...product })}
                        className="flex-1 py-2.5 bg-yellow-500 text-white rounded-xl text-sm font-medium hover:bg-yellow-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ ORDERS TAB ══════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Orders Management</h2>
              <button
                onClick={loadOrders}
                className="px-6 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-medium transition"
              >
                🔄 Refresh
              </button>
            </div>

            {/* Order filter tabs */}
            <div className="flex gap-3 mb-8 border-b pb-4 flex-wrap">
              {["all", "new", "pending", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveOrderTab(tab)}
                  className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition ${
                    activeOrderTab === tab
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {tab === "all" ? "All Orders" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      activeOrderTab === tab
                        ? "bg-white text-purple-600"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {getOrderCount(tab)}
                  </span>
                </button>
              ))}
            </div>

            {ordersLoading ? (
              <div className="space-y-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-2xl p-6">
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <p className="text-center py-20 text-gray-500 text-xl">Koi orders nahi hain...</p>
            ) : (
              <div className="space-y-5">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="border rounded-2xl overflow-hidden shadow-sm">
                    {/* Order header */}
                    <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-3 border-b">
                      <div>
                        <span className="font-bold text-lg">Order #{order._id.slice(-6).toUpperCase()}</span>
                        <span className="ml-4 text-gray-500 text-sm">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.status
                            ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                            : "New"}
                        </span>
                        <span className="font-bold text-purple-700 text-lg">
                          Rs. {order.total?.toLocaleString() || "—"}
                        </span>
                      </div>
                    </div>

                    {/* Order body */}
                    <div className="p-6 grid md:grid-cols-2 gap-6">
                      {/* Customer */}
                      <div className="bg-blue-50 rounded-2xl p-5">
                        <h4 className="font-bold text-blue-800 mb-4 text-base">👤 Customer Details</h4>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex gap-2">
                            <span className="text-gray-500 w-20 shrink-0">Name:</span>
                            <span className="font-semibold">{order.customer?.name || "—"}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-500 w-20 shrink-0">Email:</span>
                            <span className="font-semibold break-all">{order.customer?.email || "—"}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-500 w-20 shrink-0">Phone:</span>
                            <a
                              href={`tel:${order.customer?.phone}`}
                              className="font-semibold text-blue-600 hover:underline"
                            >
                              {order.customer?.phone || "—"}
                            </a>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-500 w-20 shrink-0">City:</span>
                            <span className="font-semibold">{order.customer?.city || "—"}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-500 w-20 shrink-0">Area:</span>
                            <span className="font-semibold">{order.customer?.area || "—"}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-500 w-20 shrink-0">Address:</span>
                            <span className="font-semibold">{order.customer?.address || "—"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h4 className="font-bold text-gray-700 mb-4 text-base">🛍️ Ordered Items</h4>
                        <div className="space-y-3">
                          {order.items?.map((item, i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-xl">
                              <p className="font-semibold text-sm">{item.name}</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                                <span className="text-xs text-gray-500">
                                  Color:{" "}
                                  <strong
                                    className="inline-block w-3 h-3 rounded-full border align-middle mx-0.5"
                                    style={{ backgroundColor: item.selectedColor }}
                                  />
                                </span>
                                <span className="text-xs text-gray-500">
                                  Size: <strong>{item.selectedSize}</strong>
                                </span>
                                <span className="text-xs text-gray-500">
                                  Qty: <strong>{item.quantity || 1}</strong>
                                </span>
                              </div>
                              <p className="font-bold text-purple-700 text-sm mt-1">
                                Rs. {(item.price * (item.quantity || 1)).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 pb-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => updateOrderStatus(order._id, "pending")}
                        className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition"
                      >
                        🕐 Mark Pending
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order._id, "completed")}
                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition"
                      >
                        ✅ Mark Completed
                      </button>
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="py-3 px-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-medium transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ SUBSCRIBERS TAB ═════════════════════════════════════════════════════ */}
        {activeTab === "subscribers" && (
          <div className="bg-white rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Newsletter Subscribers</h2>
              <button
                onClick={loadSubscribers}
                className="px-6 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-medium transition"
              >
                🔄 Refresh
              </button>
            </div>

            <div className="mb-6 p-5 bg-blue-50 rounded-2xl">
              <p className="text-3xl font-bold text-blue-700">{subscribers.length}</p>
              <p className="text-gray-600">Total Subscribers</p>
            </div>

            {subscribersLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : subscribers.length === 0 ? (
              <p className="text-center py-20 text-gray-500 text-xl">No subscribers yet.</p>
            ) : (
              <div className="space-y-4">
                {subscribers.map((sub) => (
                  <div
                    key={sub._id}
                    className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl"
                  >
                    <div>
                      <p className="font-medium">{sub.email}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteSubscriber(sub._id)}
                      className="text-red-600 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-xl transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Edit Product Modal ─────────────────────────────────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Edit Product</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-3xl text-gray-400 hover:text-black"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="p-4 border rounded-xl focus:outline-none focus:border-purple-400"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                placeholder="Name"
              />
              <input
                type="number"
                className="p-4 border rounded-xl focus:outline-none focus:border-purple-400"
                value={editingProduct.price}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                }
                placeholder="Price"
              />
              <select
                className="p-4 border rounded-xl focus:outline-none focus:border-purple-400"
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
              >
                <option value="fashion">Fashion</option>
                <option value="electronics">Electronics</option>
                <option value="home">Home & Kitchen</option>
                <option value="beauty">Beauty</option>
                <option value="sports">Sports</option>
              </select>
              <textarea
                className="p-4 border rounded-xl md:col-span-2 focus:outline-none focus:border-purple-400"
                rows={4}
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, description: e.target.value })
                }
                placeholder="Description"
              />
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="flex-1 bg-green-600 disabled:bg-green-400 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition"
              >
                {savingEdit ? "⏳ Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 bg-gray-500 text-white py-4 rounded-2xl font-bold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}