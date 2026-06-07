'use client';

// components/Newsletter.tsx
import { useState } from 'react';

export default function Newsletter() {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success' | 'error' | 'exists'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res  = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.status === 409) { setStatus('exists'); return; }
      if (!res.ok) throw new Error(data.message);

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="bg-purple-50 rounded-2xl px-6 py-10 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay in the loop</h2>
      <p className="text-gray-500 text-sm mb-6">Get new arrivals and exclusive offers straight to your inbox.</p>

      {status === 'success' ? (
        <p className="text-green-600 font-medium">🎉 You're subscribed!</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-purple-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'exists' && (
        <p className="text-yellow-600 text-sm mt-2">This email is already subscribed.</p>
      )}
      {status === 'error' && (
        <p className="text-red-500 text-sm mt-2">Something went wrong. Please try again.</p>
      )}
    </section>
  );
}