// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      router.push(data.role === 'reseller' ? '/dashboard' : '/account/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-violet-100 bg-white shadow-2xl shadow-violet-100/60 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-600">MaestraVibe</p>
        <h1 className="text-2xl font-black text-gray-900 mb-6">Login to Your Account</h1>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-violet-600 hover:underline font-semibold">Forgot Password?</Link>
          <Link href="/account" className="text-gray-500 hover:underline">Create account</Link>
        </div>
      </div>
    </div>
  );
}