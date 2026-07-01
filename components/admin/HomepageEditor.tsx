'use client';
// components/admin/HomepageEditor.tsx — FULL DASHBOARD REDESIGN

import { useCallback, useEffect, useRef, useState } from 'react';

// ── Icons ────────────────────────────────────────────
function Ico({ d, cls = 'w-4 h-4' }: { d: string; cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}
const SaveIco      = () => <Ico d="M5 13l4 4L19 7" />;
const PlusIco      = () => <Ico d="M12 4v16m8-8H4" />;
const TrashIco     = () => <Ico d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />;
const EditIco      = () => <Ico d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />;
const UpIco        = () => <Ico d="M5 15l7-7 7 7" />;
const DownIco      = () => <Ico d="M19 9l-7 7-7-7" />;
const EyeIco       = () => <Ico d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />;
const EyeOffIco    = () => <Ico d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />;
const FlashIco     = () => <Ico d="M13 10V3L4 14h7v7l9-11h-7z" />;
const FestIco      = () => <Ico d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />;
const BannerIco    = () => <Ico d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />;
const CatIco       = () => <Ico d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />;
const AnnoIco      = () => <Ico d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />;
const StatsIco     = () => <Ico d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
const HomeIco      = () => <Ico d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />;
const UploadIco    = () => <Ico cls="w-7 h-7 text-gray-300" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />;
const ChevIco      = () => <Ico cls="w-3 h-3" d="M9 5l7 7-7 7" />;

const INP = 'w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-500 transition-colors bg-white';

// ── Types ────────────────────────────────────────────
interface Banner {
  id: string; title: string; subtitle: string; tag: string;
  image_url: string; button_label: string; button_link: string;
  market: 'pk' | 'us' | 'both'; is_active: boolean; sort_order: number;
}
interface Category {
  id: string; label: string; value: string; image_url: string;
  emoji: string; is_active: boolean; sort_order: number;
}
interface SiteSettings {
  flash_sale_enabled: boolean; flash_sale_ends_at: string;
  flash_sale_discount: number; flash_sale_category: string;
  stats_customers: string; stats_products: string; stats_rating: string;
  pk_banner_title: string; us_banner_title: string;
  festival_enabled: boolean; festival_ends_at: string;
  festival_discount: number; festival_category: string;
  pk_festival_label: string; us_festival_label: string;
  festival_theme_pk: string; festival_theme_us: string;
}

type Section =
  | 'overview'
  | 'announcement'
  | 'banners'
  | 'flash-sale'
  | 'festival'
  | 'categories'
  | 'stats';

const FESTIVAL_PRESETS = [
  { name: '🎉 Eid Sale',        pk: 'Eid Mubarak! Up to {d}% off!',        us: 'Eid Celebration Sale!',           theme_pk: 'emerald', theme_us: 'emerald' },
  { name: '🎆 Independence Day', pk: '14 August Sale — Up to {d}% off!',    us: 'Independence Day Sale!',          theme_pk: 'green',   theme_us: 'blue'    },
  { name: '❄️ Winter Sale',      pk: 'Winter Collection — Up to {d}% off!', us: 'Winter Clearance!',               theme_pk: 'blue',    theme_us: 'cyan'    },
  { name: '☀️ Summer Sale',      pk: 'Summer Blowout — Up to {d}% off!',    us: 'Summer Sale is here!',            theme_pk: 'orange',  theme_us: 'yellow'  },
  { name: '🖤 Black Friday',     pk: 'Black Friday — Up to {d}% off!',      us: 'Black Friday — Up to {d}% off!', theme_pk: 'gray',    theme_us: 'gray'    },
  { name: "💝 Valentine's Day",  pk: "Valentine Special — Up to {d}% off!", us: "Valentine's Sale!",               theme_pk: 'rose',    theme_us: 'rose'    },
  { name: '🌙 Ramadan Sale',     pk: 'Ramadan Mubarak — Up to {d}% off!',   us: 'Ramadan Special!',                theme_pk: 'violet',  theme_us: 'violet'  },
];

function sanitizeFileName(n: string) {
  const d = n.lastIndexOf('.');
  const ext = d !== -1 ? n.slice(d).toLowerCase() : '';
  const base = (d !== -1 ? n.slice(0, d) : n)
    .replace(/[^\x00-\x7F]/g, '_').replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_')
    .replace(/^_|_$/, '') || 'image';
  return `${base}${ext}`;
}
async function uploadImage(file: File): Promise<string> {
  const name = `${Date.now()}_${sanitizeFileName(file.name)}`;
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'x-file-name': name, 'x-file-type': file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`Upload failed`);
  return (await res.json()).url as string;
}
function toLocal(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ── Toggle Switch ────────────────────────────────────
function Toggle({ on, onChange, color = 'bg-violet-600' }: { on: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${on ? color : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-6' : ''}`} />
    </button>
  );
}

// ── Section Header ───────────────────────────────────
function SectionHeader({ icon, title, desc, badge }: { icon: React.ReactNode; title: string; desc: string; badge?: string }) {
  return (
    <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-gray-100">
      <div className="w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-violet-200">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-gray-900">{title}</h2>
          {badge && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">{badge}</span>}
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

// ── Card wrapper ─────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border-2 border-gray-100 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// ── Save Bar ─────────────────────────────────────────
function SaveBar({ hasChanges, saving, saved, onSave }: {
  hasChanges: boolean; saving: boolean; saved: boolean; onSave: () => void;
}) {
  return (
    <div className="flex items-center gap-3 mt-6 pt-4 border-t-2 border-gray-100">
      <button onClick={onSave} disabled={saving || !hasChanges}
        className="bg-violet-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center gap-2 shadow-sm shadow-violet-200">
        <SaveIco /> {saving ? 'Saving...' : 'Save Changes'}
      </button>
      {hasChanges && !saving && <span className="text-xs text-amber-600 font-semibold">● Unsaved changes</span>}
      {saved && <span className="text-xs text-green-600 font-semibold">✓ Saved successfully!</span>}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// BANNER MODAL
// ══════════════════════════════════════════════════════
function BannerModal({ banner, categories, onClose, onSaved }: {
  banner?: Partial<Banner>; categories: Category[];
  onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!banner?.id;
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Omit<Banner, 'id'>>({
    title: banner?.title ?? '', subtitle: banner?.subtitle ?? '',
    tag: banner?.tag ?? '', image_url: banner?.image_url ?? '',
    button_label: banner?.button_label ?? 'Shop Now',
    button_link: banner?.button_link ?? 'all',
    market: banner?.market ?? 'both',
    is_active: banner?.is_active ?? true, sort_order: banner?.sort_order ?? 0,
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { setForm(p => ({ ...p, image_url: '' })); const url = await uploadImage(file); setForm(p => ({ ...p, image_url: url })); }
    catch (err: any) { setError(err.message); } finally { setUploading(false); }
  };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.title) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(isEdit ? `/api/banners/${banner!.id}` : '/api/banners', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Save failed');
      onSaved(); onClose();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b-2 border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
            <div>
              <h2 className="text-lg font-black text-gray-900">{isEdit ? 'Edit Banner' : 'New Banner'}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Hero slider slide</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold">✕</button>
          </div>
          <form onSubmit={save} className="px-6 py-5 space-y-4">
            {/* Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Image</label>
              {form.image_url && (
                <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-3 border-2 border-gray-200 group">
                  <img src={form.image_url} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => setForm(p => ({ ...p, image_url: '' }))}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-5 flex flex-col items-center gap-2 text-sm text-gray-400 hover:border-violet-300 hover:text-violet-400 transition-colors">
                <UploadIco />
                <span>{uploading ? 'Uploading...' : 'Click to upload banner image'}</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
              <input name="image_url" value={form.image_url} onChange={handle} placeholder="Or paste image URL here" className={`${INP} mt-2 text-xs`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="text-red-400">*</span></label>
                <input name="title" value={form.title} onChange={handle} required placeholder="New Collection" className={INP} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tag / Badge</label>
                <input name="tag" value={form.tag} onChange={handle} placeholder="Summer 2025" className={INP} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subtitle</label>
              <input name="subtitle" value={form.subtitle} onChange={handle} placeholder="Trendy fashion, one click away" className={INP} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Button Text</label>
                <input name="button_label" value={form.button_label} onChange={handle} placeholder="Shop Now" className={INP} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Button Goes To</label>
                <select name="button_link" value={form.button_link} onChange={handle} className={INP}>
                  <option value="all">All Products</option>
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Show To</label>
              <div className="flex gap-2">
                {[{ v: 'both', l: '🌍 Both Markets' }, { v: 'pk', l: '🇵🇰 Pakistan' }, { v: 'us', l: '🇺🇸 USA' }].map(opt => (
                  <button key={opt.v} type="button"
                    onClick={() => setForm(p => ({ ...p, market: opt.v as any }))}
                    className={`flex-1 px-2 py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.market === opt.v ? 'border-violet-500 bg-violet-600 text-white' : 'border-gray-200 text-gray-600 hover:border-violet-300'}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Active / Visible</p>
                <p className="text-xs text-gray-400">Show this banner on site</p>
              </div>
              <Toggle on={form.is_active} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
            </div>
            {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving || uploading} className="flex-1 bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-violet-700 disabled:opacity-60">
                {saving ? 'Saving...' : isEdit ? 'Update Banner' : 'Add Banner'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════
// CATEGORY MODAL
// ══════════════════════════════════════════════════════
function CategoryModal({ category, onClose, onSaved }: {
  category?: Partial<Category>; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!category?.id;
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    label: category?.label ?? '', value: category?.value ?? '',
    image_url: category?.image_url ?? '', emoji: category?.emoji ?? '',
    is_active: category?.is_active ?? true, sort_order: category?.sort_order ?? 0,
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadImage(file); setForm(p => ({ ...p, image_url: url })); }
    catch (err: any) { setError(err.message); } finally { setUploading(false); }
  };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.label) { setError('Label required'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, value: form.value || form.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') };
      const res = await fetch(isEdit ? `/api/categories/${category!.id}` : '/api/categories', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Save failed');
      onSaved(); onClose();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b-2 border-gray-100 sticky top-0 bg-white rounded-t-3xl">
            <h2 className="text-lg font-black text-gray-900">{isEdit ? 'Edit Category' : 'New Category'}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold">✕</button>
          </div>
          <form onSubmit={save} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Label <span className="text-red-400">*</span></label>
                <input name="label" value={form.label} onChange={handle} required placeholder="Women" className={INP} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug</label>
                <input name="value" value={form.value} onChange={handle} placeholder="women (auto)" className={INP} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category Image</label>
              {form.image_url && (
                <div className="relative h-28 rounded-2xl overflow-hidden mb-3 border-2 border-gray-200">
                  <img src={form.image_url} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => setForm(p => ({ ...p, image_url: '' }))} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs font-bold">✕</button>
                </div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 flex flex-col items-center gap-1 text-sm text-gray-400 hover:border-violet-300 hover:text-violet-400 transition-colors">
                <UploadIco />
                <span className="text-xs">{uploading ? 'Uploading...' : 'Upload image'}</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
              <input name="image_url" value={form.image_url} onChange={handle} placeholder="Or paste URL" className={`${INP} mt-2 text-xs`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Emoji</label>
                <input name="emoji" value={form.emoji} onChange={handle} placeholder="👗" className={INP} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sort Order</label>
                <input name="sort_order" type="number" value={form.sort_order} onChange={handle} className={INP} />
              </div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-gray-700">Visible on site</p>
              <Toggle on={form.is_active} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
            </div>
            {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-2xl text-sm font-semibold">Cancel</button>
              <button type="submit" disabled={saving || uploading} className="flex-1 bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-violet-700 disabled:opacity-60">
                {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════
export default function HomepageEditor() {
  const [section, setSection] = useState<Section>('overview');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsBak, setSettingsBak] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editBanner, setEditBanner] = useState<Partial<Banner> | undefined>();
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Partial<Category> | undefined>();
  const [showCatModal, setShowCatModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [b, c, s] = await Promise.all([
        fetch('/api/banners').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
      ]);
      setBanners(Array.isArray(b) ? b : []);
      setCategories(Array.isArray(c) ? c : []);
      const merged: SiteSettings = {
        flash_sale_enabled:  s.flash_sale_enabled  ?? true,
        flash_sale_ends_at:  s.flash_sale_ends_at  ?? new Date(Date.now() + 6*3600000).toISOString(),
        flash_sale_discount: s.flash_sale_discount ?? 50,
        flash_sale_category: s.flash_sale_category ?? 'sale',
        stats_customers:     s.stats_customers     ?? '10K+',
        stats_products:      s.stats_products      ?? '500+',
        stats_rating:        s.stats_rating        ?? '4.9★',
        pk_banner_title:     s.pk_banner_title     ?? '🎉 Free Delivery above Rs. 1,500 · Cash on Delivery · 7-day returns',
        us_banner_title:     s.us_banner_title     ?? '🎉 Free shipping above $50 · Secure Checkout · Easy Returns',
        festival_enabled:    s.festival_enabled    ?? false,
        festival_ends_at:    s.festival_ends_at    ?? new Date(Date.now() + 7*86400000).toISOString(),
        festival_discount:   s.festival_discount   ?? 30,
        festival_category:   s.festival_category   ?? 'sale',
        pk_festival_label:   s.pk_festival_label   ?? '',
        us_festival_label:   s.us_festival_label   ?? '',
        festival_theme_pk:   s.festival_theme_pk   ?? 'emerald',
        festival_theme_us:   s.festival_theme_us   ?? 'blue',
      };
      setSettings(merged); setSettingsBak(merged);
    } catch (err: any) { setError(err.message ?? 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true); setError(null); setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Save failed');
      setSettingsBak(settings); setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setSettings(p => p ? { ...p, [key]: value } : p);

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(settingsBak);

  const deleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await fetch(`/api/banners/${id}`, { method: 'DELETE' }); load();
  };
  const toggleBanner = async (b: Banner) => {
    await fetch(`/api/banners/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !b.is_active }) }); load();
  };
  const moveBanner = async (b: Banner, dir: 'up' | 'down') => {
    const idx = banners.indexOf(b); const swap = dir === 'up' ? banners[idx-1] : banners[idx+1]; if (!swap) return;
    await Promise.all([
      fetch(`/api/banners/${b.id}`,    { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sort_order: swap.sort_order }) }),
      fetch(`/api/banners/${swap.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sort_order: b.sort_order    }) }),
    ]); load();
  };
  const deleteCategory = async (id: string) => {
    if (!confirm('Delete category?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' }); load();
  };
  const toggleCategory = async (c: Category) => {
    await fetch(`/api/categories/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !c.is_active }) }); load();
  };
  const moveCategory = async (c: Category, dir: 'up' | 'down') => {
    const idx = categories.indexOf(c); const swap = dir === 'up' ? categories[idx-1] : categories[idx+1]; if (!swap) return;
    await Promise.all([
      fetch(`/api/categories/${c.id}`,    { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sort_order: swap.sort_order }) }),
      fetch(`/api/categories/${swap.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sort_order: c.sort_order    }) }),
    ]); load();
  };

  // ── Sidebar nav items ────────────────────────────
  const NAV: { key: Section; label: string; icon: React.ReactNode; desc: string; count?: number }[] = [
    { key: 'overview',     label: 'Overview',         icon: <HomeIco />,   desc: 'Homepage summary' },
    { key: 'announcement', label: 'Announcement Bar', icon: <AnnoIco />,   desc: 'Top banner text' },
    { key: 'banners',      label: 'Hero Banners',     icon: <BannerIco />, desc: 'Slider images', count: banners.length },
    { key: 'flash-sale',   label: 'Flash Sale',       icon: <FlashIco />,  desc: 'Countdown timer' },
    { key: 'festival',     label: 'Festival Sale',    icon: <FestIco />,   desc: 'Eid, Ramadan...' },
    { key: 'categories',   label: 'Categories',       icon: <CatIco />,    desc: 'Shop categories', count: categories.length },
    { key: 'stats',        label: 'Stats & Numbers',  icon: <StatsIco />,  desc: 'Trust strip' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center text-gray-400">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading homepage editor…</p>
      </div>
    </div>
  );

  if (!settings) return (
    <div className="p-6 text-red-600 bg-red-50 border border-red-200 rounded-2xl">
      Could not load settings. {error}
    </div>
  );

  return (
    <>
      {showBannerModal && (
        <BannerModal banner={editBanner} categories={categories}
          onClose={() => { setShowBannerModal(false); setEditBanner(undefined); }} onSaved={load} />
      )}
      {showCatModal && (
        <CategoryModal category={editCategory}
          onClose={() => { setShowCatModal(false); setEditCategory(undefined); }} onSaved={load} />
      )}

      <div className="flex h-full min-h-[calc(100vh-120px)]">

        {/* ── SIDEBAR ─────────────────────────────── */}
        <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} shrink-0 bg-gray-900 flex flex-col transition-all duration-200 rounded-l-2xl overflow-hidden`}>
          {/* sidebar header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
            <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center shrink-0">
              <HomeIco />
            </div>
            {sidebarOpen && <span className="text-white font-black text-sm">Homepage CMS</span>}
            <button onClick={() => setSidebarOpen(p => !p)} className="ml-auto text-gray-400 hover:text-white transition-colors">
              <Ico d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} cls="w-4 h-4" />
            </button>
          </div>

          {/* nav items */}
          <nav className="flex-1 py-3 space-y-0.5 px-2">
            {NAV.map(item => {
              const active = section === item.key;
              return (
                <button key={item.key} onClick={() => setSection(item.key)}
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

          {/* status badges */}
          {sidebarOpen && (
            <div className="px-4 py-4 border-t border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Flash Sale</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${settings.flash_sale_enabled ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                  {settings.flash_sale_enabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Festival</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${settings.festival_enabled ? 'bg-violet-900 text-violet-400' : 'bg-gray-800 text-gray-500'}`}>
                  {settings.festival_enabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Banners</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-gray-800 text-gray-300">{banners.filter(b => b.is_active).length}/{banners.length}</span>
              </div>
            </div>
          )}
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 rounded-r-2xl">

          {/* ── OVERVIEW ── */}
          {section === 'overview' && (
            <div className="space-y-6 max-w-3xl">
              <SectionHeader icon={<HomeIco />} title="Homepage Overview" desc="Quick status of all homepage sections" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Active Banners',  value: String(banners.filter(b=>b.is_active).length),     sub: `of ${banners.length} total`,     color: 'bg-violet-50 border-violet-200', tc: 'text-violet-700' },
                  { label: 'Categories',      value: String(categories.filter(c=>c.is_active).length),  sub: `of ${categories.length} total`,  color: 'bg-blue-50 border-blue-200',     tc: 'text-blue-700'   },
                  { label: 'Flash Sale',      value: settings.flash_sale_enabled ? 'ON' : 'OFF',        sub: `${settings.flash_sale_discount}% discount`,   color: settings.flash_sale_enabled ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-gray-200', tc: settings.flash_sale_enabled ? 'text-rose-600' : 'text-gray-500' },
                  { label: 'Festival',        value: settings.festival_enabled ? 'ON' : 'OFF',          sub: `${settings.festival_discount}% discount`,     color: settings.festival_enabled ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200', tc: settings.festival_enabled ? 'text-emerald-600' : 'text-gray-500' },
                ].map((s, i) => (
                  <div key={i} className={`rounded-2xl border-2 p-4 ${s.color}`}>
                    <p className={`text-2xl font-black ${s.tc}`}>{s.value}</p>
                    <p className="text-xs font-bold text-gray-600 mt-1">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {NAV.filter(n => n.key !== 'overview').map(item => (
                  <button key={item.key} onClick={() => setSection(item.key)}
                    className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-left hover:border-violet-300 hover:shadow-md transition-all group flex items-center gap-4">
                    <div className="w-10 h-10 bg-violet-50 group-hover:bg-violet-600 text-violet-600 group-hover:text-white rounded-xl flex items-center justify-center transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <ChevIco />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── ANNOUNCEMENT BAR ── */}
          {section === 'announcement' && (
            <div className="max-w-2xl space-y-5">
              <SectionHeader icon={<AnnoIco />} title="Announcement Bar" desc="The top banner shown to all visitors" />

              {/* Live preview */}
              <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-gray-500 bg-gray-50 px-4 py-2 border-b border-gray-200">🇵🇰 Pakistan Preview</p>
                <div className="bg-violet-600 text-white text-center text-sm py-3 font-medium px-4">
                  {settings.pk_banner_title || '(empty)'}
                </div>
                <p className="text-xs font-bold text-gray-500 bg-gray-50 px-4 py-2 border-t border-b border-gray-200">🇺🇸 USA Preview</p>
                <div className="bg-violet-600 text-white text-center text-sm py-3 font-medium px-4">
                  {settings.us_banner_title || '(empty)'}
                </div>
              </div>

              <Card>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">🇵🇰 Pakistan Text</label>
                    <input value={settings.pk_banner_title} onChange={e => set('pk_banner_title', e.target.value)} className={INP}
                      placeholder="🎉 Free Delivery above Rs. 1,500 · Cash on Delivery · 7-day returns" />
                    <p className="text-xs text-gray-400 mt-1">Shown to Pakistan visitors. Use · to separate items.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">🇺🇸 USA Text</label>
                    <input value={settings.us_banner_title} onChange={e => set('us_banner_title', e.target.value)} className={INP}
                      placeholder="🎉 Free shipping above $50 · Secure Checkout · Easy Returns" />
                    <p className="text-xs text-gray-400 mt-1">Shown to USA visitors.</p>
                  </div>
                </div>
              </Card>
              <SaveBar hasChanges={hasChanges} saving={saving} saved={saved} onSave={saveSettings} />
            </div>
          )}

          {/* ── HERO BANNERS ── */}
          {section === 'banners' && (
            <div className="max-w-3xl space-y-5">
              <div className="flex items-start justify-between">
                <SectionHeader icon={<BannerIco />} title="Hero Banners" desc="Fullscreen slider on homepage" badge={`${banners.length} slides`} />
                <button onClick={() => { setEditBanner(undefined); setShowBannerModal(true); }}
                  className="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-violet-700 transition flex items-center gap-1.5 shrink-0 mt-1">
                  <PlusIco /> Add Banner
                </button>
              </div>

              {banners.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="text-4xl mb-3">🖼️</div>
                  <p className="font-semibold text-gray-500">No banners yet</p>
                  <button onClick={() => setShowBannerModal(true)} className="mt-3 text-violet-600 font-semibold text-sm underline">Add your first banner</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {banners.map((b, idx) => (
                    <div key={b.id} className={`bg-white rounded-2xl border-2 overflow-hidden flex transition-all ${b.is_active ? 'border-gray-100 shadow-sm' : 'border-gray-200 opacity-50'}`}>
                      <div className="w-32 h-24 shrink-0 bg-gray-100 relative overflow-hidden">
                        {b.image_url
                          ? <img src={b.image_url} className="w-full h-full object-cover" alt={b.title} />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">🖼️</div>
                        }
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
                          #{idx + 1} · {b.market === 'both' ? '🌍' : b.market === 'pk' ? '🇵🇰' : '🇺🇸'}
                        </div>
                      </div>
                      <div className="flex-1 p-4 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-gray-900 truncate">{b.title}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{b.subtitle}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              {b.tag && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">{b.tag}</span>}
                              <span className="text-xs text-violet-600 font-medium">→ {b.button_label}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => moveBanner(b, 'up')} disabled={idx === 0} title="Move up"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 transition-all"><UpIco /></button>
                            <button onClick={() => moveBanner(b, 'down')} disabled={idx === banners.length - 1} title="Move down"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 transition-all"><DownIco /></button>
                            <button onClick={() => toggleBanner(b)} title={b.is_active ? 'Hide' : 'Show'}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                              {b.is_active ? <EyeIco /> : <EyeOffIco />}
                            </button>
                            <button onClick={() => { setEditBanner(b); setShowBannerModal(true); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-violet-500 hover:text-violet-700 hover:bg-violet-50 transition-all"><EditIco /></button>
                            <button onClick={() => deleteBanner(b.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"><TrashIco /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── FLASH SALE ── */}
          {section === 'flash-sale' && (
            <div className="max-w-2xl space-y-5">
              <SectionHeader icon={<FlashIco />} title="Flash Sale" desc="Countdown timer banner on homepage" />

              <Card>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-orange-50">
                  <div>
                    <p className="font-black text-gray-900 text-sm">Flash Sale Status</p>
                    <p className="text-xs text-gray-500">Toggle to show/hide the countdown banner</p>
                  </div>
                  <Toggle on={settings.flash_sale_enabled} onChange={v => set('flash_sale_enabled', v)} color="bg-rose-500" />
                </div>
                <div className={`p-5 space-y-5 ${!settings.flash_sale_enabled ? 'opacity-40 pointer-events-none' : ''}`}>
                  {/* Preview */}
                  <div className="bg-gradient-to-r from-rose-600 to-orange-500 rounded-2xl px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-xs font-semibold">Limited Time</p>
                      <p className="text-white font-black text-lg">Flash Sale — Up to {settings.flash_sale_discount}% Off!</p>
                    </div>
                    <div className="bg-white text-rose-600 px-4 py-2 rounded-xl font-black text-sm">Shop Sale →</div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sale Ends At</label>
                    <input type="datetime-local" value={toLocal(settings.flash_sale_ends_at)}
                      onChange={e => set('flash_sale_ends_at', new Date(e.target.value).toISOString())} className={INP} />
                    <div className="flex gap-2 mt-2">
                      {[3,6,12,24].map(h => (
                        <button key={h} type="button"
                          onClick={() => set('flash_sale_ends_at', new Date(Date.now() + h*3600000).toISOString())}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-rose-100 hover:text-rose-700 transition">
                          +{h}h from now
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount %</label>
                      <input type="number" min="1" max="99" value={settings.flash_sale_discount}
                        onChange={e => set('flash_sale_discount', Number(e.target.value))} className={INP} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Button Links To</label>
                      <select value={settings.flash_sale_category} onChange={e => set('flash_sale_category', e.target.value)} className={INP}>
                        {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
              <SaveBar hasChanges={hasChanges} saving={saving} saved={saved} onSave={saveSettings} />
            </div>
          )}

          {/* ── FESTIVAL SALE ── */}
          {section === 'festival' && (
            <div className="max-w-2xl space-y-5">
              <SectionHeader icon={<FestIco />} title="Festival / Seasonal Sale" desc="Eid, Independence Day, Ramadan, Black Friday and more" />

              <Card>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
                  <div>
                    <p className="font-black text-gray-900 text-sm">Festival Banner Status</p>
                    <p className="text-xs text-gray-500">Toggle to show/hide on homepage</p>
                  </div>
                  <Toggle on={settings.festival_enabled} onChange={v => set('festival_enabled', v)} />
                </div>
                <div className={`p-5 space-y-5 ${!settings.festival_enabled ? 'opacity-40 pointer-events-none' : ''}`}>

                  {/* Quick presets */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Presets</label>
                    <div className="flex flex-wrap gap-2">
                      {FESTIVAL_PRESETS.map(p => (
                        <button key={p.name} type="button"
                          onClick={() => setSettings(prev => prev ? {
                            ...prev,
                            pk_festival_label: p.pk.replace('{d}', String(prev.festival_discount)),
                            us_festival_label: p.us.replace('{d}', String(prev.festival_discount)),
                            festival_theme_pk: p.theme_pk, festival_theme_us: p.theme_us,
                          } : prev)}
                          className="text-xs px-3 py-2 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 font-semibold transition">
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className="rounded-2xl overflow-hidden border-2 border-gray-200">
                    <p className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-2 border-b">🇵🇰 Pakistan Preview</p>
                    <div className={`bg-${settings.festival_theme_pk}-600 text-white px-5 py-3 flex items-center justify-between`}>
                      <p className="font-black">{settings.pk_festival_label || 'Set festival label below...'}</p>
                      <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg">Shop →</span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-2 border-t border-b">🇺🇸 USA Preview</p>
                    <div className={`bg-${settings.festival_theme_us}-600 text-white px-5 py-3 flex items-center justify-between`}>
                      <p className="font-black">{settings.us_festival_label || 'Set festival label below...'}</p>
                      <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg">Shop →</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">🇵🇰 Pakistan Text</label>
                      <input value={settings.pk_festival_label} onChange={e => set('pk_festival_label', e.target.value)} placeholder="Eid Mubarak! Up to 30% off!" className={INP} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">🇺🇸 USA Text</label>
                      <input value={settings.us_festival_label} onChange={e => set('us_festival_label', e.target.value)} placeholder="Eid Celebration Sale!" className={INP} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Festival Ends At</label>
                    <input type="datetime-local" value={toLocal(settings.festival_ends_at)}
                      onChange={e => set('festival_ends_at', new Date(e.target.value).toISOString())} className={INP} />
                    <div className="flex gap-2 mt-2">
                      {[1,3,7,14].map(d => (
                        <button key={d} type="button"
                          onClick={() => set('festival_ends_at', new Date(Date.now() + d*86400000).toISOString())}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700 transition">
                          +{d}d from now
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount %</label>
                      <input type="number" min="1" max="99" value={settings.festival_discount}
                        onChange={e => set('festival_discount', Number(e.target.value))} className={INP} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Links to Category</label>
                      <select value={settings.festival_category} onChange={e => set('festival_category', e.target.value)} className={INP}>
                        {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">🇵🇰 Color Theme</label>
                      <select value={settings.festival_theme_pk} onChange={e => set('festival_theme_pk', e.target.value)} className={INP}>
                        {['emerald','green','blue','cyan','violet','rose','orange','yellow','gray'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">🇺🇸 Color Theme</label>
                      <select value={settings.festival_theme_us} onChange={e => set('festival_theme_us', e.target.value)} className={INP}>
                        {['emerald','green','blue','cyan','violet','rose','orange','yellow','gray'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
              <SaveBar hasChanges={hasChanges} saving={saving} saved={saved} onSave={saveSettings} />
            </div>
          )}

          {/* ── CATEGORIES ── */}
          {section === 'categories' && (
            <div className="max-w-3xl space-y-5">
              <div className="flex items-start justify-between">
                <SectionHeader icon={<CatIco />} title="Categories" desc="Shop categories — synced with product form automatically" badge={`${categories.length} total`} />
                <button onClick={() => { setEditCategory(undefined); setShowCatModal(true); }}
                  className="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-violet-700 transition flex items-center gap-1.5 shrink-0 mt-1">
                  <PlusIco /> Add Category
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 font-medium">
                💡 Categories here auto-sync with the product form dropdown — no code changes needed.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((c, idx) => (
                  <div key={c.id} className={`bg-white border-2 rounded-2xl overflow-hidden flex items-center transition-all ${c.is_active ? 'border-gray-100 shadow-sm' : 'border-gray-200 opacity-50'}`}>
                    <div className="w-16 h-16 shrink-0 bg-gray-100 overflow-hidden">
                      {c.image_url
                        ? <img src={c.image_url} className="w-full h-full object-cover" alt={c.label} />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">{c.emoji || '📦'}</div>
                      }
                    </div>
                    <div className="flex-1 px-3 py-2 min-w-0">
                      <p className="font-bold text-sm text-gray-900">{c.label} {c.emoji}</p>
                      <p className="text-xs text-gray-400 font-mono">{c.value}</p>
                    </div>
                    <div className="flex gap-1 pr-3 shrink-0">
                      <button onClick={() => moveCategory(c, 'up')} disabled={idx === 0} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20"><UpIco /></button>
                      <button onClick={() => moveCategory(c, 'down')} disabled={idx === categories.length-1} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20"><DownIco /></button>
                      <button onClick={() => toggleCategory(c)} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                        {c.is_active ? <EyeIco /> : <EyeOffIco />}
                      </button>
                      <button onClick={() => { setEditCategory(c); setShowCatModal(true); }} className="w-6 h-6 flex items-center justify-center rounded text-violet-500 hover:text-violet-700 hover:bg-violet-50"><EditIco /></button>
                      <button onClick={() => deleteCategory(c.id)} className="w-6 h-6 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50"><TrashIco /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STATS ── */}
          {section === 'stats' && (
            <div className="max-w-2xl space-y-5">
              <SectionHeader icon={<StatsIco />} title="Stats & Numbers" desc="Trust numbers shown at the bottom of homepage" />

              {/* Preview */}
              <div className="bg-gradient-to-r from-violet-700 to-purple-800 rounded-2xl p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { num: settings.stats_customers, label: 'Happy Customers' },
                    { num: settings.stats_products,  label: 'Products'        },
                    { num: settings.stats_rating,    label: 'Avg Rating'      },
                  ].map((s, i) => (
                    <div key={i}>
                      <p className="text-white text-2xl font-black">{s.num}</p>
                      <p className="text-violet-300 text-xs mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Card>
                <div className="p-5 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Customers</label>
                    <input value={settings.stats_customers} onChange={e => set('stats_customers', e.target.value)} placeholder="10K+" className={INP} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Products</label>
                    <input value={settings.stats_products} onChange={e => set('stats_products', e.target.value)} placeholder="500+" className={INP} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rating</label>
                    <input value={settings.stats_rating} onChange={e => set('stats_rating', e.target.value)} placeholder="4.9★" className={INP} />
                  </div>
                </div>
              </Card>
              <SaveBar hasChanges={hasChanges} saving={saving} saved={saved} onSave={saveSettings} />
            </div>
          )}

          {error && (
            <div className="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold z-50">
              ❌ {error}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
