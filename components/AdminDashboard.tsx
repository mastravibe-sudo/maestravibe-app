'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Product, Order, Subscriber, Submission } from '@/lib/supabase';
import ColorPicker from '@/components/ColorPicker';

type Tab         = 'products' | 'orders' | 'subscribers' | 'submissions';
type OrderFilter = 'all' | 'new' | 'pending' | 'completed' | 'delivered';
const ORDER_STATUSES = ['new', 'pending', 'completed', 'delivered'] as const;
type OrderStatus = typeof ORDER_STATUSES[number];

const CATEGORIES = [
  { label: 'Women',          value: 'women'         },
  { label: 'Men',            value: 'men'           },
  { label: 'Kids',           value: 'kids'          },
  { label: 'Kurta & Shalwar',value: 'kurta-shalwar' },
  { label: 'Dress',          value: 'dress'         },
  { label: 'Tops',           value: 'tops'          },
  { label: 'Jeans & Pants',  value: 'jeans-pants'   },
  { label: 'Shoes',          value: 'shoes'         },
  { label: 'Bags',           value: 'bags'          },
  { label: 'Jewelry',        value: 'jewelry'       },
  { label: 'Accessories',    value: 'accessories'   },
  { label: 'Winter',         value: 'winter'        },
  { label: 'Summer',         value: 'summer'        },
  { label: 'Beauty',         value: 'beauty'        },
  { label: 'Sports',         value: 'sports'        },
  { label: 'Home & Kitchen', value: 'home'          },
  { label: 'Electronics',    value: 'electronics'   },
  { label: 'Books',          value: 'books'         },
  { label: 'Sale',           value: 'sale'          },
];

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-blue-100 text-blue-700 border border-blue-200',
  pending:   'bg-amber-100 text-amber-700 border border-amber-200',
  completed: 'bg-green-100 text-green-700 border border-green-200',
  delivered: 'bg-teal-100 text-teal-700 border border-teal-200',
  read:      'bg-gray-100 text-gray-600 border border-gray-200',
  replied:   'bg-purple-100 text-purple-700 border border-purple-200',
};

const INPUT = 'w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-500 transition-colors bg-white';

// ── Fix: sanitize filename to ASCII-only before using in HTTP header ──────────
function sanitizeFileName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  const ext  = lastDot !== -1 ? fileName.slice(lastDot).toLowerCase() : '';
  const base = lastDot !== -1 ? fileName.slice(0, lastDot) : fileName;
  const safe = base
    .replace(/[^\x00-\x7F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    || 'image';
  return `${safe}${ext}`;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function SpinnerIcon() {
  return (
    <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
  );
}
function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
function EmailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
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
    name:         product?.name              ?? '',
    price:        product?.price?.toString() ?? '',
    actual_price: (product as any)?.actual_price?.toString() ?? '',
    category:     product?.category          ?? 'women',
    description:  product?.description       ?? '',
    colors:       product?.colors            ?? [] as string[],
    sizes:        product?.sizes?.join(', ') ?? '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews,   setPreviews]   = useState<string[]>(product?.images ?? []);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImageFiles(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const split = (v: string) => v.split(',').map(s => s.trim()).filter(Boolean);

  const profit = form.price && form.actual_price
    ? Number(form.price) - Number(form.actual_price)
    : null;

   const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.price) {
      setError('Name and price are required.');
      return;
    }

    // ← Edit ke liye zaroori safety check
    if (isEdit && !product?.id) {
      setError('Product ID not found. Please refresh and try again.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const imageUrls: string[] = isEdit && imageFiles.length === 0
        ? (product?.images ?? [])
        : [];

      // New images upload karo
      for (const file of imageFiles) {
        const safeName  = sanitizeFileName(file.name);
        const uniqueName = `${Date.now()}_${safeName}`;

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'x-file-name': uniqueName,
            'x-file-type': file.type,
          },
          body: file,
        });

        // ✅ FIX: Safely parse JSON response
        let d: any;
        try {
          d = await res.json();
        } catch {
          const text = await res.text();
          throw new Error(`Upload error: ${text || 'Unknown error'}`);
        }

        if (!res.ok) throw new Error(d.message ?? 'Upload failed');
        imageUrls.push(d.url);
      }

      const payload = {
        name:         form.name,
        price:        Number(form.price),
        actual_price: form.actual_price ? Number(form.actual_price) : null,
        category:     form.category,
        description:  form.description,
        colors:       form.colors,
        sizes:        split(form.sizes),
        images:       imageUrls,
      };

      const url = isEdit 
        ? `/api/products/${product!.id}` 
        : '/api/products';

      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // ✅ FIX: Safely parse JSON response
      let data: any;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        throw new Error(`API error: ${text || 'Unknown error'}`);
      }

      if (!res.ok) {
        throw new Error(data.message || 'Save failed');
      }

      onSaved(); 
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      console.error("Save Error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-gray-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
            <div>
              <h2 className="text-lg font-black text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{isEdit ? 'Changes will be saved' : 'Will appear in your store'}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
              <CloseIcon />
            </button>
          </div>
          <form onSubmit={submit} className="px-6 py-5 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name <span className="text-red-400">*</span></label>
              <input name="name" value={form.name} onChange={handle} required placeholder="e.g. Floral Kurta" className={INPUT} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Selling Price (Rs.) <span className="text-red-400">*</span></label>
                <input name="price" type="number" min="0" value={form.price} onChange={handle} required placeholder="2500" className={INPUT} />
                <p className="text-xs text-gray-400 mt-1">Price shown to customers</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cost Price (Rs.)</label>
                <input name="actual_price" type="number" min="0" value={form.actual_price} onChange={handle} placeholder="1500" className={INPUT} />
                <p className="text-xs text-gray-400 mt-1">Your purchase cost</p>
              </div>
            </div>

            {/* Live profit preview */}
            {profit !== null && (
              <div className={`rounded-2xl px-4 py-3 flex items-center justify-between border ${profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Profit per item</p>
                  <p className={`text-xl font-black ${profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {profit >= 0 ? '+' : ''}Rs. {profit.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500">Margin</p>
                  <p className={`text-lg font-black ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {form.price ? Math.round((profit / Number(form.price)) * 100) : 0}%
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={handle} className={INPUT}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Select Category</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button key={c.value} type="button"
                    onClick={() => setForm(p => ({ ...p, category: c.value }))}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                      form.category === c.value
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-600'
                    }`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handle} rows={3}
                placeholder="Product description..." className={`${INPUT} resize-none`} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Colors</label>
              <ColorPicker selected={form.colors} onChange={colors => setForm(p => ({ ...p, colors }))} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Sizes <span className="text-xs text-gray-400 font-normal">(comma separated)</span>
              </label>
              <input name="sizes" value={form.sizes} onChange={handle} placeholder="S, M, L, XL, XXL" className={INPUT} />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {['XS','S','M','L','XL','XXL','XXXL','Free Size','36','38','40','42','44'].map(sz => (
                  <button key={sz} type="button"
                    onClick={() => {
                      const current = form.sizes.split(',').map(s => s.trim()).filter(Boolean);
                      if (!current.includes(sz)) setForm(p => ({ ...p, sizes: [...current, sz].join(', ') }));
                    }}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-violet-100 hover:text-violet-700 text-gray-500 rounded-lg text-xs font-medium transition">
                    +{sz}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Images {isEdit && <span className="text-xs text-gray-400 font-normal">(select new to replace, or leave to keep existing)</span>}
              </label>
              {previews.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-6 flex flex-col items-center gap-2 text-sm text-gray-400 hover:border-violet-300 hover:text-violet-400 transition-colors">
                <UploadIcon />
                <span>Click to select images (multiple allowed)</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-violet-700 disabled:opacity-60 transition-all active:scale-[0.98]">
                {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
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
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-gray-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
            <div>
              <h2 className="text-lg font-black text-gray-900">Order Details</h2>
              <p className="text-xs text-gray-400 mt-0.5">{fmt(order.created_at)}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
              <CloseIcon />
            </button>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-center gap-3">
              <StatusBadge status={order.status} />
              <span className="text-xs text-gray-400 ml-auto font-mono">#{order.id?.slice(0, 8)}</span>
            </div>
            <div className="bg-violet-50 rounded-2xl p-4 space-y-2 border border-violet-100">
              <p className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-3">Customer Info</p>
              {[
                { label: 'Name',    value: order.customer?.name    },
                { label: 'Phone',   value: order.customer?.phone   },
                { label: 'Email',   value: order.customer?.email   },
                { label: 'City',    value: order.customer?.city    },
                { label: 'Area',    value: order.customer?.area    },
                { label: 'Address', value: order.customer?.address },
              ].filter(f => f.value).map(f => (
                <div key={f.label} className="flex gap-2 text-sm">
                  <span className="text-gray-500 w-16 shrink-0 font-medium">{f.label}:</span>
                  <span className="text-gray-800">{f.value}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Items ({order.items?.length})
              </p>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 border-2 border-gray-100 rounded-2xl p-3">
                    {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                        {item.selectedColor && item.selectedSize && ' · '}
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-violet-700">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
              <span className="font-bold text-gray-700">Total Amount</span>
              <span className="text-2xl font-black text-green-700">Rs. {Number(order.total).toLocaleString()}</span>
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
  const [body,    setBody]    = useState('');
  const [sending, setSending] = useState(false);
  const [result,  setResult]  = useState<string | null>(null);

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
      setResult(`Sent to ${d.sent} subscribers successfully!`);
    } catch (err: unknown) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Send failed'}`);
    } finally { setSending(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-gray-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
            <div>
              <h2 className="text-lg font-black text-gray-900">Send Bulk Email</h2>
              <p className="text-xs text-gray-400 mt-0.5">Will be sent to {subscribers.length} subscribers</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
              <CloseIcon />
            </button>
          </div>
          <form onSubmit={send} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject <span className="text-red-400">*</span></label>
              <input value={subject} onChange={e => setSubject(e.target.value)} required
                placeholder="e.g. New Arrivals — Summer Collection 2025" className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message <span className="text-red-400">*</span></label>
              <textarea value={body} onChange={e => setBody(e.target.value)} required rows={8}
                placeholder="Write your message here..." className={`${INPUT} resize-none`} />
            </div>
            <div className="bg-gray-50 rounded-xl p-3 max-h-28 overflow-y-auto border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold mb-1">Recipients:</p>
              {subscribers.map(s => (
                <p key={s.id} className="text-xs text-gray-600 py-0.5">{s.email}</p>
              ))}
            </div>
            {result && (
              <div className={`text-sm px-4 py-3 rounded-xl border ${result.startsWith('Sent') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {result}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={sending}
                className="flex-1 bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-violet-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                <EmailIcon />
                {sending ? 'Sending...' : `Send to All (${subscribers.length})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, textColor }: {
  label: string; value: string; sub?: string; color: string; textColor?: string;
}) {
  return (
    <div className={`rounded-2xl p-5 border ${color} flex flex-col gap-1`}>
      <p className={`text-2xl font-black ${textColor ?? 'text-gray-900'}`}>{value}</p>
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [activeTab,      setActiveTab]      = useState<Tab>('products');
  const [orderFilter,    setOrderFilter]    = useState<OrderFilter>('all');
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [editProduct,    setEditProduct]    = useState<Product | undefined>();
  const [viewOrder,      setViewOrder]      = useState<Order | undefined>();
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [products,    setProducts]    = useState<Product[]>([]);
  const [orders,      setOrders]      = useState<Order[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const logout = async () => {
    await fetch('/api/admin-login', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  const fetchTab = useCallback(async (tab: Tab) => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`/api/${tab}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error loading data');
      const rows = Array.isArray(data) ? data : [];
      if (tab === 'products')    setProducts(rows);
      if (tab === 'orders')      setOrders(rows);
      if (tab === 'subscribers') setSubscribers(rows);
      if (tab === 'submissions') setSubmissions(rows);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  // Load all tabs once for stats
  useEffect(() => {
    fetchTab('products');
    fetchTab('orders');
    fetchTab('subscribers');
    fetchTab('submissions');
  }, [fetchTab]);

  useEffect(() => { fetchTab(activeTab); }, [activeTab, fetchTab]);

  const deleteItem = async (tab: Tab, id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const res = await fetch(`/api/${tab}/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Delete failed'); }
      fetchTab(tab);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Delete failed'); }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchTab('orders');
    } catch { alert('Failed to update status'); }
  };

  const updateSubmissionStatus = async (id: string, status: Submission['status']) => {
    try {
      await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchTab('submissions');
    } catch { alert('Failed to update status'); }
  };

  // ── Analytics ─────────────────────────────────────────────
  const completedOrDelivered = orders.filter(o => ['completed', 'delivered'].includes(o.status));
  const totalSale     = completedOrDelivered.reduce((s, o) => s + Number(o.total), 0);
  const pendingOrders = orders.filter(o => o.status === 'new' || o.status === 'pending').length;
  const totalProfit   = completedOrDelivered.reduce((sum, order) => {
    return sum + order.items.reduce((iSum, item) => {
      const product = products.find(p => p.id === (item as any).productId) || products.find(p => p.name === item.name);
      const cost    = (product as any)?.actual_price ?? 0;
      return iSum + (item.price * item.quantity) - (cost * item.quantity);
    }, 0);
  }, 0);

  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
  const orderFilterCounts = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const tabs = [
    { key: 'products'    as Tab, label: 'Products',    count: products.length    },
    { key: 'orders'      as Tab, label: 'Orders',      count: orders.length      },
    { key: 'subscribers' as Tab, label: 'Subscribers', count: subscribers.length },
    { key: 'submissions' as Tab, label: 'Submissions', count: submissions.length },
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
      {viewOrder      && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(undefined)} />}
      {showEmailModal && <BulkEmailModal subscribers={subscribers} onClose={() => setShowEmailModal(false)} />}

      <div className="min-h-screen bg-linear-to-br from-gray-50 to-violet-50/30">

        {/* Top Nav */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-violet-600 to-violet-800 rounded-2xl flex items-center justify-center shadow-md shadow-violet-200">
                <span className="text-white font-black text-sm">MV</span>
              </div>
              <div>
                <h1 className="text-lg font-black text-gray-900 leading-none">Admin Dashboard</h1>
                <p className="text-xs text-gray-400 mt-0.5">MaestraVibe Store Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === 'products' && (
                <button onClick={() => setShowAddModal(true)}
                  className="bg-violet-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-violet-700 transition-all active:scale-[0.98] shadow-sm shadow-violet-200 flex items-center gap-1.5">
                  <PlusIcon /> Add Product
                </button>
              )}
              {activeTab === 'subscribers' && subscribers.length > 0 && (
                <button onClick={() => setShowEmailModal(true)}
                  className="bg-violet-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-violet-700 transition-all shadow-sm flex items-center gap-1.5">
                  <EmailIcon /> Bulk Email
                </button>
              )}
              <button onClick={logout}
                className="px-4 py-2 text-sm text-gray-500 hover:text-red-500 border-2 border-gray-200 hover:border-red-200 rounded-xl bg-white transition-all font-semibold flex items-center gap-1.5">
                <LogoutIcon /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Revenue" value={`Rs. ${totalSale.toLocaleString()}`}
              sub={`${completedOrDelivered.length} completed orders`}
              color="bg-green-50 border-green-200" textColor="text-green-700" />
            <StatCard label="Total Profit" value={`Rs. ${totalProfit.toLocaleString()}`}
              sub={totalSale > 0 ? `${Math.round((totalProfit / totalSale) * 100)}% margin` : 'No sales yet'}
              color="bg-violet-50 border-violet-200" textColor="text-violet-700" />
            <StatCard label="Pending Orders" value={String(pendingOrders)}
              sub={`${orders.length} total orders`}
              color="bg-amber-50 border-amber-200" textColor="text-amber-700" />
            <StatCard label="Products" value={String(products.length)}
              sub={`${subscribers.length} subscribers`}
              color="bg-blue-50 border-blue-200" textColor="text-blue-700" />
          </div>

          {/* Order status quick-view */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ORDER_STATUSES.map(s => (
              <div key={s} className="bg-white rounded-2xl border-2 border-gray-100 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-semibold capitalize">{s}</p>
                  <p className="text-xl font-black text-gray-800">{orderFilterCounts[s] ?? 0}</p>
                </div>
                <StatusBadge status={s} />
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === t.key
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                    : 'bg-white text-gray-600 hover:bg-violet-50 border-2 border-gray-200'
                }`}>
                <span>{t.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === t.key ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{t.count}</span>
              </button>
            ))}
            <button
              onClick={() => { fetchTab(activeTab); fetchTab('orders'); fetchTab('products'); }}
              className="ml-auto px-4 py-2.5 rounded-xl text-sm bg-white border-2 border-gray-200 text-gray-500 hover:bg-gray-50 font-semibold transition flex items-center gap-2">
              <RefreshIcon /> Refresh
            </button>
          </div>

          {/* Order sub-filters */}
          {activeTab === 'orders' && (
            <div className="flex gap-2 flex-wrap">
              {(['all', ...ORDER_STATUSES] as const).map(f => (
                <button key={f} onClick={() => setOrderFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    orderFilter === f
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {f === 'all' ? `All (${orders.length})` : `${f} (${orderFilterCounts[f] ?? 0})`}
                </button>
              ))}
            </div>
          )}

          {/* Data Table */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <SpinnerIcon />
                <p className="text-sm font-medium mt-3">Loading...</p>
              </div>
            )}
            {error && (
              <div className="p-5 text-red-600 bg-red-50 border-b border-red-100 text-sm flex items-center gap-2 font-medium">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            {!loading && !error && (
              <div className="overflow-x-auto">

                {/* ── PRODUCTS ── */}
                {activeTab === 'products' && (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b-2 border-gray-100">
                      <tr>
                        {['Image','Name','Sell Price','Cost','Profit / Item','Category','Colors','Sizes','Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.length === 0 ? (
                        <tr><td colSpan={9} className="text-center py-20 text-gray-400">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <p className="font-semibold">No products yet</p>
                          <button onClick={() => setShowAddModal(true)} className="mt-3 text-violet-600 underline text-sm font-medium">Add your first product</button>
                        </td></tr>
                      ) : products.map(p => {
                        const ap         = (p as any).actual_price;
                        const itemProfit = ap != null ? p.price - ap : null;
                        return (
                          <tr key={p.id} className="hover:bg-violet-50/30 transition-colors">
                            <td className="px-4 py-3.5">
                              {p.images?.[0]
                                ? <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                                : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  </div>
                              }
                            </td>
                            <td className="px-4 py-3.5 font-semibold text-gray-800 max-w-40">
                              <p className="truncate">{p.name}</p>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-violet-700 whitespace-nowrap">
                              Rs. {Number(p.price).toLocaleString()}
                            </td>
                            <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                              {ap != null ? `Rs. ${Number(ap).toLocaleString()}` : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              {itemProfit !== null ? (
                                <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' + (itemProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                                  {itemProfit >= 0 ? '+' : ''}Rs. {itemProfit.toLocaleString()}
                                </span>
                              ) : <span className="text-gray-300 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-semibold capitalize">
                                {CATEGORIES.find(c => c.value === p.category)?.label ?? p.category}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex gap-1 flex-wrap">
                                {p.colors?.slice(0, 5).map((c, i) => (
                                  <span key={i} className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 inline-block" style={{ backgroundColor: c }} title={c} />
                                ))}
                                {(p.colors?.length ?? 0) > 5 && <span className="text-xs text-gray-400 self-center">+{p.colors!.length - 5}</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-gray-500 text-xs max-w-30">
                              <p className="truncate">{p.sizes?.join(', ') || '—'}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex gap-2">
                                <button onClick={() => setEditProduct(p)}
                                  className="text-violet-600 hover:text-violet-800 text-xs font-semibold bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1 whitespace-nowrap">
                                  <EditIcon /> Edit
                                </button>
                                <button onClick={() => deleteItem('products', p.id)}
                                  className="text-red-500 hover:text-red-700 text-xs font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1 whitespace-nowrap">
                                  <TrashIcon /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {products.length > 0 && (
                      <tfoot className="bg-violet-50 border-t-2 border-violet-100">
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-600">
                            Total Products: {products.length}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-black text-violet-700">
                              Avg profit: Rs. {Math.round(
                                products.filter(p => (p as any).actual_price)
                                  .reduce((s, p) => s + (p.price - ((p as any).actual_price ?? 0)), 0) /
                                (products.filter(p => (p as any).actual_price).length || 1)
                              ).toLocaleString()}
                            </span>
                          </td>
                          <td colSpan={4} />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                )}

                {/* ── ORDERS ── */}
                {activeTab === 'orders' && (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b-2 border-gray-100">
                      <tr>
                        {['Customer','Phone','City','Total','Items','Date','Status','Update Status','Actions'].map(h => (
                          <th key={h} className="text-left px-3 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredOrders.length === 0 ? (
                        <tr><td colSpan={9} className="text-center py-16 text-gray-400">
                          <p className="font-semibold">No orders in this filter</p>
                        </td></tr>
                      ) : filteredOrders.map(o => (
                        <tr key={o.id} className="hover:bg-violet-50/30 transition-colors">
                          <td className="px-3 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{o.customer?.name}</td>
                          <td className="px-3 py-3.5 text-gray-600 whitespace-nowrap">{o.customer?.phone}</td>
                          <td className="px-3 py-3.5 text-gray-600">{o.customer?.city}</td>
                          <td className="px-3 py-3.5 font-bold text-violet-700 whitespace-nowrap">Rs. {Number(o.total).toLocaleString()}</td>
                          <td className="px-3 py-3.5 text-gray-500 text-center">{o.items?.length ?? 0}</td>
                          <td className="px-3 py-3.5 text-gray-400 text-xs whitespace-nowrap">{fmt(o.created_at)}</td>
                          <td className="px-3 py-3.5"><StatusBadge status={o.status} /></td>
                          <td className="px-3 py-3.5">
                            <select value={o.status}
                              onChange={e => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                              className="text-xs border-2 border-gray-200 rounded-xl px-2 py-1.5 text-gray-800 focus:outline-none focus:border-violet-400 bg-white font-medium">
                              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex gap-1.5">
                              <button onClick={() => setViewOrder(o)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-semibold bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">
                                Details
                              </button>
                              <button onClick={() => deleteItem('orders', o.id)}
                                className="text-red-500 hover:text-red-700 text-xs font-semibold bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1">
                                <TrashIcon /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {filteredOrders.length > 0 && (
                      <tfoot className="bg-green-50 border-t-2 border-green-100">
                        <tr>
                          <td colSpan={3} className="px-3 py-3 text-sm font-bold text-gray-600">
                            {orderFilter === 'all' ? 'All Orders' : `${orderFilter} orders`}: {filteredOrders.length}
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm font-black text-green-700">
                              Rs. {filteredOrders.reduce((s, o) => s + Number(o.total), 0).toLocaleString()}
                            </span>
                          </td>
                          <td colSpan={5} />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                )}

                {/* ── SUBSCRIBERS ── */}
                {activeTab === 'subscribers' && (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b-2 border-gray-100">
                      <tr>
                        {['#','Email','Subscribed At','Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {subscribers.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-16 text-gray-400">
                          <p className="font-semibold">No subscribers yet</p>
                        </td></tr>
                      ) : subscribers.map((s, i) => (
                        <tr key={s.id} className="hover:bg-violet-50/30 transition-colors">
                          <td className="px-4 py-3.5 text-gray-400 text-xs font-bold">{i + 1}</td>
                          <td className="px-4 py-3.5 font-semibold text-gray-800">{s.email}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">
                            {new Date(s.subscribed_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => deleteItem('subscribers', s.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                              <TrashIcon /> Remove
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
                    <thead className="bg-gray-50 border-b-2 border-gray-100">
                      <tr>
                        {['Name','Email','Type','Subject','Status','Date','Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {submissions.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                          <p className="font-semibold">No submissions yet</p>
                        </td></tr>
                      ) : submissions.map(s => (
                        <tr key={s.id} className="hover:bg-violet-50/30 transition-colors">
                          <td className="px-4 py-3.5 font-semibold text-gray-800">{s.name}</td>
                          <td className="px-4 py-3.5 text-gray-600 text-xs">{s.email}</td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">{s.type}</span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs max-w-37.5">
                            <p className="truncate">{s.subject || '—'}</p>
                          </td>
                          <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
                          <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                            {new Date(s.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-4 py-3.5 flex gap-2">
                            {s.status === 'new' && (
                              <button onClick={() => updateSubmissionStatus(s.id, 'read')}
                                className="text-blue-600 hover:text-blue-800 text-xs font-semibold bg-blue-50 px-2.5 py-1.5 rounded-lg transition">
                                Mark Read
                              </button>
                            )}
                            {s.status === 'read' && (
                              <button onClick={() => updateSubmissionStatus(s.id, 'replied')}
                                className="text-violet-600 hover:text-violet-800 text-xs font-semibold bg-violet-50 px-2.5 py-1.5 rounded-lg transition">
                                Mark Replied
                              </button>
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

