'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Product, Order, Subscriber, Submission, ProductVariant } from '@/lib/supabase';
import ColorPicker from '@/components/ColorPicker';
import HomepageEditor from '@/components/admin/HomepageEditor';

type Tab         = 'products' | 'orders' | 'subscribers' | 'submissions' | 'homepage';
type OrderFilter = 'all' | 'new' | 'pending' | 'completed' | 'delivered';
const ORDER_STATUSES = ['new', 'pending', 'completed', 'delivered'] as const;
type OrderStatus = typeof ORDER_STATUSES[number];

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-blue-100 text-blue-700 border border-blue-200',
  pending:   'bg-amber-100 text-amber-700 border border-amber-200',
  completed: 'bg-green-100 text-green-700 border border-green-200',
  delivered: 'bg-teal-100 text-teal-700 border border-teal-200',
  read:      'bg-gray-100 text-gray-600 border border-gray-200',
  replied:   'bg-purple-100 text-purple-700 border border-purple-200',
};

const INPUT = 'w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-500 transition-colors bg-white';

const DEFAULT_TAGS = ['New Arrival', 'Best Seller', 'Limited Edition', 'Trending', 'Back in Stock', 'Exclusive'];

function sanitizeFileName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  const ext  = lastDot !== -1 ? fileName.slice(lastDot).toLowerCase() : '';
  const base = lastDot !== -1 ? fileName.slice(0, lastDot) : fileName;
  const safe = base
    .replace(/[^\x00-\x7F]/g, '_').replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'image';
  return `${safe}${ext}`;
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
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

// ── Icons ──────────────────────────────────────────────────────────────────────
function Ico({ d, cls = 'w-4 h-4' }: { d: string; cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}
function SpinnerIcon() {
  return <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />;
}
const RefreshIcon  = () => <Ico d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />;
const CloseIcon    = () => <Ico d="M6 18L18 6M6 6l12 12" />;
const UploadIcon   = () => <Ico cls="w-8 h-8 text-gray-300" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />;
const EditIcon     = () => <Ico cls="w-3.5 h-3.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />;
const TrashIcon    = () => <Ico cls="w-3.5 h-3.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />;
const LogoutIcon   = () => <Ico d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />;
const EmailIcon    = () => <Ico d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />;
const PlusIcon     = () => <Ico d="M12 4v16m8-8H4" />;
const ProductsIco  = () => <Ico d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />;
const OrdersIco    = () => <Ico d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />;
const SubsIco      = () => <Ico d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
const SubmitIco    = () => <Ico d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-6l-4 4v-4z" />;
const HomeIco      = () => <Ico d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />;
const FestIco      = () => <Ico d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />;
const TagIco       = () => <Ico cls="w-3.5 h-3.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 11V6a3 3 0 013-3z" />;
const LayersIco    = () => <Ico cls="w-3.5 h-3.5" d="M12 4l8 4-8 4-8-4 8-4zm0 8l8 4-8 4-8-4 8-4z" />;

// ══════════════════════════════════════════════════════════════
// VARIANT EDITOR — size + color → own price
// ══════════════════════════════════════════════════════════════
function VariantEditor({
  variants, setVariants, sizes, colors, basePrice, baseActualPrice,
}: {
  variants: ProductVariant[];
  setVariants: (v: ProductVariant[]) => void;
  sizes: string[];
  colors: string[];
  basePrice: string;
  baseActualPrice: string;
}) {
  const addVariant = () => {
    setVariants([...variants, {
      id: genId(),
      size: sizes[0] ?? '',
      color: colors[0] ?? '',
      price: Number(basePrice) || 0,
      actual_price: baseActualPrice ? Number(baseActualPrice) : null,
      stock: null,
    }]);
  };

  const update = (id: string, patch: Partial<ProductVariant>) =>
    setVariants(variants.map(v => v.id === id ? { ...v, ...patch } : v));

  const remove = (id: string) => setVariants(variants.filter(v => v.id !== id));

  const fillAllCombos = () => {
    if (sizes.length === 0 && colors.length === 0) return;
    const sizeList = sizes.length ? sizes : [''];
    const colorList = colors.length ? colors : [''];
    const combos: ProductVariant[] = [];
    for (const s of sizeList) {
      for (const c of colorList) {
        const existing = variants.find(v => v.size === s && v.color === c);
        combos.push(existing ?? {
          id: genId(), size: s, color: c,
          price: Number(basePrice) || 0,
          actual_price: baseActualPrice ? Number(baseActualPrice) : null,
          stock: null,
        });
      }
    }
    setVariants(combos);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">Price Variants</p>
          <p className="text-xs text-gray-400">Give each size/color its own price &amp; stock. Leave empty to use the base price for everything.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={fillAllCombos}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700 transition whitespace-nowrap">
            Generate all combos
          </button>
          <button type="button" onClick={addVariant}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition flex items-center gap-1 whitespace-nowrap">
            <PlusIcon /> Add row
          </button>
        </div>
      </div>

      {variants.length > 0 && (
        <div className="border-2 border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-0 bg-gray-50 text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-100">
            <span>Size</span><span>Color</span><span>Price</span><span>Cost</span><span>Stock</span><span></span>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {variants.map(v => (
              <div key={v.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-2 px-3 py-2 items-center">
                <select value={v.size} onChange={e => update(v.id, { size: e.target.value })}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
                  <option value="">—</option>
                  {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={v.color} onChange={e => update(v.id, { color: e.target.value })}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
                  <option value="">—</option>
                  {colors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" min="0" value={v.price}
                  onChange={e => update(v.id, { price: Number(e.target.value) })}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 w-full" placeholder="Price" />
                <input type="number" min="0" value={v.actual_price ?? ''}
                  onChange={e => update(v.id, { actual_price: e.target.value ? Number(e.target.value) : null })}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 w-full" placeholder="Cost" />
                <input type="number" min="0" value={v.stock ?? ''}
                  onChange={e => update(v.id, { stock: e.target.value ? Number(e.target.value) : null })}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 w-full" placeholder="Qty" />
                <button type="button" onClick={() => remove(v.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAG EDITOR — custom tags, pick from defaults or type your own
// ══════════════════════════════════════════════════════════════
function TagEditor({ tags, setTags }: { tags: string[]; setTags: (t: string[]) => void }) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (!clean || tags.includes(clean)) return;
    setTags([...tags, clean]);
    setInput('');
  };
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map(t => (
            <span key={t} className="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5">
              {t}
              <button type="button" onClick={() => removeTag(t)} className="text-violet-400 hover:text-violet-700">✕</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(input); } }}
          placeholder="Type a tag and press Enter" className={INPUT} />
        <button type="button" onClick={() => addTag(input)}
          className="px-4 rounded-xl bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700 font-semibold text-sm transition shrink-0">
          Add
        </button>
      </div>
      <div className="flex gap-1.5 mt-2 flex-wrap">
        {DEFAULT_TAGS.filter(t => !tags.includes(t)).map(t => (
          <button key={t} type="button" onClick={() => addTag(t)}
            className="px-2.5 py-1 bg-gray-100 hover:bg-violet-100 hover:text-violet-700 text-gray-500 rounded-lg text-xs font-medium transition">
            +{t}
          </button>
        ))}
      </div>
    </div>
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

  // Fetch categories from DB so product form stays in sync with HomepageEditor
  const [dbCategories, setDbCategories] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbCategories(data.filter(c => c.is_active).map(c => ({ label: c.label, value: c.value })));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch festival settings so "Festival Tag" dropdown can suggest the active festival
  const [festivalInfo, setFestivalInfo] = useState<{ enabled: boolean; label: string } | null>(null);
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(s => {
        if (s) setFestivalInfo({ enabled: !!s.festival_enabled, label: s.pk_festival_label || s.us_festival_label || '' });
      })
      .catch(() => {});
  }, []);

  // Fallback hardcoded categories
  const FALLBACK_CATS = [
    { label: 'Women', value: 'women' }, { label: 'Men', value: 'men' },
    { label: 'Kids', value: 'kids' }, { label: 'Kurta & Shalwar', value: 'kurta-shalwar' },
    { label: 'Dress', value: 'dress' }, { label: 'Tops', value: 'tops' },
    { label: 'Jeans & Pants', value: 'jeans-pants' }, { label: 'Shoes', value: 'shoes' },
    { label: 'Bags', value: 'bags' }, { label: 'Jewelry', value: 'jewelry' },
    { label: 'Accessories', value: 'accessories' }, { label: 'Winter', value: 'winter' },
    { label: 'Summer', value: 'summer' }, { label: 'Beauty', value: 'beauty' },
    { label: 'Sports', value: 'sports' }, { label: 'Home & Kitchen', value: 'home' },
    { label: 'Electronics', value: 'electronics' }, { label: 'Books', value: 'books' },
    { label: 'Sale', value: 'sale' },
  ];
  const CATEGORIES = dbCategories.length > 0 ? dbCategories : FALLBACK_CATS;

  const [form, setForm] = useState({
    name:                product?.name              ?? '',
    price:               product?.price?.toString() ?? '',
    actual_price:        (product as any)?.actual_price?.toString() ?? '',
    category:            product?.category          ?? 'women',
    description:         product?.description       ?? '',
    colors:              product?.colors            ?? [] as string[],
    sizes:               product?.sizes?.join(', ') ?? '',
    owner_type:          (product as any)?.owner_type ?? 'mestravibe' as 'mestravibe' | 'merchant',
    merchant_name:       (product as any)?.merchant_name ?? '',
    market_availability: (product as any)?.market_availability ?? 'both' as 'pk' | 'us' | 'both',
    festival_tag:        (product as any)?.festival_tag ?? '',
  });

  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants ?? []);
  const [showVariants, setShowVariants] = useState((product?.variants?.length ?? 0) > 0);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews,   setPreviews]   = useState<string[]>([]);
  const [error,      setError]      = useState<string>('');
  const [saving,     setSaving]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const split = (v: string) => v.split(',').map(s => s.trim()).filter(Boolean);
  const sizeList = split(form.sizes);

  const profit = form.price && form.actual_price
    ? Number(form.price) - Number(form.actual_price) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { setError('Name and price are required.'); return; }
    setSaving(true); setError('');
    try {
      let imageUrls: string[] = isEdit && imageFiles.length === 0 ? (product?.images ?? []) : [];
      for (const file of imageFiles) {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'x-file-name': `${Date.now()}_${sanitizeFileName(file.name)}`, 'x-file-type': file.type },
          body: file,
        });
        if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`);
        imageUrls.push((await res.json()).url);
      }
      const cleanVariants = showVariants ? variants.filter(v => v.size || v.color) : [];
      const payload = {
        name: form.name, price: Number(form.price),
        actual_price: form.actual_price ? Number(form.actual_price) : null,
        category: form.category, description: form.description,
        colors: form.colors, sizes: split(form.sizes), images: imageUrls,
        owner_type: form.owner_type,
        merchant_name: form.owner_type === 'merchant' ? form.merchant_name : null,
        market_availability: form.market_availability,
        tags,
        festival_tag: form.festival_tag || null,
        variants: cleanVariants,
        has_variants: cleanVariants.length > 0,
      };
      const res = await fetch(isEdit ? `/api/products/${product!.id}` : '/api/products', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const ct = res.headers.get('content-type');
      const data = ct?.includes('application/json') ? await res.json() : await res.text();
      if (!res.ok) throw new Error(typeof data === 'string' ? data : data?.error ?? data?.message ?? 'Save failed');
      alert(isEdit ? 'Product updated!' : 'Product added!');
      onSaved(); onClose();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

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
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500"><CloseIcon /></button>
          </div>
          <form onSubmit={submit} className="px-6 py-5 space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name <span className="text-red-400">*</span></label>
              <input name="name" value={form.name} onChange={handle} required placeholder="e.g. Floral Kurta" className={INPUT} />
            </div>

            {/* Ownership */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ownership</label>
              <div className="flex gap-3">
                {[{ value: 'mestravibe', label: '🏷️ MaestraVibe Owned' },{ value: 'merchant', label: '🏪 Merchant Product' }].map(opt => (
                  <label key={opt.value} className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${form.owner_type === opt.value ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-200'}`}>
                    <input type="radio" name="owner_type" value={opt.value} checked={form.owner_type === opt.value}
                      onChange={e => setForm(p => ({ ...p, owner_type: e.target.value as any }))} className="hidden" />
                    <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {form.owner_type === 'merchant' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Merchant Name</label>
                <input name="merchant_name" value={form.merchant_name} onChange={e => setForm(p => ({ ...p, merchant_name: e.target.value }))} placeholder="e.g. XYZ Store" className={INPUT} />
              </div>
            )}

            {/* Market */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Market Availability</label>
              <div className="flex gap-2">
                {[{ value: 'pk', label: '🇵🇰 Pakistan' },{ value: 'us', label: '🇺🇸 USA' },{ value: 'both', label: '🌍 Both' }].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setForm(p => ({ ...p, market_availability: opt.value as any }))}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.market_availability === opt.value ? 'border-violet-500 bg-violet-600 text-white' : 'border-gray-200 text-gray-600 hover:border-violet-300'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Festival */}
            <div className="bg-violet-50 border-2 border-violet-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FestIco />
                <label className="text-sm font-semibold text-gray-700">Festival Sale</label>
                {festivalInfo?.enabled && (
                  <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full font-bold">LIVE: {festivalInfo.label || 'Festival active'}</span>
                )}
              </div>
              <input name="festival_tag" value={form.festival_tag} onChange={handle}
                placeholder="e.g. eid, ramadan, black-friday — leave empty if not part of a festival sale"
                className={INPUT} />
              <p className="text-xs text-gray-500 mt-1.5">Match this to the festival category/slug set in Homepage → Festival Sale, so this product shows up in that promotion.</p>
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Selling Price (Rs.) <span className="text-red-400">*</span></label>
                <input name="price" type="number" min="0" value={form.price} onChange={handle} required placeholder="2500" className={INPUT} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cost Price (Rs.)</label>
                <input name="actual_price" type="number" min="0" value={form.actual_price} onChange={handle} placeholder="1500" className={INPUT} />
              </div>
            </div>
            {profit !== null && (
              <div className={`rounded-2xl px-4 py-3 flex items-center justify-between border ${profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Profit per item</p>
                  <p className={`text-xl font-black ${profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>{profit >= 0 ? '+' : ''}Rs. {profit.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500">Margin</p>
                  <p className={`text-lg font-black ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>{form.price ? Math.round((profit / Number(form.price)) * 100) : 0}%</p>
                </div>
              </div>
            )}

            {/* Category — DB se fetch hoti hai */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={handle} className={INPUT}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Select</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button key={c.value} type="button" onClick={() => setForm(p => ({ ...p, category: c.value }))}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${form.category === c.value ? 'bg-violet-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-600'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handle} rows={3} placeholder="Product description..." className={`${INPUT} resize-none`} />
            </div>

            {/* Custom Tags */}
            <TagEditor tags={tags} setTags={setTags} />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Colors</label>
              <ColorPicker selected={form.colors} onChange={colors => setForm(p => ({ ...p, colors }))} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sizes <span className="text-xs text-gray-400 font-normal">(comma separated)</span></label>
              <input name="sizes" value={form.sizes} onChange={handle} placeholder="S, M, L, XL, XXL" className={INPUT} />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {['XS','S','M','L','XL','XXL','XXXL','Free Size','36','38','40','42','44'].map(sz => (
                  <button key={sz} type="button"
                    onClick={() => { const c = form.sizes.split(',').map(s=>s.trim()).filter(Boolean); if (!c.includes(sz)) setForm(p => ({ ...p, sizes: [...c, sz].join(', ') })); }}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-violet-100 hover:text-violet-700 text-gray-500 rounded-lg text-xs font-medium transition">+{sz}</button>
                ))}
              </div>
            </div>

            {/* Multi-price variants toggle */}
            <div className="border-2 border-gray-100 rounded-2xl p-4">
              <button type="button" onClick={() => setShowVariants(v => !v)}
                className="w-full flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <LayersIco />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Different price per size/color</p>
                    <p className="text-xs text-gray-400">Useful when e.g. Large costs more than Small</p>
                  </div>
                </div>
                <span className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${showVariants ? 'bg-violet-600' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showVariants ? 'translate-x-5' : ''}`} />
                </span>
              </button>
              {showVariants && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <VariantEditor
                    variants={variants} setVariants={setVariants}
                    sizes={sizeList} colors={form.colors}
                    basePrice={form.price} baseActualPrice={form.actual_price}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Images {isEdit && <span className="text-xs text-gray-400 font-normal">(select new to replace)</span>}
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
                <UploadIcon /><span>Click to select images (multiple allowed)</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-violet-700 disabled:opacity-60 transition-all">
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
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500"><CloseIcon /></button>
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
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Items ({order.items?.length})</p>
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500"><CloseIcon /></button>
          </div>
          <form onSubmit={send} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject <span className="text-red-400">*</span></label>
              <input value={subject} onChange={e => setSubject(e.target.value)} required placeholder="e.g. New Arrivals — Summer Collection" className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message <span className="text-red-400">*</span></label>
              <textarea value={body} onChange={e => setBody(e.target.value)} required rows={8} placeholder="Write your message here..." className={`${INPUT} resize-none`} />
            </div>
            <div className="bg-gray-50 rounded-xl p-3 max-h-28 overflow-y-auto border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold mb-1">Recipients:</p>
              {subscribers.map(s => <p key={s.id} className="text-xs text-gray-600 py-0.5">{s.email}</p>)}
            </div>
            {result && (
              <div className={`text-sm px-4 py-3 rounded-xl border ${result.startsWith('Sent') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{result}</div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={sending} className="flex-1 bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-violet-700 disabled:opacity-60 flex items-center justify-center gap-2">
                <EmailIcon />{sending ? 'Sending...' : `Send to All (${subscribers.length})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, textColor }: { label: string; value: string; sub?: string; color: string; textColor?: string }) {
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
  const [sidebarOpen,    setSidebarOpen]    = useState(true);

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
    if (tab === 'homepage') return;
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

  useEffect(() => {
    fetchTab('products'); fetchTab('orders');
    fetchTab('subscribers'); fetchTab('submissions');
  }, [fetchTab]);

  useEffect(() => { fetchTab(activeTab); }, [activeTab, fetchTab]);

  const deleteItem = async (tab: Tab, id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/${tab}/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Delete failed'); }
      fetchTab(tab);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Delete failed'); }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      fetchTab('orders');
    } catch { alert('Failed to update status'); }
  };

  const updateSubmissionStatus = async (id: string, status: Submission['status']) => {
    try {
      await fetch('/api/submissions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
      fetchTab('submissions');
    } catch { alert('Failed to update status'); }
  };

  // Analytics
  const completedOrDelivered = orders.filter(o => ['completed','delivered'].includes(o.status));
  const totalSale     = completedOrDelivered.reduce((s, o) => s + Number(o.total), 0);
  const pendingOrders = orders.filter(o => o.status === 'new' || o.status === 'pending').length;
  const totalProfit   = completedOrDelivered.reduce((sum, order) => {
    return sum + order.items.reduce((iSum, item) => {
      const p    = products.find(p => p.id === (item as any).productId) || products.find(p => p.name === item.name);
      const cost = (p as any)?.actual_price ?? 0;
      return iSum + (item.price * item.quantity) - (cost * item.quantity);
    }, 0);
  }, 0);

  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
  const orderFilterCounts = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length; return acc;
  }, {} as Record<string, number>);

  // ── Sidebar nav — same shape/feel as Homepage CMS sidebar ──
  const NAV: { key: Tab; label: string; icon: React.ReactNode; desc: string; count?: number }[] = [
    { key: 'products',    label: 'Products',    icon: <ProductsIco />, desc: 'Catalog & inventory', count: products.length    },
    { key: 'orders',      label: 'Orders',      icon: <OrdersIco />,   desc: 'Sales & fulfillment', count: orders.length      },
    { key: 'subscribers', label: 'Subscribers', icon: <SubsIco />,     desc: 'Newsletter list',     count: subscribers.length },
    { key: 'submissions', label: 'Submissions', icon: <SubmitIco />,   desc: 'Contact & careers',   count: submissions.length },
    { key: 'homepage',    label: 'Homepage',    icon: <HomeIco />,     desc: 'Site CMS' },
  ];

  return (
    <>
      {(showAddModal || editProduct) && (
        <ProductModal product={editProduct}
          onClose={() => { setShowAddModal(false); setEditProduct(undefined); }}
          onSaved={() => fetchTab('products')} />
      )}
      {viewOrder      && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(undefined)} />}
      {showEmailModal && <BulkEmailModal subscribers={subscribers} onClose={() => setShowEmailModal(false)} />}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50/30">

        {/* Top Nav */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl flex items-center justify-center shadow-md shadow-violet-200">
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
                  className="bg-violet-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-violet-700 transition-all shadow-sm shadow-violet-200 flex items-center gap-1.5">
                  <PlusIcon /> Add Product
                </button>
              )}
              {activeTab === 'subscribers' && subscribers.length > 0 && (
                <button onClick={() => setShowEmailModal(true)}
                  className="bg-violet-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-violet-700 transition-all shadow-sm flex items-center gap-1.5">
                  <EmailIcon /> Bulk Email
                </button>
              )}
              {activeTab !== 'homepage' && (
                <button onClick={() => { fetchTab(activeTab); }}
                  className="px-4 py-2 rounded-xl text-sm bg-white border-2 border-gray-200 text-gray-500 hover:bg-gray-50 font-semibold transition flex items-center gap-2">
                  <RefreshIcon /> Refresh
                </button>
              )}
              <button onClick={logout}
                className="px-4 py-2 text-sm text-gray-500 hover:text-red-500 border-2 border-gray-200 hover:border-red-200 rounded-xl bg-white transition-all font-semibold flex items-center gap-1.5">
                <LogoutIcon /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">

          {/* Stats — only meaningful outside homepage, but kept visible everywhere for consistency */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Revenue"  value={`Rs. ${totalSale.toLocaleString()}`}    sub={`${completedOrDelivered.length} completed orders`} color="bg-green-50 border-green-200"   textColor="text-green-700" />
            <StatCard label="Total Profit"   value={`Rs. ${totalProfit.toLocaleString()}`}  sub={totalSale > 0 ? `${Math.round((totalProfit/totalSale)*100)}% margin` : 'No sales yet'}   color="bg-violet-50 border-violet-200" textColor="text-violet-700" />
            <StatCard label="Pending Orders" value={String(pendingOrders)}                  sub={`${orders.length} total orders`}                   color="bg-amber-50 border-amber-200"   textColor="text-amber-700" />
            <StatCard label="Products"       value={String(products.length)}                sub={`${subscribers.length} subscribers`}               color="bg-blue-50 border-blue-200"     textColor="text-blue-700" />
          </div>

          {/* ── DASHBOARD SHELL: dark sidebar + content card, consistent for every tab ── */}
          <div className="flex rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden min-h-[640px] bg-white">

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} shrink-0 bg-gray-900 flex flex-col transition-all duration-200`}>
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
                <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center shrink-0">
                  <ProductsIco />
                </div>
                {sidebarOpen && <span className="text-white font-black text-sm">Store CMS</span>}
                <button onClick={() => setSidebarOpen(p => !p)} className="ml-auto text-gray-400 hover:text-white transition-colors">
                  <Ico d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} cls="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 py-3 space-y-0.5 px-2">
                {NAV.map(item => {
                  const active = activeTab === item.key;
                  return (
                    <button key={item.key} onClick={() => setActiveTab(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                        active ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}>
                      <span className="shrink-0">{item.icon}</span>
                      {sidebarOpen && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold truncate">{item.label}</span>
                            {item.count !== undefined && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-violet-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                {item.count}
                              </span>
                            )}
                          </div>
                          <span className={`text-xs truncate ${active ? 'text-violet-200' : 'text-gray-600'}`}>{item.desc}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>

              {sidebarOpen && (
                <div className="px-4 py-4 border-t border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Pending Orders</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-900 text-amber-400">{pendingOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Products</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-gray-800 text-gray-300">{products.length}</span>
                  </div>
                </div>
              )}
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-6">

              {/* Order sub-filters */}
              {activeTab === 'orders' && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {(['all', ...ORDER_STATUSES] as const).map(f => (
                    <button key={f} onClick={() => setOrderFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${orderFilter === f ? 'bg-gray-900 text-white' : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {f === 'all' ? `All (${orders.length})` : `${f} (${orderFilterCounts[f] ?? 0})`}
                    </button>
                  ))}
                </div>
              )}

              {/* ══ HOMEPAGE TAB ══ */}
              {activeTab === 'homepage' && (
                <div className="rounded-2xl overflow-hidden bg-white -m-6">
                  <HomepageEditor />
                </div>
              )}

              {/* Data Table card */}
              {activeTab !== 'homepage' && (
                <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
                  {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <SpinnerIcon /><p className="text-sm font-medium mt-3">Loading...</p>
                    </div>
                  )}
                  {error && (
                    <div className="p-5 text-red-600 bg-red-50 border-b border-red-100 text-sm flex items-center gap-2 font-medium">
                      <span className="font-bold">Error:</span> {error}
                    </div>
                  )}
                  {!loading && !error && (
                    <div className="overflow-x-auto">

                      {/* PRODUCTS */}
                      {activeTab === 'products' && (
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b-2 border-gray-100">
                            <tr>
                              {['Image','Name','Sell Price','Cost','Profit / Item','Category','Tags','Festival','Variants','Colors','Sizes','Actions'].map(h => (
                                <th key={h} className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {products.length === 0 ? (
                              <tr><td colSpan={12} className="text-center py-20 text-gray-400">
                                <p className="font-semibold">No products yet</p>
                                <button onClick={() => setShowAddModal(true)} className="mt-3 text-violet-600 underline text-sm font-medium">Add your first product</button>
                              </td></tr>
                            ) : products.map(p => {
                              const ap = (p as any).actual_price;
                              const itemProfit = ap != null ? p.price - ap : null;
                              return (
                                <tr key={p.id} className="hover:bg-violet-50/30 transition-colors">
                                  <td className="px-4 py-3.5">
                                    {p.images?.[0]
                                      ? <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                                      : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">📦</div>
                                    }
                                  </td>
                                  <td className="px-4 py-3.5 font-semibold text-gray-800 max-w-40"><p className="truncate">{p.name}</p></td>
                                  <td className="px-4 py-3.5 font-bold text-violet-700 whitespace-nowrap">Rs. {Number(p.price).toLocaleString()}</td>
                                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                                    {ap != null ? `Rs. ${Number(ap).toLocaleString()}` : <span className="text-gray-300">—</span>}
                                  </td>
                                  <td className="px-4 py-3.5 whitespace-nowrap">
                                    {itemProfit !== null ? (
                                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${itemProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                        {itemProfit >= 0 ? '+' : ''}Rs. {itemProfit.toLocaleString()}
                                      </span>
                                    ) : <span className="text-gray-300 text-xs">—</span>}
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <span className="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-semibold capitalize">{p.category}</span>
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <div className="flex gap-1 flex-wrap max-w-32">
                                      {(p.tags ?? []).slice(0, 2).map((t, i) => (
                                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">{t}</span>
                                      ))}
                                      {(p.tags?.length ?? 0) > 2 && <span className="text-xs text-gray-400">+{p.tags!.length - 2}</span>}
                                      {(!p.tags || p.tags.length === 0) && <span className="text-gray-300 text-xs">—</span>}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3.5">
                                    {p.festival_tag
                                      ? <span className="text-xs bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">🎉 {p.festival_tag}</span>
                                      : <span className="text-gray-300 text-xs">—</span>}
                                  </td>
                                  <td className="px-4 py-3.5">
                                    {p.has_variants && p.variants?.length
                                      ? <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">{p.variants.length} variants</span>
                                      : <span className="text-gray-300 text-xs">—</span>}
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <div className="flex gap-1 flex-wrap">
                                      {p.colors?.slice(0, 5).map((c, i) => (
                                        <span key={i} className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 inline-block" style={{ backgroundColor: c }} title={c} />
                                      ))}
                                      {(p.colors?.length ?? 0) > 5 && <span className="text-xs text-gray-400 self-center">+{p.colors!.length - 5}</span>}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3.5 text-gray-500 text-xs max-w-xs"><p className="truncate">{p.sizes?.join(', ') || '—'}</p></td>
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
                                <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-600">Total: {products.length}</td>
                                <td className="px-4 py-3">
                                  <span className="text-sm font-black text-violet-700">
                                    Avg profit: Rs. {Math.round(
                                      products.filter(p => (p as any).actual_price)
                                        .reduce((s, p) => s + (p.price - ((p as any).actual_price ?? 0)), 0) /
                                      (products.filter(p => (p as any).actual_price).length || 1)
                                    ).toLocaleString()}
                                  </span>
                                </td>
                                <td colSpan={7} />
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      )}

                      {/* ORDERS */}
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
                              <tr><td colSpan={9} className="text-center py-16 text-gray-400"><p className="font-semibold">No orders</p></td></tr>
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
                                  <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                                    className="text-xs border-2 border-gray-200 rounded-xl px-2 py-1.5 text-gray-800 focus:outline-none focus:border-violet-400 bg-white font-medium">
                                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                                  </select>
                                </td>
                                <td className="px-3 py-3.5">
                                  <div className="flex gap-1.5">
                                    <button onClick={() => setViewOrder(o)} className="text-blue-600 hover:text-blue-800 text-xs font-semibold bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">Details</button>
                                    <button onClick={() => deleteItem('orders', o.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1"><TrashIcon /> Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          {filteredOrders.length > 0 && (
                            <tfoot className="bg-green-50 border-t-2 border-green-100">
                              <tr>
                                <td colSpan={3} className="px-3 py-3 text-sm font-bold text-gray-600">{orderFilter === 'all' ? 'All' : orderFilter}: {filteredOrders.length}</td>
                                <td className="px-3 py-3"><span className="text-sm font-black text-green-700">Rs. {filteredOrders.reduce((s, o) => s + Number(o.total), 0).toLocaleString()}</span></td>
                                <td colSpan={5} />
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      )}

                      {/* SUBSCRIBERS */}
                      {activeTab === 'subscribers' && (
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b-2 border-gray-100">
                            <tr>{['#','Email','Subscribed At','Actions'].map(h => <th key={h} className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>)}</tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {subscribers.length === 0 ? (
                              <tr><td colSpan={4} className="text-center py-16 text-gray-400"><p className="font-semibold">No subscribers yet</p></td></tr>
                            ) : subscribers.map((s, i) => (
                              <tr key={s.id} className="hover:bg-violet-50/30 transition-colors">
                                <td className="px-4 py-3.5 text-gray-400 text-xs font-bold">{i + 1}</td>
                                <td className="px-4 py-3.5 font-semibold text-gray-800">{s.email}</td>
                                <td className="px-4 py-3.5 text-gray-500 text-xs">{new Date(s.subscribed_at).toLocaleDateString('en-PK', { year:'numeric', month:'short', day:'numeric' })}</td>
                                <td className="px-4 py-3.5">
                                  <button onClick={() => deleteItem('subscribers', s.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                                    <TrashIcon /> Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {/* SUBMISSIONS */}
                      {activeTab === 'submissions' && (
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b-2 border-gray-100">
                            <tr>{['Name','Email','Type','Subject','Status','Date','Actions'].map(h => <th key={h} className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>)}</tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {submissions.length === 0 ? (
                              <tr><td colSpan={7} className="text-center py-16 text-gray-400"><p className="font-semibold">No submissions yet</p></td></tr>
                            ) : submissions.map(s => (
                              <tr key={s.id} className="hover:bg-violet-50/30 transition-colors">
                                <td className="px-4 py-3.5 font-semibold text-gray-800">{s.name}</td>
                                <td className="px-4 py-3.5 text-gray-600 text-xs">{s.email}</td>
                                <td className="px-4 py-3.5"><span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">{s.type}</span></td>
                                <td className="px-4 py-3.5 text-gray-500 text-xs max-w-xs"><p className="truncate">{s.subject || '—'}</p></td>
                                <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
                                <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{new Date(s.created_at).toLocaleDateString('en-PK', { year:'numeric', month:'short', day:'numeric' })}</td>
                                <td className="px-4 py-3.5 flex gap-2">
                                  {s.status === 'new' && <button onClick={() => updateSubmissionStatus(s.id, 'read')} className="text-blue-600 text-xs font-semibold bg-blue-50 px-2.5 py-1.5 rounded-lg transition">Mark Read</button>}
                                  {s.status === 'read' && <button onClick={() => updateSubmissionStatus(s.id, 'replied')} className="text-violet-600 text-xs font-semibold bg-violet-50 px-2.5 py-1.5 rounded-lg transition">Mark Replied</button>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
