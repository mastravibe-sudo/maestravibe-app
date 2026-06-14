'use client';

import { useState, useEffect } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'exists'>('idle');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Thoda zyada scroll karne ke baad dikhao
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setStatus('exists');
        return;
      }
      if (!res.ok) throw new Error(data.message || 'Failed');

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  if (!isVisible) return null;

  return (
    <section className="bg-purple-50 rounded-2xl px-6 py-12 text-center mt-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay in the loop</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
        Get new arrivals and exclusive offers straight to your inbox.
      </p>

      {status === 'success' ? (
        <p className="text-green-600 font-medium text-lg">🎉 You're subscribed!</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 border border-gray-300 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-xl transition disabled:opacity-70"
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'exists' && <p className="text-amber-600 mt-3 text-sm">Already subscribed.</p>}
      {status === 'error' && <p className="text-red-500 mt-3 text-sm">Something went wrong.</p>}
    </section>
  );
}