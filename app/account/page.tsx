// app/account/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthBackground from '@/components/auth/AuthBackground';
import EyeIcon from '@/components/auth/EyeIcon';
import { PAKISTANI_BANKS, PAYMENT_METHODS, PAYMENT_ORDER } from '@/components/auth/paymentMethods';

export default function AccountPage() {
  const router = useRouter();
  const [role, setRole] = useState<'customer' | 'reseller'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'role' | 'email' | 'verify' | 'details' | 'done'>('role');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [bankConfirmed, setBankConfirmed] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    age: '',
    address: '',
    website: '',
    bank_type: 'Bank Transfer',
    bank_name: '',
    bank_account_title: '',
    bank_account_number: '',
  });

  const activeMethod = PAYMENT_METHODS[form.bank_type];
  const accountNumberValid = activeMethod?.noAccountNeeded
    ? true
    : !activeMethod?.accountPattern || activeMethod.accountPattern.test(form.bank_account_number);

  const sendCode = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the Terms & Policy to continue');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/account/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send code');
      setStage('verify');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/account/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Code verification failed');
      setStage('details');
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'reseller' && !bankConfirmed) {
      setError('Please confirm your payout details are accurate before submitting');
      return;
    }
    if (role === 'reseller' && !activeMethod?.noAccountNeeded && !accountNumberValid) {
      setError(`Please enter a valid ${activeMethod?.accountLabel.toLowerCase()}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        email,
        password,
        terms_accepted: termsAccepted,
        role,
        name: form.name,
        phone: form.phone,
        age: Number(form.age),
        address: form.address,
        website: form.website,
        bank_type: form.bank_type,
        bank_name: activeMethod?.needsBankName ? form.bank_name : form.bank_type,
        bank_account_title: form.bank_account_title,
        bank_account_number: form.bank_account_number,
      };

      const res = await fetch('/api/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const fields = data.fieldErrors ? Object.entries(data.fieldErrors).map(([field, message]) => `${field}: ${message}`).join(' ') : '';
        throw new Error(fields || data.message || 'Registration failed');
      }
      setStage('done');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setForm({
      ...form,
      bank_type: method,
      bank_name: '',
      bank_account_title: '',
      bank_account_number: '',
    });
    setBankConfirmed(false);
  };

  const inputClass =
    'w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25';
  const labelClass = 'mb-2 block text-sm font-semibold text-slate-200';
  const primaryBtnClass =
    'rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-5px_rgba(79,70,229,0.55)] transition hover:from-violet-700 hover:to-indigo-800 hover:shadow-[0_14px_34px_-6px_rgba(79,70,229,0.65)] disabled:opacity-50 disabled:shadow-none';
  const secondaryBtnClass =
    'rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10';

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10">
      <AuthBackground />

      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="rounded-[28px] border border-white/15 bg-white/10 shadow-[0_8px_60px_-10px_rgba(79,70,229,0.55)] backdrop-blur-2xl">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="bg-gradient-to-r from-violet-300 via-white to-indigo-300 bg-clip-text text-xs font-bold uppercase tracking-[0.35em] text-transparent">
                  MaestraVibe
                </p>
                <h1 className="text-2xl font-black text-white">Create Your Account</h1>
              </div>
              <span className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-700 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {role === 'reseller' ? 'Reseller' : 'Customer'}
              </span>
            </div>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {stage === 'role' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">Choose your account type</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`rounded-2xl border-2 p-4 text-left transition-all ${
                      role === 'customer'
                        ? 'border-violet-400 bg-violet-500/10 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)]'
                        : 'border-white/15 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <div className="mb-1 text-xl">🛍️</div>
                    <div className="text-base font-bold text-white">Customer</div>
                    <div className="text-xs text-slate-400">Buy products and track orders</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('reseller')}
                    className={`rounded-2xl border-2 p-4 text-left transition-all ${
                      role === 'reseller'
                        ? 'border-violet-400 bg-violet-500/10 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)]'
                        : 'border-white/15 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <div className="mb-1 text-xl">🏪</div>
                    <div className="text-base font-bold text-white">Reseller</div>
                    <div className="text-xs text-slate-400">Sell products and earn commission</div>
                  </button>
                  {/* Supplier has its own dedicated onboarding (business + payout details
                      up front), so this card hands off to /supplier/signup instead of
                      continuing this customer/reseller wizard. */}
                  <button
                    type="button"
                    onClick={() => router.push('/supplier/signup')}
                    className="rounded-2xl border-2 border-white/15 bg-white/5 p-4 text-left transition-all hover:border-white/30"
                  >
                    <div className="mb-1 text-xl">📦</div>
                    <div className="text-base font-bold text-white">Supplier</div>
                    <div className="text-xs text-slate-400">List products &amp; get paid per sale</div>
                  </button>
                </div>
                <button type="button" onClick={() => setStage('email')} className={`w-full ${primaryBtnClass}`}>
                  Continue
                </button>
                <p className="text-center text-sm text-slate-300">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-violet-300 hover:text-violet-200 hover:underline">
                    Login
                  </Link>
                </p>
              </div>
            )}

            {stage === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-300"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-300"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showConfirmPassword} />
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10 text-violet-500 focus:ring-violet-400"
                  />
                  <span>
                    I agree to the{' '}
                    <a href="/policy" target="_blank" className="font-semibold text-violet-300 hover:text-violet-200 hover:underline">
                      Terms & Policy
                    </a>
                  </span>
                </label>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStage('role')} className={`flex-1 ${secondaryBtnClass}`}>
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={loading || !email || !password || !confirmPassword || !termsAccepted}
                    className={`flex-1 ${primaryBtnClass}`}
                  >
                    {loading ? 'Sending...' : 'Send Code'}
                  </button>
                </div>
              </div>
            )}

            {stage === 'verify' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className={`${inputClass} text-center text-lg font-bold tracking-[0.4em]`}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStage('email')} className={`flex-1 ${secondaryBtnClass}`}>
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={verifyCode}
                    disabled={loading || code.length < 6}
                    className={`flex-1 ${primaryBtnClass}`}
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </div>
            )}

            {stage === 'details' && (
              <form onSubmit={submitAccount} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="03XX-XXXXXXX"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Age</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Website / Store (optional)</label>
                    <input
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      placeholder="https://yourstore.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Address</label>
                  <textarea
                    required
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {role === 'reseller' && (
                  <>
                    <div>
                      <label className={labelClass}>Payout Method</label>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {PAYMENT_ORDER.map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => handlePaymentMethodChange(method)}
                            className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 text-center transition-all ${
                              form.bank_type === method
                                ? 'border-violet-400 bg-violet-500/10 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)]'
                                : 'border-white/15 bg-white/5 hover:border-white/30'
                            }`}
                          >
                            <span className="text-lg">{PAYMENT_METHODS[method].icon}</span>
                            <span className="text-[11px] font-semibold leading-tight text-slate-200">
                              {PAYMENT_METHODS[method].label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {!activeMethod.noAccountNeeded && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {activeMethod.needsBankName && (
                          <div className="md:col-span-2">
                            <label className={labelClass}>Bank Name</label>
                            <select
                              required
                              value={form.bank_name}
                              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                              className={inputClass}
                            >
                              <option value="" className="bg-slate-900">
                                Select your bank
                              </option>
                              {PAKISTANI_BANKS.map((bank) => (
                                <option key={bank} value={bank} className="bg-slate-900">
                                  {bank}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className={labelClass}>{activeMethod.titleLabel}</label>
                          <input
                            required
                            value={form.bank_account_title}
                            onChange={(e) => setForm({ ...form, bank_account_title: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>{activeMethod.accountLabel}</label>
                          <input
                            required
                            value={form.bank_account_number}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                bank_account_number:
                                  activeMethod.accountInputMode === 'numeric'
                                    ? e.target.value.replace(/\D/g, '').slice(0, activeMethod.accountMaxLength)
                                    : e.target.value.slice(0, activeMethod.accountMaxLength),
                              })
                            }
                            inputMode={activeMethod.accountInputMode === 'numeric' ? 'numeric' : 'text'}
                            placeholder={activeMethod.accountPlaceholder}
                            maxLength={activeMethod.accountMaxLength}
                            className={`${inputClass} ${
                              form.bank_account_number && !accountNumberValid
                                ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20'
                                : ''
                            }`}
                          />
                          {form.bank_account_number && !accountNumberValid && (
                            <p className="mt-1 text-xs text-red-300">
                              Please match the expected format for {activeMethod.label}.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div
                      className={`rounded-2xl border p-4 text-xs ${
                        activeMethod.noAccountNeeded
                          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                          : 'border-violet-400/30 bg-violet-500/10 text-violet-200'
                      }`}
                    >
                      <p className="mb-1 font-semibold">
                        {activeMethod.noAccountNeeded ? '💵 Cash Payout' : '⚠️ Important Notice'}
                      </p>
                      <p>
                        {activeMethod.noAccountNeeded
                          ? activeMethod.hint
                          : `Please double-check your ${activeMethod.label} details before submitting. MaestraVibe is not responsible for payments sent to incorrect, closed, or blocked accounts. All commission transfers are processed automatically based on the details you provide, and any loss due to inaccurate information will not be reimbursed.`}
                      </p>
                      <label className="mt-3 flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={bankConfirmed}
                          onChange={(e) => setBankConfirmed(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-violet-400/50 bg-white/10 text-violet-500"
                        />
                        <span>
                          {activeMethod.noAccountNeeded
                            ? 'I understand my commission will be paid in cash.'
                            : 'I confirm that the payout details above are accurate and belong to me.'}
                        </span>
                      </label>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStage('verify')} className={`flex-1 ${secondaryBtnClass}`}>
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (role === 'reseller' && !bankConfirmed)}
                    className={`flex-1 ${primaryBtnClass}`}
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

            {stage === 'done' && (
              <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-black text-white">Account Ready</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Your {role === 'reseller' ? 'reseller' : 'customer'} account has been created successfully.
                  {role === 'reseller' && ' It is pending admin approval before you can access the dashboard.'}
                </p>
                <Link href="/login" className={`mt-4 inline-block ${primaryBtnClass}`}>
                  Go to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}