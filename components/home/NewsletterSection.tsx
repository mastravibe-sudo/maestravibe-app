// components/home/NewsletterSection.tsx
'use client';

import { useState } from 'react';

export default function NewsletterSection() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  return (
    <section className="bg-gray-900 py-14">
      <div className="max-w-xl mx-auto px-4 text-center">
        <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Newsletter</p>
        <h2 className="text-2xl font-black text-white mb-2">Get 10% Off Your First Order</h2>
        <p className="text-gray-400 text-sm mb-6">Subscribe for exclusive deals, new arrivals &amp; special offers.</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            value={newsletterEmail}
            onChange={e => setNewsletterEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl text-sm bg-gray-800 border-2 border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <button
            onClick={() => { if (newsletterEmail.trim()) setNewsletterDone(true); }}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm transition-colors whitespace-nowrap"
          >
            Subscribe
          </button>
        </div>
        {newsletterDone && <p className="text-green-400 text-sm mt-3 font-semibold">✅ You're subscribed! Welcome to MaestraVibe.</p>}
      </div>
    </section>
  );
}