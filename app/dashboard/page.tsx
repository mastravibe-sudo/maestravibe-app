'use client';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PK_CITIES } from '@/lib/order-validation';
import { resellerFetch } from '@/lib/reseller-fetch';

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
const CopyIco     = () => <Ico cls="w-4 h-4" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />;
const WalletIco   = () => <Ico cls="w-4 h-4" d="M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a2 2 0 000 4h4v-4h-4z" />;

function buildProductShareText(p: Product) {
  const lines = [
    p.name,
    `Price: Rs. ${p.price.toLocaleString()}`,
    p.category ? `Category: ${p.category}` : '',
    p.colors?.length ? `Colors: ${p.colors.join(', ')}` : '',
    p.sizes?.length ? `Sizes: ${p.sizes.join(', ')}` : '',
    p.description ? `\n${p.description}` : '',
  ].filter(Boolean);
  return lines.join('\n');
}

// Many product descriptions are one long emoji-separated string, e.g.
// "🔥ANC Noise Cancellation🔋Long Lasting Battery⚡Type-C Fast Charging..."
// This splits that into clean individual feature lines for display.
function parseFeatureList(description?: string): string[] {
  if (!description) return [];
  const matches = description.match(/\p{Extended_Pictographic}[^\p{Extended_Pictographic}]*/gu);
  if (matches && matches.length > 1) {
    return matches.map(m => m.trim()).filter(Boolean);
  }
  // Fallback: no emoji delimiters found, treat as plain paragraph / line-separated text
  return description.split(/\n+/).map(s => s.trim()).filter(Boolean);
}

export default function ResellerDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('browse');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [error, setError] = useState('');
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [modalImgIndex, setModalImgIndex] = useState(0);
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(16); // pagination — render products in batches

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'new' | 'pending' | 'completed' | 'delivered'>('all');
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', city: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    resellerFetch('/api/reseller/products')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); else setError(data.message || 'Failed to load'); })
      .catch(() => setError('Failed to load products'));
  }, []);

  // Debounce the search box so filtering doesn't run on every single keystroke
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Whenever the active filters change, go back to page 1 of results
  useEffect(() => { setVisibleCount(16); }, [search, categoryFilter, sortBy]);

  const loadOrders = useCallback(() => {
    resellerFetch('/api/reseller/orders').then(r => r.json()).then(data => { if (Array.isArray(data)) setOrders(data); });
  }, []);
  useEffect(() => { if (tab === 'orders') loadOrders(); }, [tab, loadOrders]);

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = products.filter(p =>
      (p.name.toLowerCase().includes(q) || p.id.includes(search)) &&
      (categoryFilter === 'All' || p.category?.toLowerCase() === categoryFilter.toLowerCase())
    );
    if (sortBy === 'price_low') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price_high') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, search, categoryFilter, sortBy]);

  const visibleProducts = filtered.slice(0, visibleCount);

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
      const res = await resellerFetch('/api/reseller/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems, customer }),
      });
      const data = await res.json();
      if (!res.ok) {
        const fields = data.fieldErrors ? Object.entries(data.fieldErrors).map(([field, message]) => `${field}: ${message}`).join(' ') : '';
        throw new Error(fields || data.message || 'Failed to submit order');
      }
      setResult('Order submitted successfully!');
      setOrderItems([]); setCustomer({ name: '', phone: '', address: '', city: '' });
      setShowOrderForm(false); loadOrders(); setTab('orders');
    } catch (err: any) {
      setResult(err.message || 'Failed to submit order');
    } finally { setSubmitting(false); }
  };

  const copyProductDetails = async (p: Product) => {
    try {
      await navigator.clipboard.writeText(buildProductShareText(p));
      setCopiedProductId(p.id);
      setTimeout(() => setCopiedProductId(null), 1800);
    } catch {
      alert('Could not copy — please copy manually.');
    }
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
                <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search by name or product ID..."
                  className="w-full rounded-xl border-2 border-gray-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-violet-500 text-gray-900 placeholder-gray-400" />
              </div>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm bg-white text-gray-900">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                className="rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm bg-white text-gray-900">
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>

            {error && <p className="text-red-500 text-center py-10">{error}</p>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {visibleProducts.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <button type="button" onClick={() => { setViewProduct(p); setModalImgIndex(0); }} className="w-full text-left">
                    {p.images?.[0] && (
                      <img src={p.images[0]} className="w-full h-40 object-cover bg-gray-50" alt={p.name}
                        loading="lazy" decoding="async" />
                    )}
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
                    <button onClick={() => copyProductDetails(p)}
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
                        copiedProductId === p.id ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}>
                      <CopyIco /> {copiedProductId === p.id ? 'Copied!' : 'Copy'}
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

            {visibleCount < filtered.length && (
              <div className="flex justify-center mt-6">
                <button onClick={() => setVisibleCount(c => c + 16)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50">
                  Load More ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
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
                    {['Customer', 'Total', 'My Profit', 'Profit Status', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-16 text-gray-400">No orders yet</td></tr>
                  ) : filteredOrders.map(o => (
                    <tr key={o.id}>
                      <td className="px-4 py-3 font-semibold text-gray-900">{o.customer?.name}</td>
                      <td className="px-4 py-3 font-bold text-violet-700">Rs. {Number(o.total).toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-green-600">Rs. {Number(o.reseller_profit).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {o.profit_paid ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">✓ Paid</span>
                        ) : (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-900">{o.status}</td>
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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto text-gray-900">
              <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="text-base font-black text-gray-900 leading-snug">{viewProduct.name}</h2>
                <button onClick={() => setViewProduct(null)} className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200">
                  <CloseIco />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Image gallery: big main image + thumbnail row */}
                {viewProduct.images?.length > 0 && (
                  <div>
                    <img
                      src={viewProduct.images[modalImgIndex] ?? viewProduct.images[0]}
                      className="w-full h-56 object-cover rounded-2xl border border-gray-100"
                      alt={viewProduct.name}
                    />
                    {viewProduct.images.length > 1 && (
                      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                        {viewProduct.images.map((img, i) => (
                          <button key={i} type="button" onClick={() => setModalImgIndex(i)}
                            className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors ${
                              modalImgIndex === i ? 'border-violet-600' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}>
                            <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" decoding="async" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ID + Price row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2.5 py-1 rounded-lg">
                    ID: {viewProduct.id.slice(0, 8)}
                  </span>
                  <span className="text-2xl font-black text-violet-700">Rs. {viewProduct.price.toLocaleString()}</span>
                </div>

                {/* Features list (parsed from description) */}
                {viewProduct.description && (
                  <div className="bg-violet-50/60 border border-violet-100 rounded-2xl p-4">
                    <p className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-2.5">Features</p>
                    <ul className="space-y-1.5">
                      {parseFeatureList(viewProduct.description).map((line, i) => (
                        <li key={i} className="text-sm text-gray-700 leading-snug">{line}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Colors */}
                {viewProduct.colors?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Available Colors</p>
                    <div className="flex gap-2">
                      {viewProduct.colors.map((c, i) => (
                        <span key={i} className="w-7 h-7 rounded-full border-2 border-gray-200 shadow-sm" style={{ backgroundColor: c }} title={c} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {viewProduct.sizes?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sizes</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {viewProduct.sizes.map((s, i) => (
                        <span key={i} className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1">
                  <button onClick={() => { addToOrder(viewProduct); setViewProduct(null); }}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-2xl text-sm font-bold transition-colors">
                    Add to Order
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => copyProductDetails(viewProduct)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                        copiedProductId === viewProduct.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      <CopyIco /> {copiedProductId === viewProduct.id ? 'Copied!' : 'Copy Details'}
                    </button>
                    {viewProduct.images?.[0] && (
                      <button onClick={() => downloadImage(viewProduct.images[modalImgIndex] ?? viewProduct.images[0], viewProduct.name)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-2xl text-sm font-semibold transition-colors">
                        <DownloadIco /> Download
                      </button>
                    )}
                  </div>
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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 text-gray-900">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-gray-900">Create Order</h2>
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  aria-label="Close"
                  className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  <CloseIco />
                </button>
              </div>
              {orderItems.map(item => (
                <div key={item.productId} className="flex items-center gap-2 border-b border-gray-100 py-3">
                  {item.image && <img src={item.image} className="w-12 h-12 rounded-lg object-cover" loading="lazy" decoding="async" />}
                  <div className="flex-1">
                    <p className="text-sm font-semibold truncate text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">Base: Rs. {item.basePrice}</p>
                  </div>
                  <input type="number" value={item.quantity} min={1}
                    onChange={e => updateOrderItem(item.productId, { quantity: Number(e.target.value) })}
                    className="w-14 text-xs border rounded-lg px-2 py-1 text-gray-900" />
                  <input type="number" value={item.resellerPrice} min={item.basePrice}
                    onChange={e => updateOrderItem(item.productId, { resellerPrice: Number(e.target.value) })}
                    className="w-20 text-xs border rounded-lg px-2 py-1 text-gray-900" placeholder="Your price" />
                  <button onClick={() => removeOrderItem(item.productId)} className="text-red-500 text-xs">✕</button>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm py-3 border-b border-gray-100 text-gray-900">
                <span>Total: Rs. {totalAmount.toLocaleString()}</span>
                <span className="text-green-600">Your Profit: Rs. {totalProfit.toLocaleString()}</span>
              </div>
              <div className="space-y-3 mt-4">
                <input placeholder="Customer Name" value={customer.name}
                  onChange={e => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
                <input placeholder="Phone" value={customer.phone}
                  onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
                <select value={customer.city}
                  onChange={e => setCustomer({ ...customer, city: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm text-gray-900">
                  <option value="">Select customer city</option>
                  {PK_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                <textarea placeholder="Address" value={customer.address}
                  onChange={e => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400" rows={2} />
              </div>
              {result && (
                <p className={`text-sm mt-3 text-center ${result.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {result}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold transition-colors"
                >
                  Back
                </button>
                <button onClick={submitOrder} disabled={submitting}
                  className="flex-1 bg-violet-600 text-white py-3 rounded-2xl font-bold disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Submit Order'}
                </button>
              </div>
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

// ── Wallet Section (Total Sales, Profit, Transactions) ──
function WalletSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resellerFetch('/api/reseller/orders')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setOrders(data); })
      .finally(() => setLoading(false));
  }, []);

  const totalSales = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const totalProfit = orders.reduce((s, o) => s + Number(o.reseller_profit || 0), 0);
  const paidOrders = orders.filter(o => o.profit_paid);
  const pendingOrders = orders.filter(o => !o.profit_paid);
  const paidProfit = paidOrders.reduce((s, o) => s + Number(o.reseller_profit || 0), 0);
  const pendingProfit = pendingOrders.reduce((s, o) => s + Number(o.reseller_profit || 0), 0);

  // Most recent paid transactions first
  const transactions = [...paidOrders].sort((a, b) =>
    new Date(b.profit_paid_at || b.created_at).getTime() - new Date(a.profit_paid_at || a.created_at).getTime()
  );

  if (loading) return <p className="text-gray-400 text-sm">Loading wallet...</p>;

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <p className="text-xs text-gray-400 font-semibold mb-1">Total Sales</p>
          <p className="text-lg font-black text-gray-900">Rs. {totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <p className="text-xs text-gray-400 font-semibold mb-1">Total Profit</p>
          <p className="text-lg font-black text-violet-700">Rs. {totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 rounded-2xl border-2 border-green-100 p-4">
          <p className="text-xs text-green-600 font-semibold mb-1">Paid to You</p>
          <p className="text-lg font-black text-green-700">Rs. {paidProfit.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-100 p-4">
          <p className="text-xs text-amber-600 font-semibold mb-1">Pending</p>
          <p className="text-lg font-black text-amber-700">Rs. {pendingProfit.toLocaleString()}</p>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="font-bold text-gray-800 text-sm">Transaction History</p>
          <p className="text-xs text-gray-400 mt-0.5">Profit payments received from MaestraVibe</p>
        </div>
        {transactions.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No transactions yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map(o => (
              <div key={o.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-gray-400">Txn #{o.id?.slice(0, 8)}</span>
                  <span className="text-sm font-black text-green-600">+ Rs. {Number(o.reseller_profit || 0).toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {(o.items || []).map((i: any) => i.name).join(', ')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Paid on {o.profit_paid_at ? new Date(o.profit_paid_at).toLocaleDateString('en-PK') : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
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
  const [profileSubTab, setProfileSubTab] = useState<'account' | 'wallet'>('account');

  useEffect(() => {
    resellerFetch('/api/reseller/me')
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

      const patchRes = await resellerFetch('/api/reseller/me', {
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
      const res = await resellerFetch('/api/reseller/me', {
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
      <h1 className="text-2xl font-black text-gray-900 mb-4">Profile</h1>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setProfileSubTab('account')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${profileSubTab === 'account' ? 'bg-gray-900 text-white' : 'bg-white border-2 border-gray-200 text-gray-600'}`}>
          Account Settings
        </button>
        <button onClick={() => setProfileSubTab('wallet')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${profileSubTab === 'wallet' ? 'bg-gray-900 text-white' : 'bg-white border-2 border-gray-200 text-gray-600'}`}>
          <WalletIco /> Wallet
        </button>
      </div>

      {profileSubTab === 'wallet' && <WalletSection />}

      {profileSubTab === 'account' && (
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
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
          <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website / Store (optional)</label>
          <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 text-gray-900" />
        </div>

        <p className="text-xs text-gray-400">Status: <span className="font-semibold capitalize">{profile.status}</span></p>

        {result && (
          <p className={`text-sm ${result.toLowerCase().includes('success') || result.toLowerCase().includes('updated') ? 'text-green-600' : 'text-red-600'}`}>
            {result}
          </p>
        )}

        <button onClick={saveProfile} disabled={saving}
          className="w-full bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      )}
    </div>
  );
}