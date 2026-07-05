// components/admin/ProductsManager.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Product, ProductVariant } from '@/lib/supabase';
import ColorPicker from '@/components/ColorPicker';
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

// ── Variant Editor ──
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">Price Variants</p>
          <p className="text-xs text-gray-400">Give each size/color its own price &amp; stock.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={fillAllCombos} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700 transition whitespace-nowrap">Generate all combos</button>
          <button type="button" onClick={addVariant} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex items-center gap-1 whitespace-nowrap shadow-sm">
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
                <select value={v.size} onChange={e => update(v.id, { size: e.target.value })} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
                  <option value="">—</option>{sizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={v.color} onChange={e => update(v.id, { color: e.target.value })} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
                  <option value="">—</option>{colors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" min="0" value={v.price} onChange={e => update(v.id, { price: Number(e.target.value) })} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 w-full" placeholder="Price" />
                <input type="number" min="0" value={v.actual_price ?? ''} onChange={e => update(v.id, { actual_price: e.target.value ? Number(e.target.value) : null })} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 w-full" placeholder="Cost" />
                <input type="number" min="0" value={v.stock ?? ''} onChange={e => update(v.id, { stock: e.target.value ? Number(e.target.value) : null })} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 w-full" placeholder="Qty" />
                <button type="button" onClick={() => remove(v.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition"><TrashIcon /></button>
              </div>
            ))}
          </div>
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
    fetch('/api/categories').then(r => r.ok ? r.json() : []).then((data: any[]) => {
      if (Array.isArray(data) && data.length > 0) setDbCategories(data.filter(c => c.is_active).map(c => ({ label: c.label, value: c.value })));
    }).catch(() => {});
  }, []);
  const [festivalInfo, setFestivalInfo] = useState<{ enabled: boolean; label: string } | null>(null);
  useEffect(() => {
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(s => {
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
        tags, festival_tag: form.festival_tag || null,
        variants: cleanVariants, has_variants: cleanVariants.length > 0,
        cj_vid: form.sourcing === 'cj' ? (form.cj_vid || null) : null,
        hhc_product_id: form.sourcing === 'hhc' ? (form.hhc_product_id || null) : null,
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
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500"><TrashIcon /></button>
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
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.market_availability === opt.value ? 'border-violet-500 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' : 'border-gray-200 text-gray-600 hover:border-violet-300'}`}>
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
                  <span className="text-xs bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-2 py-0.5 rounded-full font-bold">LIVE: {festivalInfo.label || 'Festival active'}</span>
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

            <div className="border-2 border-gray-100 rounded-2xl p-4">
              <button type="button" onClick={() => setShowVariants(v => !v)} className="w-full flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <LayersIco />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Different price per size/color</p>
                  </div>
                </div>
                <span className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${showVariants ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showVariants ? 'translate-x-5' : ''}`} />
                </span>
              </button>
              {showVariants && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <VariantEditor variants={variants} setVariants={setVariants} sizes={sizeList} colors={form.colors} basePrice={form.price} baseActualPrice={form.actual_price} />
                </div>
              )}
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
              <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-2xl text-sm font-bold disabled:opacity-60">
                {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Main Products Manager ──
export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>();

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/products');
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
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Delete failed'); }
      fetchProducts();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Delete failed'); }
  };

  return (
    <div>
      {(showAddModal || editProduct) && (
        <ProductModal product={editProduct}
          onClose={() => { setShowAddModal(false); setEditProduct(undefined); }}
          onSaved={fetchProducts} />
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-gray-900">Products</h1>
        <button onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5">
          <PlusIcon /> Add Product
        </button>
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
                  {['Image','Name','Sell Price','Cost','Sourcing','Category','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-20 text-gray-400">
                    <p className="font-semibold">No products yet</p>
                    <button onClick={() => setShowAddModal(true)} className="mt-3 text-violet-600 underline text-sm font-medium">Add your first product</button>
                  </td></tr>
                ) : products.map(p => {
                  const ap = (p as any).actual_price;
                  const cjVid = (p as any).cj_vid;
                  const hhcId = (p as any).hhc_product_id;
                  return (
                    <tr key={p.id} className="hover:bg-violet-50/30 transition-colors">
                      <td className="px-4 py-3.5">
                        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100" /> : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">📦</div>}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-800 max-w-40"><p className="truncate">{p.name}</p></td>
                      <td className="px-4 py-3.5 font-bold text-violet-700 whitespace-nowrap">Rs. {Number(p.price).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{ap != null ? `Rs. ${Number(ap).toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-3.5">
                        {cjVid ? <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">CJ Linked</span>
                          : hhcId ? <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-semibold">HHC Linked</span>
                          : <span className="text-xs text-gray-300">Own Stock</span>}
                      </td>
                      <td className="px-4 py-3.5"><span className="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-semibold capitalize">{p.category}</span></td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-2">
                          <button onClick={() => setEditProduct(p)} className="text-violet-600 text-xs font-semibold bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1"><EditIcon /> Edit</button>
                          <button onClick={() => deleteItem(p.id)} className="text-red-500 text-xs font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1"><TrashIcon /> Delete</button>
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