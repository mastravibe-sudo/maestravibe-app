// components/admin/ProductsManager.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Product, ProductVariant } from '@/lib/supabase';
import ColorPicker from '@/components/ColorPicker';
import { adminFetch } from '@/lib/admin-fetch';
import {
  INPUT, sanitizeFileName, genId, SpinnerIcon,
  UploadIcon, EditIcon, TrashIcon, PlusIcon, FestIco, LayersIco,
} from './shared';

// ── Tag Editor ──
const DEFAULT_TAGS = ['New Arrival', 'Best Seller', 'Limited Edition', 'Trending', 'Back in Stock', 'Exclusive'];

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

// ── Small inline icons used only by the variant editor ──
const ChevronIco = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
);
const GridIco = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
);
const AlertIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);

// ── Variant Editor — Shopify-style: one card per variant ──
function VariantEditor({
  variants, setVariants, sizes, colors, basePrice, baseActualPrice,
}: {
  variants: ProductVariant[]; setVariants: (v: ProductVariant[]) => void;
  sizes: string[]; colors: string[]; basePrice: string; baseActualPrice: string;
}) {
  const addVariant = () => {
    setVariants([...variants, {
      id: genId(), size: sizes[0] ?? '', color: colors[0] ?? '',
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
    for (const s of sizeList) for (const c of colorList) {
      const existing = variants.find(v => v.size === s && v.color === c);
      combos.push(existing ?? { id: genId(), size: s, color: c, price: Number(basePrice) || 0, actual_price: baseActualPrice ? Number(baseActualPrice) : null, stock: null });
    }
    setVariants(combos);
  };

  // Detect duplicate size+color combos so the admin can spot conflicts at a glance
  const comboCounts = variants.reduce<Record<string, number>>((acc, v) => {
    const key = `${v.size}__${v.color}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const isDupe = (v: ProductVariant) => (comboCounts[`${v.size}__${v.color}`] ?? 0) > 1;

  const prices = variants.map(v => v.price).filter(p => Number.isFinite(p) && p > 0);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-bold text-gray-800">Variants</p>
          <p className="text-xs text-gray-400 mt-0.5">Give each size / color its own price, cost &amp; stock.</p>
          {minPrice !== null && (
            <p className="text-xs font-semibold text-violet-600 mt-1">
              {minPrice === maxPrice ? `Rs. ${minPrice.toLocaleString()}` : `Rs. ${minPrice.toLocaleString()} – Rs. ${maxPrice!.toLocaleString()}`}
              <span className="text-gray-400 font-normal"> · {variants.length} variant{variants.length !== 1 ? 's' : ''}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={fillAllCombos}
            disabled={sizes.length === 0 && colors.length === 0}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
            <GridIco /> Generate all combos
          </button>
          <button type="button" onClick={addVariant}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center gap-1.5 shadow-sm shadow-violet-200 hover:shadow-md hover:shadow-violet-300 transition-all active:scale-95">
            <PlusIcon /> Add variant
          </button>
        </div>
      </div>

      {variants.length === 0 ? (
        <div className="border-2 border-dashed border-violet-100 bg-violet-50/40 rounded-2xl py-8 flex flex-col items-center gap-2 text-center px-4">
          <LayersIco />
          <p className="text-sm font-semibold text-gray-600">No variants yet</p>
          <p className="text-xs text-gray-400 max-w-xs">Add a variant manually, or generate every size × color combo in one click.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[26rem] overflow-y-auto pr-1 -mr-1">
          {variants.map((v, idx) => (
            <div key={v.id}
              className={`relative rounded-2xl border-2 p-3.5 transition-all duration-300 animate-[fadeIn_0.25s_ease] ${isDupe(v) ? 'border-red-200 bg-red-50/50' : 'border-gray-100 bg-white hover:border-violet-200'}`}>

              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Variant {idx + 1}</span>
                <div className="flex items-center gap-2">
                  {isDupe(v) && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-red-500">
                      <AlertIco /> Duplicate combo
                    </span>
                  )}
                  <button type="button" onClick={() => remove(v.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <TrashIcon />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Size</label>
                  <select value={v.size} onChange={e => update(v.id, { size: e.target.value })}
                    className="w-full text-sm border-2 border-gray-100 rounded-xl px-2.5 py-2 bg-white focus:border-violet-300 focus:outline-none transition-colors">
                    <option value="">—</option>{sizes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Color</label>
                  <select value={v.color} onChange={e => update(v.id, { color: e.target.value })}
                    className="w-full text-sm border-2 border-gray-100 rounded-xl px-2.5 py-2 bg-white focus:border-violet-300 focus:outline-none transition-colors">
                    <option value="">—</option>{colors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">Rs.</span>
                    <input type="number" min="0" value={v.price} onChange={e => update(v.id, { price: Number(e.target.value) })}
                      className="w-full text-sm border-2 border-gray-100 rounded-xl pl-8 pr-2 py-2 focus:border-violet-300 focus:outline-none transition-colors" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Cost</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">Rs.</span>
                    <input type="number" min="0" value={v.actual_price ?? ''} onChange={e => update(v.id, { actual_price: e.target.value ? Number(e.target.value) : null })}
                      className="w-full text-sm border-2 border-gray-100 rounded-xl pl-8 pr-2 py-2 focus:border-violet-300 focus:outline-none transition-colors" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Stock</label>
                  <input type="number" min="0" value={v.stock ?? ''} onChange={e => update(v.id, { stock: e.target.value ? Number(e.target.value) : null })}
                    className="w-full text-sm border-2 border-gray-100 rounded-xl px-2.5 py-2 focus:border-violet-300 focus:outline-none transition-colors" placeholder="Qty" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Product Modal ──
function ProductModal({ product, onClose, onSaved }: { product?: Product; onClose: () => void; onSaved: () => void; }) {
  const isEdit = !!product;
  const [dbCategories, setDbCategories] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    adminFetch('/api/categories').then(r => r.ok ? r.json() : []).then((data: any[]) => {
      if (Array.isArray(data) && data.length > 0) setDbCategories(data.filter(c => c.is_active).map(c => ({ label: c.label, value: c.value })));
    }).catch(() => {});
  }, []);
  const [festivalInfo, setFestivalInfo] = useState<{ enabled: boolean; label: string } | null>(null);
  useEffect(() => {
    adminFetch('/api/settings').then(r => r.ok ? r.json() : null).then(s => {
      if (s) setFestivalInfo({ enabled: !!s.festival_enabled, label: s.pk_festival_label || s.us_festival_label || '' });
    }).catch(() => {});
  }, []);

  const FALLBACK_CATS = [
    { label: 'Women', value: 'women' }, { label: 'Men', value: 'men' }, { label: 'Kids', value: 'kids' },
    { label: 'Kurta & Shalwar', value: 'kurta-shalwar' }, { label: 'Dress', value: 'dress' }, { label: 'Tops', value: 'tops' },
    { label: 'Jeans & Pants', value: 'jeans-pants' }, { label: 'Shoes', value: 'shoes' }, { label: 'Bags', value: 'bags' },
    { label: 'Jewelry', value: 'jewelry' }, { label: 'Accessories', value: 'accessories' }, { label: 'Winter', value: 'winter' },
    { label: 'Summer', value: 'summer' }, { label: 'Beauty', value: 'beauty' }, { label: 'Sports', value: 'sports' },
    { label: 'Home & Kitchen', value: 'home' }, { label: 'Electronics', value: 'electronics' }, { label: 'Books', value: 'books' },
    { label: 'Sale', value: 'sale' },
  ];
  const CATEGORIES = dbCategories.length > 0 ? dbCategories : FALLBACK_CATS;

  const [form, setForm] = useState({
    name: product?.name ?? '',
    price: product?.price?.toString() ?? '',
    actual_price: (product as any)?.actual_price?.toString() ?? '',
    category: product?.category ?? 'women',
    description: product?.description ?? '',
    colors: product?.colors ?? [] as string[],
    sizes: product?.sizes?.join(', ') ?? '',
    owner_type: (product as any)?.owner_type ?? 'mestravibe' as 'mestravibe' | 'merchant',
    merchant_name: (product as any)?.merchant_name ?? '',
    market_availability: (product as any)?.market_availability ?? 'both' as 'pk' | 'us' | 'both',
    festival_tag: (product as any)?.festival_tag ?? '',
    cj_vid: (product as any)?.cj_vid ?? '',
    hhc_product_id: (product as any)?.hhc_product_id ?? '',
    sourcing: (product as any)?.cj_vid ? 'cj' : (product as any)?.hhc_product_id ? 'hhc' : 'none' as 'none' | 'cj' | 'hhc',
  });

  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants ?? []);
  const [showVariants, setShowVariants] = useState((product?.variants?.length ?? 0) > 0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
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
  const profit = form.price && form.actual_price ? Number(form.price) - Number(form.actual_price) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { setError('Name and price are required.'); return; }
    setSaving(true); setError('');
    try {
      let imageUrls: string[] = isEdit && imageFiles.length === 0 ? (product?.images ?? []) : [];
      for (const file of imageFiles) {
        const res = await adminFetch('/api/upload', {
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
        tags, festival_tag: form.festival_tag || null,
        variants: cleanVariants, has_variants: cleanVariants.length > 0,
        cj_vid: form.sourcing === 'cj' ? (form.cj_vid || null) : null,
        hhc_product_id: form.sourcing === 'hhc' ? (form.hhc_product_id || null) : null,
      };
      const res = await adminFetch(isEdit ? `/api/products/${product!.id}` : '/api/products', {
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
        <div className="bg-white rounded-none md:rounded-3xl shadow-2xl w-full max-w-lg h-full md:h-auto max-h-full md:max-h-[92vh] overflow-y-auto border border-gray-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
            <div>
              <h2 className="text-lg font-black text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{isEdit ? 'Changes will be saved' : 'Will appear in your store'}</p>
            </div>
            <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500"><TrashIcon /></button>
          </div>
          <form onSubmit={submit} className="px-6 py-5 space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name <span className="text-red-400">*</span></label>
              <input name="name" value={form.name} onChange={handle} required placeholder="e.g. Floral Kurta" className={INPUT} />
            </div>

            {/* Sourcing / Supplier */}
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Sourcing</label>
              <div className="flex gap-2 mb-3">
                {[
                  { value: 'none', label: 'Own Stock' },
                  { value: 'cj', label: 'CJ Dropshipping' },
                  { value: 'hhc', label: 'HHC Dropshipping' },
                ].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setForm(p => ({ ...p, sourcing: opt.value as any }))}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.sourcing === opt.value ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-200 text-gray-600 bg-white'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {form.sourcing === 'cj' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">CJ Product Variant ID (vid)</label>
                  <input name="cj_vid" value={form.cj_vid} onChange={handle}
                    placeholder="e.g. 92511400-C758-4474-93CA-66D442F5F787"
                    className={INPUT} />
                  <p className="text-xs text-gray-500 mt-1">Copy this from the product page on CJ Dropshipping.</p>
                </div>
              )}
              {form.sourcing === 'hhc' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">HHC Product ID</label>
                  <input name="hhc_product_id" value={form.hhc_product_id} onChange={handle}
                    placeholder="Product ID from HHC Dropshipping"
                    className={INPUT} />
                  <p className="text-xs text-gray-500 mt-1">Used for manual order reference (HHC does not support auto-submit yet).</p>
                </div>
              )}
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
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.market_availability === opt.value ? 'border-violet-500 bg-gradient-to-r from-violet-600 to-indigo-600 text-white' : 'border-gray-200 text-gray-600 hover:border-violet-300'}`}>
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
                  <span className="text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">LIVE: {festivalInfo.label || 'Festival active'}</span>
                )}
              </div>
              <input name="festival_tag" value={form.festival_tag} onChange={handle}
                placeholder="e.g. eid, ramadan, black-friday"
                className={INPUT} />
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={handle} className={INPUT}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handle} rows={3} placeholder="Product description..." className={`${INPUT} resize-none`} />
            </div>

            <TagEditor tags={tags} setTags={setTags} />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Colors</label>
              <ColorPicker selected={form.colors} onChange={colors => setForm(p => ({ ...p, colors }))} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sizes <span className="text-xs text-gray-400 font-normal">(comma separated)</span></label>
              <input name="sizes" value={form.sizes} onChange={handle} placeholder="S, M, L, XL, XXL" className={INPUT} />
            </div>

            {/* ── Variant pricing toggle — redesigned: bigger, high-contrast, animated ── */}
            <div className={`rounded-2xl border-2 transition-colors duration-300 ${showVariants ? 'border-violet-200 bg-violet-50/40' : 'border-gray-100'}`}>
              <button type="button" onClick={() => setShowVariants(v => !v)}
                className="w-full flex items-center justify-between text-left px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${showVariants ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <LayersIco />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Different price per size / color</p>
                    <p className="text-xs text-gray-400 mt-0.5">Turn on for Shopify-style variant pricing &amp; stock</p>
                  </div>
                </div>

                <span
                  role="switch"
                  aria-checked={showVariants}
                  className={`w-14 h-7 rounded-full relative transition-colors duration-300 shrink-0 ring-2 ring-offset-1 ${showVariants ? 'bg-gradient-to-r from-violet-600 to-indigo-600 ring-violet-200' : 'bg-gray-200 ring-gray-100'}`}
                >
                  <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ease-out ${showVariants ? 'translate-x-7' : ''}`} />
                </span>
              </button>

              <div className={`grid transition-all duration-300 ease-out ${showVariants ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1 border-t border-violet-100">
                    <VariantEditor variants={variants} setVariants={setVariants} sizes={sizeList} colors={form.colors} basePrice={form.price} baseActualPrice={form.actual_price} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Images</label>
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
                <UploadIcon /><span>Click to select images</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-2xl text-sm font-bold disabled:opacity-60">
                {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Approval status badge — pending/approved/rejected, same visual language as
// the Suppliers page. Products without an approval_status (e.g. products
// created directly by admin) are treated as 'approved' for display.
function ApprovalBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const map = {
    approved: 'bg-green-100 text-green-700',
    pending:  'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

// ── Main Products Manager ──
export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>();
  // Approval filter — kept separate from supplier account approval (see
  // SuppliersManager). Defaults to 'all' so existing product management
  // behavior (seeing every product) doesn't change unless the admin filters.
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // ?all=1 is required so pending/rejected supplier-submitted products
      // are visible here too, not just approved ones. The API only honors
      // this flag for an admin session (see /api/products GET).
      const res = await adminFetch('/api/products?all=1', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error loading data');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await adminFetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Delete failed'); }
      fetchProducts();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Delete failed'); }
  };

  // Approve/reject a product. This is intentionally independent of supplier
  // account approval — approving a product here never touches the
  // supplier's account status, and vice versa.
  // Approve/reject a product. This is intentionally independent of supplier
  // account approval — approving a product here never touches the
  // supplier's account status, and vice versa.
  //
  // NOTE: the rejection-reason prompt() is now INSIDE the try/catch. If it
  // was called before the try block, a blocked/failing dialog (common in
  // sandboxed iframe previews) would throw silently and the whole action
  // would appear to do nothing — no error, no update. Wrapping it fixes that.
  const setApprovalStatus = async (id: string, approval_status: 'approved' | 'rejected') => {
    setActioningId(id);
    try {
      let rejection_reason: string | undefined;
      if (approval_status === 'rejected') {
        rejection_reason = window.prompt('Reason for rejection (optional):') ?? undefined;
      }
      const res = await adminFetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approval_status, rejection_reason }),
      });
      const ct = res.headers.get('content-type');
      const data = ct?.includes('application/json') ? await res.json() : await res.text();
      if (!res.ok) throw new Error(typeof data === 'string' ? data : data?.error ?? data?.message ?? 'Failed to update status');
      await fetchProducts();
    } catch (err: unknown) {
      console.error('Approval status update failed:', err);
      alert(err instanceof Error ? err.message : 'Could not update approval status. Please try again.');
    } finally { setActioningId(null); }
  };

  // Owner split — a product belongs to a supplier if it has a supplier_id
  // or owner_type === 'merchant'; everything else is the admin's own stock.
  const isSupplierProduct = (p: Product) => !!(p as any).supplier_id || (p as any).owner_type === 'merchant';

  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine' | 'suppliers'>('all');

  const approvalCounts = {
    all: products.length,
    pending: products.filter(p => ((p as any).approval_status ?? 'approved') === 'pending').length,
    approved: products.filter(p => ((p as any).approval_status ?? 'approved') === 'approved').length,
    rejected: products.filter(p => ((p as any).approval_status ?? 'approved') === 'rejected').length,
  };

  const ownerCounts = {
    all: products.length,
    mine: products.filter(p => !isSupplierProduct(p)).length,
    suppliers: products.filter(p => isSupplierProduct(p)).length,
  };

  const visibleProducts = products
    .filter(p => approvalFilter === 'all' || ((p as any).approval_status ?? 'approved') === approvalFilter)
    .filter(p => ownerFilter === 'all' || (ownerFilter === 'mine' ? !isSupplierProduct(p) : isSupplierProduct(p)));

  return (
    <div>
      {(showAddModal || editProduct) && (
        <ProductModal product={editProduct}
          onClose={() => { setShowAddModal(false); setEditProduct(undefined); }}
          onSaved={fetchProducts} />
      )}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-xl font-black text-gray-900">Products</h1>
        <button onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5">
          <PlusIcon /> Add Product
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        {([
          { key: 'all', label: 'All Products' },
          { key: 'mine', label: 'My Products' },
          { key: 'suppliers', label: 'Supplier Products' },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setOwnerFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              ownerFilter === f.key ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>
            {f.label} <span className="opacity-70">({ownerCounts[f.key]})</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setApprovalFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
              approvalFilter === f ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>
            {f} <span className="opacity-70">({approvalCounts[f]})</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <SpinnerIcon /><p className="text-sm font-medium mt-3">Loading...</p>
          </div>
        )}
        {error && <div className="p-5 text-red-600 bg-red-50 border-b border-red-100 text-sm font-medium">Error: {error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-100 sticky top-0 z-10">
                <tr>
                  {['Image','Name','Sell Price','Cost','Sourcing','Category','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visibleProducts.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-20 text-gray-400">
                    <p className="font-semibold">
                      No products found for this filter
                    </p>
                    {approvalFilter === 'all' && ownerFilter === 'all' && (
                      <button onClick={() => setShowAddModal(true)} className="mt-3 text-violet-600 underline text-sm font-medium">Add your first product</button>
                    )}
                  </td></tr>
                ) : visibleProducts.map(p => {
                  const ap = (p as any).actual_price;
                  const cjVid = (p as any).cj_vid;
                  const hhcId = (p as any).hhc_product_id;
                  const variantCount = (p as any).variants?.length ?? 0;
                  const approvalStatus: 'pending' | 'approved' | 'rejected' = (p as any).approval_status ?? 'approved';
                  return (
                    <tr key={p.id} className="hover:bg-violet-50/30 transition-colors">
                      <td className="px-4 py-3.5">
                        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100" /> : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">📦</div>}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-800 max-w-40">
                        <p className="truncate">{p.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isSupplierProduct(p) ? (
                            <span className="text-[11px] text-amber-600 font-semibold">
                              Supplier{(p as any).merchant_name ? `: ${(p as any).merchant_name}` : ''}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">My Product</span>
                          )}
                          {variantCount > 0 && <span className="text-[11px] text-violet-500 font-semibold">· {variantCount} variants</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-violet-700 whitespace-nowrap">Rs. {Number(p.price).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{ap != null ? `Rs. ${Number(ap).toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-3.5">
                        {cjVid ? <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">CJ Linked</span>
                          : hhcId ? <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-semibold">HHC Linked</span>
                          : <span className="text-xs text-gray-300">Own Stock</span>}
                      </td>
                      <td className="px-4 py-3.5"><span className="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-semibold capitalize">{p.category}</span></td>
                      <td className="px-4 py-3.5">
                        <ApprovalBadge status={approvalStatus} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex gap-2">
                            <button onClick={() => setEditProduct(p)} className="text-violet-600 text-xs font-semibold bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1"><EditIcon /> Edit</button>
                            <button onClick={() => deleteItem(p.id)} className="text-red-500 text-xs font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1"><TrashIcon /> Delete</button>
                          </div>
                          {approvalStatus === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => setApprovalStatus(p.id, 'approved')} disabled={actioningId === p.id}
                                className="flex-1 text-green-700 text-xs font-semibold bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50">Approve</button>
                              <button onClick={() => setApprovalStatus(p.id, 'rejected')} disabled={actioningId === p.id}
                                className="flex-1 text-red-500 text-xs font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50">Reject</button>
                            </div>
                          )}
                          {approvalStatus === 'approved' && (
                            <button onClick={() => setApprovalStatus(p.id, 'rejected')} disabled={actioningId === p.id}
                              className="text-red-500 text-xs font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50">Reject</button>
                          )}
                          {approvalStatus === 'rejected' && (
                            <button onClick={() => setApprovalStatus(p.id, 'approved')} disabled={actioningId === p.id}
                              className="text-green-700 text-xs font-semibold bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50">Approve</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}