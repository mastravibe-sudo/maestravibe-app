'use client';

import { useState, useEffect, useCallback } from "react";

// Toast Component
function Toast({ message, type }: { message: string; type: "success" | "error" | "info" }) {
  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-purple-600",
  };
  return (
    <div className={`fixed bottom-6 right-6 z-[200] ${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl text-base font-medium flex items-center gap-3`}>
      {type === "success" && "✅"} {type === "error" && "❌"} {type === "info" && "💾"}
      {message}
    </div>
  );
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "subscribers">("products");
  const [activeOrderTab, setActiveOrderTab] = useState("all");

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const ADMIN_PASSWORD = "03356935";

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "fashion",
    description: "",
    colors: [] as string[],
    sizes: [] as string[],
    images: [] as string[]
  });

  const [colorInput, setColorInput] = useState("#000000");
  const [sizeInput, setSizeInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Load Data
  useEffect(() => {
    const savedProducts = localStorage.getItem("products");
    const savedOrders = localStorage.getItem("orders");
    const savedSubscribers = localStorage.getItem("subscribers");

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedSubscribers) setSubscribers(JSON.parse(savedSubscribers));

    const savedDraft = localStorage.getItem("newProductDraft");
    if (savedDraft) setNewProduct(JSON.parse(savedDraft));
  }, []);

  // Auto Save Draft
  useEffect(() => {
    if (newProduct.name || newProduct.price || newProduct.images.length > 0) {
      localStorage.setItem("newProductDraft", JSON.stringify(newProduct));
      setDraftSaved(true);
      const timer = setTimeout(() => setDraftSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [newProduct]);

  const saveProducts = (newProducts: any[]) => {
    setProducts(newProducts);
    localStorage.setItem("products", JSON.stringify(newProducts));
  };

  const saveOrders = (newOrders: any[]) => {
    setOrders(newOrders);
    localStorage.setItem("orders", JSON.stringify(newOrders));
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
    } else {
      showToast("Wrong Password!", "error");
    }
  };

  // Compress Image
  const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const compressed: string[] = [];

    for (let file of Array.from(files)) {
      try {
        const base64 = await compressImage(file);
        compressed.push(base64);
      } catch {}
    }
    setNewProduct(prev => ({ ...prev, images: [...prev.images, ...compressed] }));
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addColor = () => {
    if (!newProduct.colors.includes(colorInput)) {
      setNewProduct({ ...newProduct, colors: [...newProduct.colors, colorInput] });
    }
  };

  const removeColor = (color: string) => {
    setNewProduct({ ...newProduct, colors: newProduct.colors.filter(c => c !== color) });
  };

  const addSize = () => {
    if (sizeInput.trim() && !newProduct.sizes.includes(sizeInput.trim())) {
      setNewProduct({ ...newProduct, sizes: [...newProduct.sizes, sizeInput.trim()] });
      setSizeInput("");
    }
  };

  const removeSize = (size: string) => {
    setNewProduct({ ...newProduct, sizes: newProduct.sizes.filter(s => s !== size) });
  };

  const getSuggestedSizes = (category: string) => {
    if (category === "fashion") return ["XS", "S", "M", "L", "XL", "XXL"];
    return ["Standard"];
  };

  const addSuggestedSize = (size: string) => {
    if (!newProduct.sizes.includes(size)) {
      setNewProduct(p => ({ ...p, sizes: [...p.sizes, size] }));
    }
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price || newProduct.images.length === 0) {
      showToast("Name, Price aur atleast 1 image zaroori hai!", "error");
      return;
    }
    if (newProduct.colors.length === 0) { showToast("At least one color add karein!", "error"); return; }
    if (newProduct.sizes.length === 0) { showToast("At least one size add karein!", "error"); return; }

    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category,
      description: newProduct.description || "No description provided",
      colors: newProduct.colors,
      sizes: newProduct.sizes,
      images: newProduct.images
    };

    saveProducts([...products, product]);
    resetNewProduct();
    showToast(`"${product.name}" save ho gaya!`, "success");
  };

  const resetNewProduct = () => {
    setNewProduct({ name: "", price: "", category: "fashion", description: "", colors: [], sizes: [], images: [] });
    setColorInput("#000000");
    setSizeInput("");
  };

  const startEdit = (product: any) => {
    setEditingProduct({ ...product });
  };

  const saveEdit = () => {
    if (!editingProduct) return;
    const updated = products.map(p => p.id === editingProduct.id ? { ...editingProduct, price: Number(editingProduct.price) } : p);
    saveProducts(updated);
    setEditingProduct(null);
    showToast("Product Updated!", "success");
  };

  const deleteProduct = (id: number) => {
    if (confirm("Delete this product?")) {
      saveProducts(products.filter(p => p.id !== id));
    }
  };

  const updateOrderStatus = (orderId: number, status: string) => {
    saveOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    showToast(`Order marked as ${status}`, "success");
  };

  const deleteOrder = (orderId: number) => {
    if (confirm("Delete this order?")) {
      saveOrders(orders.filter(o => o.id !== orderId));
    }
  };

  const getOrderCount = (tab: string) => {
    if (tab === "all") return orders.length;
    if (tab === "new") return orders.filter(o => !o.status || o.status === "new").length;
    return orders.filter(o => o.status === tab).length;
  };

  const filteredOrders = orders.filter(order => {
    if (activeOrderTab === "all") return true;
    if (activeOrderTab === "new") return !order.status || order.status === "new";
    return order.status === activeOrderTab;
  });

  const totalRevenue = orders.filter(o => o.status === "completed").reduce((sum, o) => sum + (o.total || 0), 0);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-8 text-purple-700">🔐 Admin Login</h1>
          <input type="password" placeholder="Enter Admin Password" className="w-full p-5 border border-gray-300 rounded-2xl text-lg mb-6" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-2xl font-bold text-xl">Login to Admin Panel</button>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <nav className="bg-purple-700 text-white p-5 sticky top-0 z-50 shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">MaestraVibe Admin</h1>
          <button onClick={() => setIsLoggedIn(false)} className="bg-red-600 px-8 py-3 rounded-xl hover:bg-red-700">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Row */}
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
          {["products", "orders", "subscribers"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-4 font-medium rounded-t-2xl capitalize ${activeTab === tab ? "bg-white shadow text-purple-700 border-t border-l border-r" : "text-gray-600 hover:bg-gray-200"}`}
            >
              {tab === "products" && "Products"}
              {tab === "orders" && `Orders (${orders.length})`}
              {tab === "subscribers" && `Subscribers (${subscribers.length})`}
            </button>
          ))}
        </div>

        {/* PRODUCTS TAB - Full Original */}
        {activeTab === "products" && (
          <div className="bg-white rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6">Manage Products</h2>
            {/* Add New Product Form */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-8 rounded-2xl mb-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-center flex-1">Add New Product</h3>
                {draftSaved && <span className="text-green-600">💾 Draft Saved</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input placeholder="Product Name *" className="p-4 border rounded-xl" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                <input type="number" placeholder="Price (Rs) *" className="p-4 border rounded-xl" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                <select className="p-4 border rounded-xl" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                  <option value="fashion">Fashion</option>
                  <option value="electronics">Electronics</option>
                  <option value="home">Home & Kitchen</option>
                  <option value="beauty">Beauty</option>
                  <option value="sports">Sports</option>
                </select>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Upload Product Images</label>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="w-full p-4 border border-dashed border-gray-400 rounded-xl cursor-pointer" />
                  {uploading && <p className="text-purple-600 mt-2">Uploading...</p>}
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                    {newProduct.images.map((img, index) => (
                      <div key={index} className="relative">
                        <img src={img} className="w-full h-24 object-cover rounded-xl" alt="preview" />
                        <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Colors</label>
                  <div className="flex gap-3">
                    <input type="color" value={colorInput} onChange={(e) => setColorInput(e.target.value)} className="w-16 h-12 border rounded-xl cursor-pointer" />
                    <button onClick={addColor} className="px-6 bg-purple-600 text-white rounded-xl">Add Color</button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {newProduct.colors.map((color, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white border px-4 py-2 rounded-xl">
                        <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: color }}></div>
                        <span>{color}</span>
                        <button onClick={() => removeColor(color)} className="text-red-500 font-bold ml-2">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Sizes</label>
                  <div className="flex gap-3">
                    <input placeholder="Add custom size" className="flex-1 p-4 border rounded-xl" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addSize()} />
                    <button onClick={addSize} className="px-8 bg-purple-600 text-white rounded-xl">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {newProduct.sizes.map((size, i) => (
                      <div key={i} className="bg-white border px-5 py-2 rounded-xl flex items-center gap-2">
                        {size}
                        <button onClick={() => removeSize(size)} className="text-red-500 ml-2">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                <textarea placeholder="Description" className="p-4 border rounded-xl md:col-span-2" rows={4} value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
              </div>

              <button onClick={addProduct} className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg">💾 Save & Add Product</button>
            </div>

            <h3 className="text-xl font-bold mb-6">All Products ({products.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length === 0 ? (
                <p className="col-span-3 text-center py-20 text-gray-500 text-xl">No products added yet...</p>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="border rounded-2xl p-6 bg-white shadow-sm">
                    <img src={product.images?.[0] || "https://via.placeholder.com/400"} className="w-full h-48 object-cover rounded-xl mb-4" alt={product.name} />
                    <h4 className="font-bold text-lg">{product.name}</h4>
                    <p className="text-purple-600 font-semibold">Rs. {product.price}</p>
                    <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                    <div className="mt-4 flex gap-3">
                      <button onClick={() => startEdit(product)} className="flex-1 py-2.5 bg-yellow-500 text-white rounded-xl text-sm font-medium">Edit</button>
                      <button onClick={() => deleteProduct(product.id)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB - Full Original */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6">Orders Management</h2>

            <div className="flex gap-3 mb-8 border-b pb-4 flex-wrap">
              {["all", "new", "pending", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveOrderTab(tab)}
                  className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition ${activeOrderTab === tab ? "bg-purple-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                >
                  {tab === "all" ? "All Orders" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeOrderTab === tab ? 'bg-white text-purple-600' : 'bg-gray-300 text-gray-700'}`}>
                    {getOrderCount(tab)}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-5">
              {filteredOrders.length === 0 ? (
                <p className="text-center py-20 text-gray-500 text-xl">Koi orders nahi hain...</p>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-3 border-b">
                      <div>
                        <span className="font-bold text-lg">Order #{order.id}</span>
                        <span className="ml-4 text-gray-500 text-sm">{order.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${order.status === "completed" ? "bg-green-100 text-green-700" : order.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "New"}
                        </span>
                        <span className="font-bold text-purple-700 text-lg">Rs. {order.total?.toLocaleString() || "—"}</span>
                      </div>
                    </div>

                    <div className="p-6 grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-2xl p-5">
                        <h4 className="font-bold text-blue-800 mb-4 text-base">👤 Customer Details</h4>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Name:</span><span className="font-semibold">{order.customer?.name || "—"}</span></div>
                          <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Email:</span><span className="font-semibold break-all">{order.customer?.email || "—"}</span></div>
                          <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Phone:</span><a href={`tel:${order.customer?.phone}`} className="font-semibold text-blue-600 hover:underline">{order.customer?.phone || "—"}</a></div>
                          <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">City:</span><span className="font-semibold">{order.customer?.city || "—"}</span></div>
                          <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Address:</span><span className="font-semibold">{order.customer?.address || "—"}</span></div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-700 mb-4 text-base">🛍️ Ordered Items</h4>
                        <div className="space-y-3">
                          {order.items?.map((item: any, i: number) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-xl flex gap-3 items-start">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{item.name}</p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                                  <span className="text-xs text-gray-500">Color: <strong>{item.selectedColor}</strong></span>
                                  <span className="text-xs text-gray-500">Size: <strong>{item.selectedSize}</strong></span>
                                  <span className="text-xs text-gray-500">Qty: <strong>{item.quantity || 1}</strong></span>
                                </div>
                              </div>
                              <p className="font-bold text-purple-700 whitespace-nowrap text-sm">Rs. {(item.price * (item.quantity || 1)).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 flex flex-wrap gap-3">
                      <button onClick={() => updateOrderStatus(order.id, "pending")} className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium">🕐 Mark Pending</button>
                      <button onClick={() => updateOrderStatus(order.id, "completed")} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium">✅ Mark Completed</button>
                      <button onClick={() => deleteOrder(order.id)} className="py-3 px-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-medium">🗑️ Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SUBSCRIBERS TAB */}
        {activeTab === "subscribers" && (
          <div className="bg-white rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6">Newsletter Subscribers</h2>
            <div className="mb-6 p-5 bg-blue-50 rounded-2xl">
              <p className="text-3xl font-bold text-blue-700">{subscribers.length}</p>
              <p className="text-gray-600">Total Subscribers</p>
            </div>
            {subscribers.length === 0 ? (
              <p className="text-center py-20 text-gray-500 text-xl">No subscribers yet.</p>
            ) : (
              <div className="space-y-4">
                {subscribers.map((sub, index) => (
                  <div key={index} className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-medium">{sub.email}</p>
                      <p className="text-sm text-gray-500">{new Date(sub.subscribedAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => {
                      if (confirm("Delete this subscriber?")) {
                        const updated = subscribers.filter((_, i) => i !== index);
                        setSubscribers(updated);
                        localStorage.setItem("subscribers", JSON.stringify(updated));
                        showToast("Subscriber deleted", "info");
                      }
                    }} className="text-red-600 hover:text-red-700">Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h2 className="text-3xl font-bold mb-6">Edit Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="p-4 border rounded-xl" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} placeholder="Name" />
              <input type="number" className="p-4 border rounded-xl" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} placeholder="Price" />
              <select className="p-4 border rounded-xl" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                <option value="fashion">Fashion</option>
                <option value="electronics">Electronics</option>
                <option value="home">Home & Kitchen</option>
                <option value="beauty">Beauty</option>
                <option value="sports">Sports</option>
              </select>
              <textarea className="p-4 border rounded-xl md:col-span-2" rows={4} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} placeholder="Description" />
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={saveEdit} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold">Save Changes</button>
              <button onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-500 text-white py-4 rounded-2xl font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}