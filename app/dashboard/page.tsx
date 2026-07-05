'use client';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Product = {
  id: string; name: string; price: number; category: string; description?: string;
  images: string[]; colors: string[]; sizes: string[];
};

type OrderItem = {
  productId: string; name: string; image: string; basePrice: number;
  resellerPrice: number; quantity: number; selectedColor?: string; selectedSize?: string;
};

type Tab = 'browse' | 'orders' | 'social' | 'profile';

const CATEGORIES = ['All', 'Women', 'Men', 'Kids', 'Kurta & Shalwar', 'Dress', 'Tops', 'Jeans & Pants', 'Shoes', 'Bags', 'Jewelry', 'Accessories'];

function Ico({ d, cls = 'w-5 h-5' }: { d: string; cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}
const BrowseIco  = () => <Ico d="M4 6h16M4 12h16M4 18h7" />;
const OrdersIco   = () => <Ico d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />;
const SocialIco   = () => <Ico d="M18 8a3 3 0 10-2.83-4H15a3 3 0 000 6h.17A3 3 0 0018 8zM6 15a3 3 0 100 2.83V17.8a3 3 0 000-1.6zM18 16a3 3 0 10-2.83 4H15a3 3 0 000-6h.17A3 3 0 0018 16zM8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" />;
const ProfileIco  = () => <Ico d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
const LogoutIco   = () => <Ico d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />;
const SearchIco   = () => <Ico cls="w-4 h-4" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />;
const DownloadIco = () => <Ico cls="w-4 h-4" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 12V6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" />;
const CloseIco    = () => <Ico d="M6 18L18 6M6 6l12 12" />;
const CameraIco   = () => <Ico cls="w-4 h-4" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />;

export default function ResellerDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('browse');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [error, setError] = useState('');
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'new' | 'pending' | 'completed' | 'delivered'>('all');
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', city: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    fetch('/api/reseller/products')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); else setError(data.message || 'Failed to load'); })
      .catch(() => setError('Failed to load products'));
  }, []);

  const loadOrders = useCallback(() => {
    fetch('/api/reseller/orders').then(r => r.json()).then(data => { if (Array.isArray(data)) setOrders(data); });
  }, []);
  useEffect(() => { if (tab === 'orders') loadOrders(); }, [tab, loadOrders]);

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  let filtered = products.filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)) &&
    (categoryFilter === 'All' || p.category?.toLowerCase() === categoryFilter.toLowerCase())
  );
  if (sortBy === 'price_low') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === 'price_high') filtered = [...filtered].sort((a, b) => b.price - a.price);

  const addToOrder = (p: Product) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.productId === p.id);
      if (existing) return prev.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: p.id, name: p.name, image: p.images?.[0] ?? '', basePrice: p.price, resellerPrice: p.price, quantity: 1 }];
    });
  };
  const updateOrderItem = (productId: string, patch: Partial<OrderItem>) =>
    setOrderItems(prev => prev.map(i => i.productId === productId ? { ...i, ...patch } : i));
  const removeOrderItem = (productId: string) => setOrderItems(prev => prev.filter(i => i.productId !== productId));

  const totalProfit = orderItems.reduce((s, i) => s + (i.resellerPrice - i.basePrice) * i.quantity, 0);
  const totalAmount = orderItems.reduce((s, i) => s + i.resellerPrice * i.quantity, 0);

  const submitOrder = async () => {
    if (!customer.name || !customer.phone || !customer.address) {
      setResult('Please fill customer name, phone and address'); return;
    }
    setSubmitting(true); setResult('');
    try {
      const res = await fetch('/api/reseller/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems, customer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult('Order submitted successfully!');
      setOrderItems([]); setCustomer({ name: '', phone: '', address: '', city: '' });
      setShowOrderForm(false); loadOrders(); setTab('orders');
    } catch (err: any) {
      setResult(err.message || 'Failed to submit order');
    } finally { setSubmitting(false); }
  };

  const downloadImage = async (url: string, name: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl; a.download = `${name.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const filteredOrders = orderStatusFilter === 'all' ? orders : orders.filter(o => o.status === orderStatusFilter);

  const NAV: { key: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'browse',  label: 'Browse Products', icon: <BrowseIco />,  desc: 'Find & order items' },
    { key: 'orders',  label: 'My Orders',       icon: <OrdersIco />,  desc: 'Track your sales' },
    { key: 'social',  label: 'Social Media',    icon: <SocialIco />,  desc: 'Connect & post' },
    { key: 'profile', label: 'Profile',         icon: <ProfileIco />, desc: 'Account settings' },
  ];

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* FIXED Sidebar — position fixed, never scrolls with page */}
      <aside
        className={`fixed left-0 top-0 h-screen ${sidebarOpen ? 'w-64' : 'w-16'} shrink-0 bg-gray-900 flex flex-col transition-all duration-200 z-40`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-black text-sm">MV</span>
            </div>
            {sidebarOpen && <span className="text-white font-black text-sm truncate">Reseller Panel</span>}
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(prev => !prev)}
            className="relative z-50 shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Ico d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} cls="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto">
          {NAV.map(item => {
            const active = tab === item.key;
            return (
              <button key={item.key} type="button" onClick={() => setTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  active ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}>
                <span className="shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{item.label}</p>
                    <p className={`text-xs truncate ${active ? 'text-violet-100' : 'text-gray-600'}`}>{item.desc}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-2 py-4 border-t border-gray-800 shrink-0">
          <button type="button" onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-gray-400 hover:bg-red-900/40 hover:text-red-300 transition-all">
            <LogoutIco />
            {sidebarOpen && <span className="text-xs font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content — margin-left compensates fixed sidebar width */}
      <main className={`h-screen overflow-y-auto p-6 transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>

        <DashboardHeader />

        {/* BROWSE TAB */}
        {tab === 'browse' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-black text-gray-900">Browse Products</h1>
              {orderItems.length > 0 && (
                <button onClick={() => setShowOrderForm(true)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-green-600 text-white shadow-sm">
                  Cart ({orderItems.length})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-5">
              <div className="relative flex-1 min-w-[220px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIco /></span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or product ID..."
                  className="w-full rounded-xl border-2 border-gray-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-violet-500" />
              </div>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm bg-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm bg-white">
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>

            {error && <p className="text-red-500 text-center py-10">{error}</p>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filtered.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <button type="button" onClick={() => setViewProduct(p)} className="w-full text-left">
                    {p.images?.[0] && <img src={p.images[0]} className="w-full h-40 object-cover" alt={p.name} />}
                    <div className="px-3 pt-3">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 mb-1">ID: {p.id.slice(0, 8)}</p>
                      <p className="text-sm font-bold text-violet-700">Rs. {p.price.toLocaleString()}</p>
                    </div>
                  </button>
                  <div className="flex gap-1.5 p-3 pt-2">
                    <button onClick={() => addToOrder(p)}
                      className="flex-1 text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 py-2 rounded-lg">
                      Add to Order
                    </button>
                    {p.images?.[0] && (
                      <button onClick={() => downloadImage(p.images[0], p.name)}
                        className="flex items-center gap-1 text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 px-2.5 py-2 rounded-lg whitespace-nowrap">
                        <DownloadIco /> Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && !error && (
                <p className="col-span-full text-center text-gray-400 py-16">No products match your filters</p>
              )}
            </div>
          </>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <>
            <h1 className="text-2xl font-black text-gray-900 mb-4">My Orders</h1>
            <div className="flex gap-2 flex-wrap mb-4">
              {(['all', 'new', 'pending', 'completed', 'delivered'] as const).map(f => (
                <button key={f} onClick={() => setOrderStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${orderStatusFilter === f ? 'bg-gray-900 text-white' : 'bg-white border-2 border-gray-200 text-gray-600'}`}>
                  {f === 'all' ? `All (${orders.length})` : `${f} (${orders.filter(o => o.status === f).length})`}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-100">
                  <tr>
                    {['Customer', 'Total', 'My Profit', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-16 text-gray-400">No orders yet</td></tr>
                  ) : filteredOrders.map(o => (
                    <tr key={o.id}>
                      <td className="px-4 py-3 font-semibold">{o.customer?.name}</td>
                      <td className="px-4 py-3 font-bold text-violet-700">Rs. {Number(o.total).toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-green-600">Rs. {Number(o.reseller_profit).toLocaleString()}</td>
                      <td className="px-4 py-3 capitalize">{o.status}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString('en-PK')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* SOCIAL MEDIA TAB */}
        {tab === 'social' && <SocialConnect />}

        {/* PROFILE TAB */}
        {tab === 'profile' && <ProfileSettings />}
      </main>

      {/* Product Detail Modal */}
      {viewProduct && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setViewProduct(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
                <h2 className="text-lg font-black text-gray-900">{viewProduct.name}</h2>
                <button onClick={() => setViewProduct(null)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200">
                  <CloseIco />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {viewProduct.images?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {viewProduct.images.map((img, i) => (
                      <img key={i} src={img} className="w-full h-32 object-cover rounded-xl" alt="" />
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400">Product ID: {viewProduct.id}</p>
                <p className="text-xl font-bold text-violet-700">Rs. {viewProduct.price.toLocaleString()}</p>
                {viewProduct.description && <p className="text-sm text-gray-600">{viewProduct.description}</p>}
                {viewProduct.colors?.length > 0 && (
                  <div className="flex gap-1.5">
                    {viewProduct.colors.map((c, i) => (
                      <span key={i} className="w-6 h-6 rounded-full border-2 border-gray-200" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                )}
                {viewProduct.sizes?.length > 0 && (
                  <p className="text-xs text-gray-500">Sizes: {viewProduct.sizes.join(', ')}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { addToOrder(viewProduct); setViewProduct(null); }}
                    className="flex-1 bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold">
                    Add to Order
                  </button>
                  {viewProduct.images?.[0] && (
                    <button onClick={() => downloadImage(viewProduct.images[0], viewProduct.name)}
                      className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 rounded-2xl text-sm font-semibold">
                      <DownloadIco /> Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order creation modal */}
      {showOrderForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowOrderForm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-lg font-black mb-4">Create Order</h2>
              {orderItems.map(item => (
                <div key={item.productId} className="flex items-center gap-2 border-b border-gray-100 py-3">
                  {item.image && <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Base: Rs. {item.basePrice}</p>
                  </div>
                  <input type="number" value={item.quantity} min={1}
                    onChange={e => updateOrderItem(item.productId, { quantity: Number(e.target.value) })}
                    className="w-14 text-xs border rounded-lg px-2 py-1" />
                  <input type="number" value={item.resellerPrice} min={item.basePrice}
                    onChange={e => updateOrderItem(item.productId, { resellerPrice: Number(e.target.value) })}
                    className="w-20 text-xs border rounded-lg px-2 py-1" placeholder="Your price" />
                  <button onClick={() => removeOrderItem(item.productId)} className="text-red-400 text-xs">✕</button>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm py-3 border-b border-gray-100">
                <span>Total: Rs. {totalAmount.toLocaleString()}</span>
                <span className="text-green-600">Your Profit: Rs. {totalProfit.toLocaleString()}</span>
              </div>
              <div className="space-y-3 mt-4">
                <input placeholder="Customer Name" value={customer.name}
                  onChange={e => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm" />
                <input placeholder="Phone" value={customer.phone}
                  onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm" />
                <input placeholder="City" value={customer.city}
                  onChange={e => setCustomer({ ...customer, city: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm" />
                <textarea placeholder="Address" value={customer.address}
                  onChange={e => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm" rows={2} />
              </div>
              {result && <p className="text-sm mt-3 text-center">{result}</p>}
              <button onClick={submitOrder} disabled={submitting}
                className="w-full mt-4 bg-violet-600 text-white py-3 rounded-2xl font-bold disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Order'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Social Media Connect Section ──
function SocialConnect() {
  const platforms = [
    { key: 'facebook', label: 'Facebook', color: 'bg-blue-600', icon: 'f' },
    { key: 'instagram', label: 'Instagram', color: 'bg-gradient-to-br from-purple-600 to-pink-500', icon: '📷' },
    { key: 'tiktok', label: 'TikTok', color: 'bg-black', icon: '♪' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Social Media</h1>
      <p className="text-sm text-gray-500 mb-6">Connect your accounts to post products directly from this dashboard.</p>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 mb-6">
        <p className="font-semibold mb-1">🚧 Feature in progress</p>
        <p>
          Direct posting to Facebook, Instagram, and TikTok requires official approval from each
          platform. This is a one-time setup being done by MaestraVibe with each platform, not
          something that can be turned on instantly. Once approved, connect buttons here will
          become active.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {platforms.map(p => (
          <div key={p.key} className="bg-white rounded-2xl border-2 border-gray-100 p-5 flex flex-col items-center text-center gap-3">
            <div className={`w-14 h-14 rounded-2xl ${p.color} text-white flex items-center justify-center text-2xl font-black`}>
              {p.icon}
            </div>
            <p className="font-bold text-gray-800">{p.label}</p>
            <button disabled
              className="w-full text-xs font-semibold bg-gray-100 text-gray-400 py-2.5 rounded-xl cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile Settings Section (Editable + Avatar Upload) ──
function ProfileSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [result, setResult] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', address: '', website: '' });

  useEffect(() => {
    fetch('/api/reseller/me')
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          website: data.website || '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setResult('');
    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-file-name': `avatar_${Date.now()}_${file.name}`, 'x-file-type': file.type },
        body: file,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || 'Upload failed');

      const patchRes = await fetch('/api/reseller/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: uploadData.url }),
      });
      if (!patchRes.ok) { const d = await patchRes.json(); throw new Error(d.message); }

      setProfile((p: any) => ({ ...p, avatar_url: uploadData.url }));
      setResult('Profile picture updated!');
    } catch (err: any) {
      setResult(err.message || 'Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setResult('');
    try {
      const res = await fetch('/api/reseller/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setResult('Profile updated successfully!');
      setProfile((p: any) => ({ ...p, ...form }));
    } catch (err: any) {
      setResult(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (!profile) return <p className="text-red-500">Failed to load profile</p>;

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-6">Profile</h1>

      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 max-w-lg space-y-5">

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-violet-100 overflow-hidden flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <span className="text-2xl font-black text-violet-600">{profile.name?.[0]?.toUpperCase() ?? '?'}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center cursor-pointer text-white shadow-md">
              <CameraIco />
              <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" disabled={uploadingAvatar} />
            </label>
          </div>
          <div>
            <p className="font-bold text-gray-800">{profile.name}</p>
            <p className="text-xs text-gray-400">{profile.email}</p>
            {uploadingAvatar && <p className="text-xs text-violet-500 mt-1">Uploading...</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
          <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website / Store (optional)</label>
          <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
        </div>

        <p className="text-xs text-gray-400">Status: <span className="font-semibold capitalize">{profile.status}</span></p>

        {result && (
          <p className={`text-sm ${result.includes('success') || result.includes('updated') ? 'text-green-600' : 'text-red-600'}`}>
            {result}
          </p>
        )}

        <button onClick={saveProfile} disabled={saving}
          className="w-full bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}