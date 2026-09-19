// app/supplier/signup/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthBackground from '@/components/auth/AuthBackground';
import EyeIcon from '@/components/auth/EyeIcon';

const BANK_TYPES = ['Bank Transfer', 'JazzCash', 'EasyPaisa', 'SadaPay', 'NayaPay', 'Cash'];
const MAX_CNIC_SIZE = 1 * 1024 * 1024; // 1MB

export default function SupplierSignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', age: '', address: '', website: '',
    bank_type: BANK_TYPES[0], bank_name: '', bank_account_title: '', bank_account_number: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [cnicFile, setCnicFile] = useState<File | null>(null);
  const [cnicPreview, setCnicPreview] = useState<string>('');
  const cnicInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const isWalletType = form.bank_type === 'JazzCash' || form.bank_type === 'EasyPaisa';

  const onCnicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('CNIC file must be an image (JPG, PNG, etc.)');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_CNIC_SIZE) {
      setError(`CNIC image must be under 1MB (yours is ${(file.size / (1024 * 1024)).toFixed(2)}MB). Please compress it and try again.`);
      e.target.value = '';
      return;
    }
    setError('');
    setCnicFile(file);
    setCnicPreview(URL.createObjectURL(file));
  };

  const removeCnic = () => {
    setCnicFile(null);
    setCnicPreview('');
    if (cnicInputRef.current) cnicInputRef.current.value = '';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!termsAccepted) { setError('Please accept the Terms & Policy to continue'); return; }
    if (!cnicFile) { setError('Please upload a photo of your CNIC to continue'); return; }

    setLoading(true);
    try {
      // Upload CNIC image first — same upload endpoint used elsewhere in the app.
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-file-name': `cnic_${Date.now()}_${cnicFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
          'x-file-type': cnicFile.type,
        },
        body: cnicFile,
      });
      if (!uploadRes.ok) throw new Error('CNIC upload failed. Please try again.');
      const { url: cnicUrl } = await uploadRes.json();

      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
          role: 'supplier',
          terms_accepted: termsAccepted,
          cnic_image_url: cnicUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Signup failed');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
        <AuthBackground />
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-[28px] border border-white/15 bg-white/10 p-8 text-center shadow-[0_8px_60px_-10px_rgba(79,70,229,0.55)] backdrop-blur-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">✅</div>
            <h1 className="mb-2 text-xl font-black text-white">Application Submitted</h1>
            <p className="mb-6 text-sm text-slate-300">
              Your supplier account has been created and is pending admin review.
              You'll be able to log in once it's approved — this is usually quick.
            </p>
            <Link
              href="/login"
              className="inline-block w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-5px_rgba(79,70,229,0.55)] transition hover:from-violet-700 hover:to-indigo-800"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-[0_8px_60px_-10px_rgba(79,70,229,0.55)] backdrop-blur-2xl">
          <p className="bg-gradient-to-r from-violet-300 via-white to-indigo-300 bg-clip-text text-xs font-bold uppercase tracking-[0.35em] text-transparent">
            MaestraVibe
          </p>
          <h1 className="mb-1 text-2xl font-black text-white">Become a Supplier</h1>
          <p className="mb-6 text-sm text-slate-300">List your products on MaestraVibe. Your account and each product need a quick admin review before going live.</p>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Full Name</label>
                <input required value={form.name} onChange={set('name')}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Age</label>
                <input required type="number" min={13} max={100} value={form.age} onChange={set('age')}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Email Address</label>
              <input required type="email" value={form.email} onChange={set('email')}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Password</label>
              <div className="relative">
                <input required type={showPassword ? 'text' : 'password'} minLength={6} value={form.password} onChange={set('password')}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 pr-11 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Phone</label>
                <input required value={form.phone} onChange={set('phone')} placeholder="03XX-XXXXXXX"
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Website (optional)</label>
                <input value={form.website} onChange={set('website')} placeholder="https://..."
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Business Address</label>
              <input required value={form.address} onChange={set('address')}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25" />
            </div>

            {/* ── CNIC verification photo — required, max 1MB ── */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-violet-300">Identity Verification</p>
              <p className="mb-3 text-xs text-slate-400">Upload a clear photo of your CNIC (front side). Max size 1MB.</p>

              {!cnicPreview ? (
                <button
                  type="button"
                  onClick={() => cnicInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-white/20 py-6 text-sm text-slate-400 transition-colors hover:border-violet-400/50 hover:text-violet-300"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Click to upload CNIC photo</span>
                  <span className="text-[11px] text-slate-500">JPG or PNG, under 1MB</span>
                </button>
              ) : (
                <div className="relative w-full max-w-[220px]">
                  <img src={cnicPreview} alt="CNIC preview" className="w-full rounded-xl border-2 border-white/15 object-cover" />
                  <button
                    type="button"
                    onClick={removeCnic}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                    aria-label="Remove CNIC photo"
                  >
                    ✕
                  </button>
                  <p className="mt-2 text-[11px] text-slate-400">{cnicFile ? `${(cnicFile.size / 1024).toFixed(0)} KB` : ''}</p>
                </div>
              )}
              <input ref={cnicInputRef} type="file" accept="image/*" onChange={onCnicSelect} className="hidden" />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-violet-300">Payout Details</p>

              <div className="mb-3">
                <label className="mb-2 block text-sm font-semibold text-slate-200">Payment Method</label>
                <select value={form.bank_type} onChange={set('bank_type')}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25">
                  {BANK_TYPES.map(t => <option key={t} value={t} className="bg-slate-800">{t}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  {form.bank_type === 'Bank Transfer' ? 'Bank Name' : 'Provider / Bank Name'}
                </label>
                <input required value={form.bank_name} onChange={set('bank_name')}
                  placeholder={form.bank_type === 'Bank Transfer' ? 'e.g. HBL, UBL, Meezan' : form.bank_type}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25" />
              </div>

              <div className="mb-3">
                <label className="mb-2 block text-sm font-semibold text-slate-200">Account Title</label>
                <input required value={form.bank_account_title} onChange={set('bank_account_title')}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  {isWalletType ? 'Mobile Number (03XXXXXXXXX)' : 'Account Number'}
                </label>
                <input required value={form.bank_account_number} onChange={set('bank_account_number')}
                  placeholder={isWalletType ? '03XXXXXXXXX' : 'Account / IBAN number'}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25" />
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-sm text-slate-300">
              <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-violet-500 focus:ring-violet-400/40" />
              <span>
                I agree to MaestraVibe's{' '}
                <Link href="/policy" className="font-semibold text-violet-300 hover:text-violet-200 hover:underline">Terms & Policy</Link>
              </span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-5px_rgba(79,70,229,0.55)] transition hover:from-violet-700 hover:to-indigo-800 hover:shadow-[0_14px_34px_-6px_rgba(79,70,229,0.65)] disabled:opacity-60 disabled:shadow-none">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>

          <div className="mt-5 flex justify-center text-sm">
            <p className="text-slate-300">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-violet-300 hover:text-violet-200 hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}