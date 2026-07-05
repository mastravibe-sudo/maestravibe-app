'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AccountPage() {
  const [role, setRole] = useState<'customer' | 'reseller'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    bank_type: '',
    bank_name: '',
    bank_account_title: '',
    bank_account_number: '',
  });

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
      setError('Please confirm your bank/account details are accurate before submitting');
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
        bank_name: form.bank_name,
        bank_account_title: form.bank_account_title,
        bank_account_number: form.bank_account_number,
      };

      const res = await fetch('/api/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setStage('done');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-violet-100 bg-white shadow-2xl shadow-violet-100/60">
        <div className="border-b border-gray-100 px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-600">MaestraVibe</p>
              <h1 className="text-2xl font-black text-gray-900">Create Your Account</h1>
            </div>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              {role === 'reseller' ? 'Reseller' : 'Customer'}
            </span>
          </div>
        </div>

        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {stage === 'role' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Choose your account type</p>
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`rounded-2xl border p-4 text-left transition ${role === 'customer' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}
                >
                  <div className="text-base font-bold text-gray-900">Customer</div>
                  <div className="text-xs text-gray-500">Buy products and track orders</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('reseller')}
                  className={`rounded-2xl border p-4 text-left transition ${role === 'reseller' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}
                >
                  <div className="text-base font-bold text-gray-900">Reseller</div>
                  <div className="text-xs text-gray-500">Sell products and earn commission</div>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setStage('email')}
                className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700"
              >
                Continue
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-violet-600 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          )}

          {stage === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  I agree to the{' '}
                  <a href="/policy" target="_blank" className="font-semibold text-violet-600 hover:underline">
                    Terms & Policy
                  </a>
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStage('role')}
                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={loading || !email || !password || !confirmPassword || !termsAccepted}
                  className="flex-1 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </button>
              </div>
            </div>
          )}

          {stage === 'verify' && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-center text-lg font-bold tracking-[0.4em] outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStage('email')}
                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={verifyCode}
                  disabled={loading || code.length < 6}
                  className="flex-1 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
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
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Full Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="03XX-XXXXXXX"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Age</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Website / Store (optional)</label>
                  <input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://yourstore.com"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Address</label>
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              {role === 'reseller' && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Bank Type</label>
                      <select
                        required
                        value={form.bank_type}
                        onChange={(e) => setForm({ ...form, bank_type: e.target.value })}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                      >
                        <option value="">Select bank type</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="JazzCash">JazzCash</option>
                        <option value="EasyPaisa">EasyPaisa</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Bank Name</label>
                      <input
                        required
                        value={form.bank_name}
                        onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Account Title</label>
                      <input
                        required
                        value={form.bank_account_title}
                        onChange={(e) => setForm({ ...form, bank_account_title: e.target.value })}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Account Number</label>
                      <input
                        required
                        value={form.bank_account_number}
                        onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })}
                        placeholder="e.g. 03XXXXXXXXX or bank account number"
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800">
                    <p className="font-semibold mb-1">⚠️ Important Notice</p>
                    <p>
                      Please double-check your bank/account details before submitting. MaestraVibe is not
                      responsible for payments sent to incorrect, closed, or blocked accounts. All commission
                      transfers are processed automatically based on the details you provide, and any loss
                      due to inaccurate information will not be reimbursed.
                    </p>
                    <label className="flex items-start gap-2 mt-3">
                      <input
                        type="checkbox"
                        checked={bankConfirmed}
                        onChange={(e) => setBankConfirmed(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-amber-400 text-violet-600"
                      />
                      <span>I confirm that the bank/account details above are accurate and belong to me.</span>
                    </label>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStage('verify')}
                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || (role === 'reseller' && !bankConfirmed)}
                  className="flex-1 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {stage === 'done' && (
            <div className="rounded-3xl bg-green-50 p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-gray-900">Account Ready</h2>
              <p className="mt-2 text-sm text-gray-600">
                Your {role === 'reseller' ? 'reseller' : 'customer'} account has been created successfully.
                {role === 'reseller' && ' It is pending admin approval before you can access the dashboard.'}
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block rounded-2xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-700"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}