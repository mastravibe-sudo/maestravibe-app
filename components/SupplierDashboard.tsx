'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { compressImage } from '@/lib/image-compress';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  images: string[];
  colors: string[];
  sizes: string[];
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
};

type SupplierProfile = {
  id: string;
  name: string;
  email: string;
  status: string;
  phone?: string;
  address?: string;
  website?: string;
  avatar_url?: string | null;
};

type SupplierOrder = {
  id: string;
  created_at: string;
  status: string;
  supplier_status?: string | null;
  supplier_total: number;
  items: Array<{ name: string; price: number; quantity: number; image?: string }>;
  customer?: { name?: string; phone?: string; city?: string; address?: string };
};

const CATEGORIES = ['Women', 'Men', 'Kids', 'Kurta & Shalwar', 'Dress', 'Tops', 'Jeans & Pants', 'Shoes', 'Bags', 'Jewelry', 'Accessories'];

const emptyForm = {
  name: '', price: '', category: CATEGORIES[0], description: '',
  images: '', colors: '', sizes: '',
};

function Ico({ d, cls = 'w-5 h-5' }: { d: string; cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}
const PlusIco   = () => <Ico d="M12 4v16m8-8H4" />;
const EditIco   = () => <Ico cls="w-4 h-4" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />;
const TrashIco  = () => <Ico cls="w-4 h-4" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />;
const CloseIco  = () => <Ico d="M6 18L18 6M6 6l12 12" />;
const LogoutIco = () => <Ico d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />;

function StatusBadge({ status }: { status: Product['approval_status'] }) {
  const map = {
    approved: 'bg-green-100 text-green-700',
    pending:  'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] ?? map.pending}`}>
      {status}
    </span>
  );
}

export default function SupplierDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [activeSection, setActiveSection] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [draggingImages, setDraggingImages] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '', website: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const profileFileInputRef = useRef<HTMLInputElement | null>(null);

  const loadProfile = useCallback(async () => {
    const response = await fetch('/api/supplier/me', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not refresh account status');
    const data: SupplierProfile = await response.json();
    setProfile(data);
    setProfileForm({
      name: data.name ?? '',
      phone: data.phone ?? '',
      address: data.address ?? '',
      website: data.website ?? '',
    });
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/supplier/products', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not refresh products');
      const data = await response.json();
      if (Array.isArray(data)) setProducts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    const response = await fetch('/api/orders?mine=1', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load supplier orders');
    const data = await response.json();
    if (Array.isArray(data)) setOrders(data);
  }, []);

  const refreshDashboard = useCallback(() => {
    void Promise.allSettled([loadProfile(), loadProducts(), loadOrders()]);
  }, [loadOrders, loadProducts, loadProfile]);

  useEffect(() => {
    refreshDashboard();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshDashboard();
    };
    const interval = window.setInterval(refreshWhenVisible, 15000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refreshDashboard]);

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const uploadImageFile = async (file: File) => {
    try {
      setUploadingImage(true);
      setUploadError('');

      const compressed = await compressImage(file, { maxSizeKB: 100, maxDimension: 1400, outputType: 'image/webp' });
      if (compressed.size > 100 * 1024) throw new Error('Image could not be compressed below 100KB. Try a smaller image.');
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-file-name': compressed.name,
          'x-file-type': compressed.type,
        },
        body: compressed,
      });

      if (!uploadRes.ok) {
        const body = await uploadRes.json().catch(() => null);
        throw new Error(body?.message || 'Upload failed');
      }

      const { url } = await uploadRes.json();
      return url as string;
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const onImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    await addProductImages(files);
    event.target.value = '';
  };

  const addProductImages = async (files: File[]) => {
    for (const file of files) {
      const url = await uploadImageFile(file);
      if (url) setForm(current => ({ ...current, images: [...current.images.split('\n').map(s => s.trim()).filter(Boolean), url].join('\n') }));
    }
  };

  const triggerImagePicker = () => fileInputRef.current?.click();

  const onProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await uploadImageFile(file);
    if (url) {
      const response = await fetch('/api/supplier/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: url }),
      });
      if (!response.ok) setProfileMessage('Profile photo uploaded, but could not be saved to your account.');
      else setProfile(current => current ? { ...current, avatar_url: url } : current);
    }
    event.target.value = '';
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    try {
      const response = await fetch('/api/supplier/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save profile');
      setProfile(data);
      setProfileMessage('Account settings saved.');
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: String(p.price),
      category: p.category || CATEGORIES[0],
      description: p.description || '',
      images: (p.images || []).join('\n'),
      colors: (p.colors || []).join(', '),
      sizes: (p.sizes || []).join(', '),
    });
    setError('');
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { setError('Name and price are required'); return; }

    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        description: form.description,
        images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
        colors: form.colors.split(',').map(s => s.trim()).filter(Boolean),
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      };

      const res = editingId
        ? await fetch('/api/supplier/products', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingId, ...payload }),
          })
        : await fetch('/api/supplier/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      closeForm();
      loadProducts();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/supplier/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Could not delete product. Please try again.');
    }
  };

  const completedOrders = orders.filter(order => order.supplier_status !== 'cancelled' && (['accepted', 'completed', 'delivered'].includes(order.status) || order.supplier_status === 'delivered'));
  const totalSales = completedOrders.reduce((sum, order) => sum + Number(order.supplier_total || 0), 0);
  const approvedCount = products.filter(product => product.approval_status === 'approved').length;
  const pendingCount = products.filter(product => product.approval_status === 'pending').length;
  const chartDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const value = completedOrders
      .filter(order => new Date(order.created_at).toDateString() === date.toDateString())
      .reduce((sum, order) => sum + Number(order.supplier_total || 0), 0);
    return { label: date.toLocaleDateString('en', { weekday: 'short' }), value };
  });
  const chartMax = Math.max(1, ...chartDays.map(day => day.value));
  const chartPoints = chartDays.map((day, index) => `${20 + index * 60},${112 - (day.value / chartMax) * 92}`).join(' ');
  const accountStatus = profile?.status ?? 'pending';
  const accountStatusClass = accountStatus === 'approved'
    ? 'border-green-200 bg-green-50 text-green-800'
    : accountStatus === 'suspended'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-amber-200 bg-amber-50 text-amber-800';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 px-4 py-4 sm:px-6 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {profile?.avatar_url ? <img src={profile.avatar_url} className="h-10 w-10 rounded-full object-cover" alt="Supplier profile" /> : (
            <div className="w-10 h-10 bg-linear-to-br from-violet-600 to-indigo-700 rounded-full flex items-center justify-center">
              <span className="text-white font-black text-sm">MV</span>
            </div>
          )}
          <div>
            <p className="text-white font-black text-sm">Maestra Market · Supplier</p>
            {profile && <p className="text-xs text-gray-400">{profile.name}</p>}
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-red-300 text-sm font-semibold">
          <LogoutIco /> Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {accountStatus !== 'approved' && (
          <div className={`mb-5 rounded-xl border p-4 text-sm ${accountStatusClass}`}>
            <p className="font-semibold">Supplier account: {accountStatus}</p>
            <p className="mt-1">{accountStatus === 'suspended' ? 'Your supplier account is suspended. Contact support for help.' : 'Your supplier account is awaiting admin review. You can prepare products, but they will not go live until approved.'}</p>
          </div>
        )}

        <nav aria-label="Supplier dashboard sections" className="mb-6 flex max-w-full gap-2 overflow-x-auto border-b border-gray-200">
          {(['overview', 'products', 'orders', 'settings'] as const).map(section => (
            <button key={section} onClick={() => setActiveSection(section)} aria-current={activeSection === section ? 'page' : undefined}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold capitalize ${activeSection === section ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
              {section === 'settings' ? 'Account Settings' : section}
            </button>
          ))}
        </nav>

        {activeSection === 'overview' && (
          <section className="space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: 'Products', value: products.length },
                { label: 'Approved', value: approvedCount },
                { label: 'Pending review', value: pendingCount },
                { label: 'Completed sales', value: `Rs. ${totalSales.toLocaleString()}` },
              ].map(metric => <div key={metric.label} className="border border-gray-200 bg-white p-4">
                <p className="text-xs font-medium text-gray-500">{metric.label}</p>
                <p className="mt-2 text-xl font-bold text-gray-900">{metric.value}</p>
              </div>)}
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <section className="border border-gray-200 bg-white p-4 sm:p-5">
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 className="font-bold text-gray-900">Sales trend</h2>
                  <span className="text-xs text-gray-500">Last 7 days · completed/accepted orders</span>
                </div>
                <svg viewBox="0 0 400 145" role="img" aria-label="Supplier sales over the last 7 days" className="h-44 w-full overflow-visible">
                  {[20, 66, 112].map(y => <line key={y} x1="20" x2="380" y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="4 5" />)}
                  <polyline points={chartPoints} fill="none" stroke="#6d28d9" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                  {chartDays.map((day, index) => <g key={day.label + index}>
                    <circle cx={20 + index * 60} cy={112 - (day.value / chartMax) * 92} r="4" fill="#6d28d9" />
                    <text x={20 + index * 60} y="138" textAnchor="middle" fontSize="10" fill="#6b7280">{day.label}</text>
                  </g>)}
                </svg>
              </section>
              <section className="border border-gray-200 bg-white p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Recent orders</h2>
                  <button onClick={() => setActiveSection('orders')} className="text-xs font-semibold text-violet-700">All orders</button>
                </div>
                {orders.slice(0, 4).length === 0 ? <p className="py-8 text-center text-sm text-gray-500">No supplier orders yet.</p> : (
                  <div className="divide-y divide-gray-100">
                    {orders.slice(0, 4).map(order => <div key={order.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <div className="min-w-0"><p className="truncate font-medium text-gray-800">Order #{order.id.slice(0, 8)}</p><p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p></div>
                      <p className="shrink-0 font-semibold text-gray-900">Rs. {Number(order.supplier_total).toLocaleString()}</p>
                    </div>)}
                  </div>
                )}
              </section>
            </div>
          </section>
        )}

        {activeSection === 'products' && <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><h1 className="text-2xl font-black text-gray-900">My Products</h1><p className="mt-0.5 text-sm text-gray-500">New and edited products need admin approval.</p></div>
            <button onClick={openAddForm} className="flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-700"><PlusIco /> Add Product</button>
          </div>
        {loading ? (
          <p className="text-gray-400 text-center py-16">Loading your products...</p>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-100 text-center py-16">
            <p className="text-gray-400 mb-3">You haven't added any products yet</p>
            <button onClick={openAddForm} className="text-violet-600 font-semibold text-sm hover:underline">Add your first product →</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
                {p.images?.[0] && (
                  <img src={p.images[0]} className="w-full h-36 object-cover bg-gray-50" alt={p.name} loading="lazy" decoding="async" />
                )}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-gray-800 truncate flex-1">{p.name}</p>
                    <StatusBadge status={p.approval_status} />
                  </div>
                  <p className="text-sm font-bold text-violet-700 mb-1">Rs. {Number(p.price).toLocaleString()}</p>
                  {p.approval_status === 'rejected' && p.rejection_reason && (
                    <p className="text-xs text-red-500 mb-2">Reason: {p.rejection_reason}</p>
                  )}
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => openEditForm(p)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 py-2 rounded-lg">
                      <EditIco /> Edit
                    </button>
                    <button onClick={() => deleteProduct(p.id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg">
                      <TrashIco /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </section>}

        {activeSection === 'orders' && <section>
          <h1 className="mb-1 text-2xl font-black text-gray-900">Supplier Orders</h1>
          <p className="mb-5 text-sm text-gray-500">Only line items belonging to your supplier account are shown.</p>
          {orders.length === 0 ? <div className="border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">No orders for your products yet.</div> : (
            <div className="space-y-3">{orders.map(order => <article key={order.id} className="border border-gray-200 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-3">
                <div><h2 className="font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h2><p className="mt-1 text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p></div>
                <div className="text-right"><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold capitalize text-violet-700">{order.supplier_status || order.status.replaceAll('_', ' ')}</span><p className="mt-2 font-bold text-gray-900">Rs. {Number(order.supplier_total).toLocaleString()}</p></div>
              </div>
              {order.customer && <p className="py-3 text-sm text-gray-600">{order.customer.name} · {order.customer.phone} · {order.customer.city} · {order.customer.address}</p>}
              <div className="divide-y divide-gray-100">{order.items.map((item, index) => <div key={`${item.name}-${index}`} className="flex items-center gap-3 py-3">
                {item.image && <img src={item.image} alt="" className="h-12 w-12 rounded object-cover" />}
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-gray-900">{item.name}</p><p className="text-xs text-gray-500">Qty {item.quantity}</p></div>
                <p className="text-sm font-semibold">Rs. {(Number(item.price) * Number(item.quantity)).toLocaleString()}</p>
              </div>)}</div>
            </article>)}</div>
          )}
        </section>}

        {activeSection === 'settings' && <section className="max-w-2xl">
          <h1 className="mb-1 text-2xl font-black text-gray-900">Account Settings</h1>
          <p className="mb-6 text-sm text-gray-500">Update the profile details linked to your supplier account.</p>
          <div className="mb-6 flex items-center gap-4 border border-gray-200 bg-white p-4">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="Supplier profile" className="h-20 w-20 rounded-full object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-400">{profile?.name?.slice(0, 1).toUpperCase() || 'S'}</div>}
            <div><p className="font-semibold text-gray-900">Profile photo</p><p className="mb-2 text-xs text-gray-500">Image is compressed to 100KB or less.</p>
              <button type="button" onClick={() => profileFileInputRef.current?.click()} disabled={uploadingImage} className="rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{uploadingImage ? 'Uploading...' : 'Upload photo'}</button>
              <input ref={profileFileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onProfileImageChange} className="hidden" />
            </div>
          </div>
          <form onSubmit={saveProfile} className="space-y-4 border border-gray-200 bg-white p-4 sm:p-5">
            <label className="block text-sm font-medium text-gray-700">Full name<input required value={profileForm.name} onChange={event => setProfileForm({ ...profileForm, name: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5" /></label>
            <label className="block text-sm font-medium text-gray-700">Email<input disabled value={profile?.email ?? ''} className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-500" /></label>
            <label className="block text-sm font-medium text-gray-700">Phone<input required value={profileForm.phone} onChange={event => setProfileForm({ ...profileForm, phone: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5" /></label>
            <label className="block text-sm font-medium text-gray-700">Business address<input required value={profileForm.address} onChange={event => setProfileForm({ ...profileForm, address: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5" /></label>
            <label className="block text-sm font-medium text-gray-700">Website<input type="url" value={profileForm.website} onChange={event => setProfileForm({ ...profileForm, website: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5" /></label>
            {profileMessage && <p role="status" className="text-sm text-gray-600">{profileMessage}</p>}
            <button disabled={savingProfile} className="rounded-lg bg-violet-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{savingProfile ? 'Saving...' : 'Save settings'}</button>
          </form>
        </section>}
      </main>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeForm} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 text-gray-900">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-gray-900">{editingId ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={closeForm} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200">
                  <CloseIco />
                </button>
              </div>

              <form onSubmit={submitForm} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (Rs.)</label>
                    <input type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
                </div>

                <div>
                  <p className="mb-1.5 text-sm font-semibold text-gray-700">Product images</p>
                  <button type="button" onClick={triggerImagePicker} onDragOver={event => { event.preventDefault(); setDraggingImages(true); }}
                    onDragLeave={() => setDraggingImages(false)} onDrop={event => { event.preventDefault(); setDraggingImages(false); void addProductImages(Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'))); }}
                    className={`flex min-h-28 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-5 text-center transition ${draggingImages ? 'border-violet-600 bg-violet-50' : 'border-gray-300 bg-gray-50 hover:border-violet-400'}`}>
                    <span className="text-sm font-semibold text-gray-800">{uploadingImage ? 'Compressing and uploading...' : 'Choose images or drop them here'}</span>
                    <span className="text-xs text-gray-500">JPEG, PNG or WebP · each image compressed to 100KB max</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={onImageFileChange}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
                  {form.images && <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {form.images.split('\n').map(url => url.trim()).filter(Boolean).map((url, index) => <div key={`${url}-${index}`} className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                      <img src={url} alt={`Uploaded product ${index + 1}`} className="h-full w-full object-cover" />
                      <button type="button" aria-label={`Remove product image ${index + 1}`} onClick={() => setForm(current => ({ ...current, images: current.images.split('\n').map(item => item.trim()).filter(item => item && item !== url).join('\n') }))} className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white">×</button>
                    </div>)}
                  </div>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Colors (comma separated)</label>
                    <input value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })}
                      placeholder="Red, Blue, Black"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sizes (comma separated)</label>
                    <input value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })}
                      placeholder="S, M, L, XL"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button type="submit" disabled={saving}
                  className="w-full bg-violet-600 text-white py-3 rounded-2xl font-bold disabled:opacity-60">
                  {saving ? 'Saving...' : editingId ? 'Save Changes (sends for re-approval)' : 'Add Product (sends for approval)'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}