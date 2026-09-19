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
  id: string; name: string; email: string; status: string;
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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ FIX: cache: 'no-store' added to both fetches — the underlying route
  // is now also marked `export const dynamic = 'force-dynamic'`, but this
  // is a defensive belt-and-braces so the browser/CDN never serves a stale
  // approval status after the admin flips it.
  const loadProfile = useCallback(() => {
    fetch('/api/supplier/me', { cache: 'no-store' }).then(r => r.json()).then(setProfile).catch(() => {});
  }, []);

  const loadProducts = useCallback(() => {
    fetch('/api/supplier/products', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadProfile(); loadProducts(); }, [loadProfile, loadProducts]);

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const uploadImageFile = async (file: File) => {
    try {
      setUploadingImage(true);
      setUploadError('');

      const compressed = await compressImage(file, { maxSizeKB: 150, outputType: 'image/webp' });
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-file-name': compressed.name,
          'x-file-type': compressed.type,
        },
        body: compressed,
      });

      if (!uploadRes.ok) {
        const body = await uploadRes.text();
        throw new Error(body || 'Upload failed');
      }

      const { url } = await uploadRes.json();
      const existing = form.images.split('\n').map(s => s.trim()).filter(Boolean);
      setForm({ ...form, images: [...existing, url].join('\n') });
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const onImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadImageFile(file);
    event.target.value = '';
  };

  const triggerImagePicker = () => fileInputRef.current?.click();

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

  const isPendingAccount = profile && profile.status !== 'approved';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">MV</span>
          </div>
          <div>
            <p className="text-white font-black text-sm">Supplier Panel</p>
            {profile && <p className="text-xs text-gray-400">{profile.name}</p>}
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-red-300 text-sm font-semibold">
          <LogoutIco /> Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {isPendingAccount && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 mb-6">
            <p className="font-semibold mb-1">⏳ Account pending approval</p>
            <p>Your supplier account is awaiting admin review. You can still add products, but nothing will go live until your account and products are approved.</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Products</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your inventory. New and edited products need admin approval before going live.</p>
          </div>
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            <PlusIco /> Add Product
          </button>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image URLs (one per line)</label>
                  <textarea value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} rows={3}
                    placeholder="https://example.com/image1.jpg"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 font-mono text-xs" />
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <button type="button" onClick={triggerImagePicker}
                      className="inline-flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-xs font-semibold transition">
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <span className="text-xs text-gray-500">or paste image URLs above.</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onImageFileChange}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
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