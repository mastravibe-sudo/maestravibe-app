// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthBackground from '@/components/auth/AuthBackground';
import EyeIcon from '@/components/auth/EyeIcon';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      const destination =
        data.role === 'reseller' ? '/dashboard' :
        data.role === 'supplier' ? '/supplier/dashboard' :
        '/account/dashboard';

      router.push(destination);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-[0_8px_60px_-10px_rgba(79,70,229,0.55)] backdrop-blur-2xl">
          <p className="bg-gradient-to-r from-violet-300 via-white to-indigo-300 bg-clip-text text-xs font-bold uppercase tracking-[0.35em] text-transparent">
            MaestraVibe
          </p>
          <h1 className="mb-6 text-2xl font-black text-white">Login to Your Account</h1>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-200">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-violet-300 hover:text-violet-200 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 pr-11 text-sm text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/25"
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
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-5px_rgba(79,70,229,0.55)] transition hover:from-violet-700 hover:to-indigo-800 hover:shadow-[0_14px_34px_-6px_rgba(79,70,229,0.65)] disabled:opacity-60 disabled:shadow-none"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-5 flex justify-center text-sm">
            <p className="text-slate-300">
              New to MaestraVibe?{' '}
              <Link href="/account" className="font-semibold text-violet-300 hover:text-violet-200 hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}