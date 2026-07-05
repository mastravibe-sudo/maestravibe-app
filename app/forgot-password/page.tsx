'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submitForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      setSuccess(data.message || 'If an account exists with this email, a new password has been sent.');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-violet-100 bg-white shadow-2xl shadow-violet-100/60">
        <div className="border-b border-gray-100 px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-600">MaestraVibe</p>
          <h1 className="mt-4 text-3xl font-black text-gray-900">Forgot Password</h1>
          <p className="mt-2 text-sm text-gray-500">Enter your email and we&apos;ll send a new password to your inbox.</p>
        </div>

        <div className="px-6 py-6 space-y-5">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={submitForgotPassword} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send New Password'}
            </button>
          </form>

          <div className="text-sm text-gray-500">
            Remembered your password?{' '}
            <Link href="/login" className="font-semibold text-violet-600 hover:text-violet-700">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
