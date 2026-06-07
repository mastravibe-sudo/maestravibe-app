'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Product, Order, Subscriber, Submission } from '@/lib/supabase';
import ColorPicker from '@/components/ColorPicker';

type Tab = 'products' | 'orders' | 'subscribers' | 'submissions';
type OrderFilter = 'all' | 'new' | 'pending' | 'completed' | 'delivered';
const ORDER_STATUSES = ['new', 'pending', 'completed', 'delivered'] as const;
type OrderStatus = typeof ORDER_STATUSES[number];

const CATEGORIES = [
  { label: 'Women',          value: 'women'          },
  { label: 'Men',            value: 'men'             },
  { label: 'Kids',           value: 'kids'            },
  { label: 'Kurta & Shalwar',value: 'kurta-shalwar'  },
  { label: 'Dress',          value: 'dress'           },
  { label: 'Tops',           value: 'tops'            },
  { label: 'Jeans & Pants',  value: 'jeans-pants'    },
  { label: 'Shoes',          value: 'shoes'           },
  { label: 'Bags',           value: 'bags'            },
  { label: 'Jewelry',        value: 'jewelry'         },
  { label: 'Accessories',    value: 'accessories'     },
  { label: 'Winter',         value: 'winter'          },
  { label: 'Summer',         value: 'summer'          },
  { label: 'Beauty',         value: 'beauty'          },
  { label: 'Sports',         value: 'sports'          },
  { label: 'Home & Kitchen', value: 'home'            },
  { label: 'Electronics',    value: 'electronics'     },
  { label: 'Books',          value: 'books'           },
  { label: 'Sale',           value: 'sale'            },
];

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-blue-100 text-blue-700',
  pending:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  delivered: 'bg-teal-100 text-teal-700',
  read:      'bg-gray-100 text-gray-600',
  replied:   'bg-purple-100 text-purple-700',
};

const INPUT = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300';

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ══════════════════════════════════════════════════════════════
// PRODUCT FORM MODAL
// ══════════════════════════════════════════════════════════════
function ProductModal({ product, onClose, onSaved }: {
  product?: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name:        product?.name        ?? '',
    price:       product?.price?.toString() ?? '',
    category:    product?.category    ?? 'women',
    description: product?.description ?? '',
    colors:      product?.colors ?? [] as string[],
    sizes:       product?.sizes?.join(', ') ?? '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews]     = useState<string[]>(product?.images ?? []);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImageFiles(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const split = (v: string) => v.split(',').map(s => s.trim()).filter(Boolean);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { setError('Name aur price zaroor chahiye.'); return; }
    setSaving(true); setError('');
    try {
      const imageUrls: string[] = isEdit && imageFiles.length === 0
        ? (product?.images ?? [])
        : [];

      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'x-file-name': fileName, 'x-file-type': file.type },
          body: file,
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message ?? 'Upload failed');
        imageUrls.push(d.url);
      }

      const payload = {
        name:        form.name,
        price:       Number(form.price),
        category:    form.category,
        description: form.description,
        colors:      form.colors,
        sizes:       split(form.sizes),
        images:      imageUrls,
      };

      const res = await fetch(
        isEdit ? `/api/products/${product!.id}` : '/api/products',
        { method: isEdit ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.message ?? 'Save failed');
      onSaved(); onClose();
    } catch (err: any) {
      setError(err.message ?? 'Kuch galat ho gaya');
    } finally { setSaving(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Product Edit Karo' : 'Naya Product Add Karo'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
          <form onSubmit={submit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-400">*</span></label>
              <input name="name" value={form.name} onChange={handle} required placeholder="e.g. Floral Kurta" className={INPUT} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) <span className="text-red-400">*</span></label>
                <input name="price" type="number" min="0" value={form.price} onChange={handle} required placeholder="1500" className={INPUT} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" value={form.category} onChange={handle} className={INPUT}>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ya jaldi select karo</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button key={c.value} type="button"
                    onClick={() => setForm(p => ({ ...p, category: c.value }))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                      form.category === c.value ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                    }`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handle} rows={3}
                placeholder="Product ki description..." className={`${INPUT} resize-none`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
              <ColorPicker selected={form.colors} onChange={colors => setForm(p => ({ ...p, colors }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sizes <span className="text-xs text-gray-400 font-normal">(comma se alag karo)</span>
              </label>
              <input name="sizes" value={form.sizes} onChange={handle} placeholder="S, M, L, XL, XXL" className={INPUT} />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {['XS','S','M','L','XL','XXL','XXXL','Free Size','36','38','40','42','44'].map(sz => (
                  <button key={sz} type="button"
                    onClick={() => {
                      const current = form.sizes.split(',').map(s => s.trim()).filter(Boolean);
                      if (!current.includes(sz)) setForm(p => ({ ...p, sizes: [...current, sz].join(', ') }));
                    }}
                    className="px-2 py-0.5 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-500 rounded text-xs transition">
                    +{sz}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images {isEdit && <span className="text-xs text-gray-400 font-normal">(nayi choose karo ya purani rahne do)</span>}
              </label>
              {previews.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-5 text-sm text-gray-400 hover:border-purple-300 hover:text-purple-400 transition-colors">
                📷 Images choose karo (multiple bhi)
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-60">
                {saving ? 'Save ho raha hai...' : isEdit ? 'Update Karo' : 'Product Add Karo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// ORDER DETAIL MODAL
// ══════════════════════════════════════════════════════════════
function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <StatusBadge status={order.status} />
              <span className="text-xs text-gray-400 ml-auto">{fmt(order.created_at)}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer Info</p>
              <p className="text-sm text-gray-800"><span className="text-gray-500 w-20 inline-block">Name:</span> {order.customer?.name}</p>
              <p className="text-sm text-gray-800"><span className="text-gray-500 w-20 inline-block">Phone:</span> {order.customer?.phone}</p>
              {order.customer?.email && <p className="text-sm text-gray-800"><span className="text-gray-500 w-20 inline-block">Email:</span> {order.customer.email}</p>}
              <p className="text-sm text-gray-800"><span className="text-gray-500 w-20 inline-block">City:</span> {order.customer?.city}</p>
              {order.customer?.area && <p className="text-sm text-gray-800"><span className="text-gray-500 w-20 inline-block">Area:</span> {order.customer.area}</p>}
              <p className="text-sm text-gray-800"><span className="text-gray-500 w-20 inline-block">Address:</span> {order.customer?.address}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items ({order.items?.length})</p>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                    {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                        {item.selectedColor && item.selectedSize && ' · '}
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-4">
              <span className="font-bold text-gray-700">Total</span>
              <span className="text-xl font-bold text-purple-700">Rs. {Number(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// BULK EMAIL MODAL
// ══════════════════════════════════════════════════════════════
function BulkEmailModal({ subscribers, onClose }: { subscribers: Subscriber[]; onClose: () => void }) {
  const [subject, setSubject] = useState('');
  const [body, setBody]       = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult]   = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) return;
    setSending(true);
    try {
      const res = await fetch('/api/email/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, emails: subscribers.map(s => s.email) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message ?? 'Send failed');
      setResult(`✅ ${d.sent} subscribers ko email bhej di!`);
    } catch (err: any) {
      setResult(`❌ ${err.message}`);
    } finally { setSending(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bulk Email Bhejo</h2>
              <p className="text-xs text-gray-400 mt-0.5">{subscribers.length} subscribers ko jayegi</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
          <form onSubmit={send} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-400">*</span></label>
              <input value={subject} onChange={e => setSubject(e.target.value)} required
                placeholder="e.g. New Arrivals — Summer Collection 2025" className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-400">*</span></label>
              <textarea value={body} onChange={e => setBody(e.target.value)} required rows={8}
                placeholder="Apna message yahan likhein..." className={`${INPUT} resize-none`} />
            </div>
            <div className="bg-gray-50 rounded-xl p-3 max-h-28 overflow-y-auto">
              <p className="text-xs text-gray-500 font-medium mb-1">Recipients:</p>
              {subscribers.map(s => (
                <p key={s.id} className="text-xs text-gray-600">{s.email}</p>
              ))}
            </div>
            {result && (
              <p className={`text-sm px-3 py-2 rounded-lg ${result.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {result}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={sending}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-60">
                {sending ? 'Bhej raha hai...' : `📧 Sab ko Bhejo (${subscribers.length})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [activeTab, setActiveTab]           = useState<Tab>('products');
  const [orderFilter, setOrderFilter]       = useState<OrderFilter>('all');
  const [showAddModal, setShowAddModal]     = useState(false);
  const [editProduct, setEditProduct]       = useState<Product | undefined>();
  const [viewOrder, setViewOrder]           = useState<Order | undefined>();
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [products,    setProducts]    = useState<Product[]>([]);
  const [orders,      setOrders]      = useState<Order[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error,   setError]           = useState<string | null>(null);

  // ✅ Logout function — sirf yahan hai, header mein nahi
  const logout = async () => {
    await fetch('/api/admin-login', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  const fetchTab = useCallback(async (tab: Tab) => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`/api/${tab}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error');
      const rows = Array.isArray(data) ? data : [];
      if (tab === 'products')    setProducts(rows);
      if (tab === 'orders')      setOrders(rows);
      if (tab === 'subscribers') setSubscribers(rows);
      if (tab === 'submissions') setSubmissions(rows);
    } catch (err: any) {
      setError(err.message ?? 'Load nahi hua');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTab(activeTab); }, [activeTab, fetchTab]);

  const deleteItem = async (tab: Tab, id: string) => {
    if (!confirm('Pakka delete karna hai?')) return;
    try {
      const res = await fetch(`/api/${tab}/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Delete fail'); }
      fetchTab(tab);
    } catch (err: any) { alert(err.message); }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchTab('orders');
    } catch { alert('Status update nahi hua'); }
  };

  const updateSubmissionStatus = async (id: string, status: Submission['status']) => {
    try {
      await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchTab('submissions');
    } catch { alert('Status update nahi hua'); }
  };

  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
  const orderFilterCounts = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const tabs = [
    { key: 'products'    as Tab, label: '📦 Products',    count: products.length    },
    { key: 'orders'      as Tab, label: '🛒 Orders',      count: orders.length      },
    { key: 'subscribers' as Tab, label: '📧 Subscribers', count: subscribers.length },
    { key: 'submissions' as Tab, label: '📝 Submissions', count: submissions.length },
  ];

  return (
    <>
      {(showAddModal || editProduct) && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowAddModal(false); setEditProduct(undefined); }}
          onSaved={() => fetchTab('products')}
        />
      )}
      {viewOrder && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(undefined)} />}
      {showEmailModal && <BulkEmailModal subscribers={subscribers} onClose={() => setShowEmailModal(false)} />}

      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">Store ka poora data yahan hai</p>
            </div>
            <div className="flex gap-2 items-center">
              {activeTab === 'products' && (
                <button onClick={() => setShowAddModal(true)}
                  className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-700 shadow-sm">
                  + Product Add Karo
                </button>
              )}
              {activeTab === 'subscribers' && subscribers.length > 0 && (
                <button onClick={() => setShowEmailModal(true)}
                  className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-700 shadow-sm">
                  📧 Bulk Email Bhejo
                </button>
              )}
              {/* ✅ Logout button — sirf admin ko dikhe ga */}
              <button onClick={logout}
                className="px-4 py-2.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 rounded-xl bg-white transition-colors">
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Main tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === t.key ? 'bg-purple-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
                }`}>
                {t.label}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === t.key ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{t.count}</span>
              </button>
            ))}
            <button onClick={() => fetchTab(activeTab)}
              className="ml-auto px-4 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
              ↻ Refresh
            </button>
          </div>

          {/* Order sub-filters */}
          {activeTab === 'orders' && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {(['all', ...ORDER_STATUSES] as const).map(f => (
                <button key={f} onClick={() => setOrderFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    orderFilter === f ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {f === 'all' ? `All (${orders.length})` : `${f} (${orderFilterCounts[f] ?? 0})`}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading && <div className="flex items-center justify-center py-16 text-gray-400">Loading...</div>}
            {error   && <div className="p-6 text-red-600 bg-red-50 text-sm">⚠️ {error}</div>}

            {!loading && !error && (
              <div className="overflow-x-auto">

                {/* ── PRODUCTS ── */}
                {activeTab === 'products' && (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>{['Image','Name','Price','Category','Colors','Sizes','Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                          <p className="text-3xl mb-2">📦</p>
                          Koi product nahi —{' '}
                          <button onClick={() => setShowAddModal(true)} className="text-purple-600 underline">pehla add karo</button>
                        </td></tr>
                      ) : products.map(p => (
                        <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                              : <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl">🧥</div>}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                          <td className="px-4 py-3 text-gray-600">Rs. {Number(p.price).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium capitalize">
                              {CATEGORIES.find(c => c.value === p.category)?.label ?? p.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            <div className="flex gap-1 flex-wrap">
                              {p.colors?.slice(0, 5).map((c, i) => (
                                <span key={i} className="w-4 h-4 rounded-full border border-gray-200 inline-block"
                                  style={{ backgroundColor: c }} title={c} />
                              ))}
                              {(p.colors?.length ?? 0) > 5 && <span className="text-gray-400">+{p.colors!.length - 5}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{p.sizes?.join(', ') || '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => setEditProduct(p)}
                                className="text-purple-600 hover:text-purple-800 text-xs font-medium bg-purple-50 px-3 py-1 rounded-lg">
                                Edit
                              </button>
                              <button onClick={() => deleteItem('products', p.id)}
                                className="text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 px-3 py-1 rounded-lg">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* ── ORDERS ── */}
                {activeTab === 'orders' && (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>{['Customer','Email','Phone','City','Total','Items','Date','Status','Update','Actions'].map(h => (
                        <th key={h} className="text-left px-3 py-3 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr><td colSpan={10} className="text-center py-12 text-gray-400">Is filter mein koi order nahi</td></tr>
                      ) : filteredOrders.map(o => (
                        <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-3 py-3 font-medium text-gray-800 whitespace-nowrap">{o.customer?.name}</td>
                          <td className="px-3 py-3 text-gray-500 text-xs">{o.customer?.email || '—'}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{o.customer?.phone}</td>
                          <td className="px-3 py-3 text-gray-600">{o.customer?.city}</td>
                          <td className="px-3 py-3 font-medium text-gray-700 whitespace-nowrap">Rs. {Number(o.total).toLocaleString()}</td>
                          <td className="px-3 py-3 text-gray-500">{o.items?.length ?? 0}</td>
                          <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap">{fmt(o.created_at)}</td>
                          <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                          <td className="px-3 py-3">
                            <select value={o.status}
                              onChange={e => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-300">
                              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex gap-1.5">
                              <button onClick={() => setViewOrder(o)}
                                className="text-blue-500 hover:text-blue-700 text-xs font-medium bg-blue-50 px-2 py-1 rounded-lg">
                                Details
                              </button>
                              <button onClick={() => deleteItem('orders', o.id)}
                                className="text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 px-2 py-1 rounded-lg">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* ── SUBSCRIBERS ── */}
                {activeTab === 'subscribers' && (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>{['#','Email','Subscribed At','Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {subscribers.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-12 text-gray-400">Abhi koi subscriber nahi</td></tr>
                      ) : subscribers.map((s, i) => (
                        <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{s.email}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(s.subscribed_at).toLocaleDateString('en-PK', { year:'numeric', month:'short', day:'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => deleteItem('subscribers', s.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 px-3 py-1 rounded-lg">
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* ── SUBMISSIONS ── */}
                {activeTab === 'submissions' && (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>{['Name','Email','Type','Subject','Status','Date','Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {submissions.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-12 text-gray-400">Abhi koi submission nahi</td></tr>
                      ) : submissions.map(s => (
                        <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                          <td className="px-4 py-3 text-gray-600">{s.email}</td>
                          <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.type}</span></td>
                          <td className="px-4 py-3 text-gray-500">{s.subject || '—'}</td>
                          <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(s.created_at).toLocaleDateString('en-PK', { year:'numeric', month:'short', day:'numeric' })}
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            {s.status === 'new' && (
                              <button onClick={() => updateSubmissionStatus(s.id, 'read')} className="text-blue-500 hover:text-blue-700 text-xs font-medium">Mark Read</button>
                            )}
                            {s.status === 'read' && (
                              <button onClick={() => updateSubmissionStatus(s.id, 'replied')} className="text-purple-500 hover:text-purple-700 text-xs font-medium">Mark Replied</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}