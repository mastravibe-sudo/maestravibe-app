// components/footer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMarket } from '@/lib/market-context';

const Footer: React.FC = () => {
  const { market, config } = useMarket();
  const orbRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (orbRef.current) {
        orbRef.current.style.left = `${e.clientX}px`;
        orbRef.current.style.top = `${e.clientY}px`;
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeError('');
    if (!email || !email.includes('@')) {
      setSubscribeError('Please enter a valid email address!');
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.status === 409 || res.ok) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 4000);
      } else {
        throw new Error(data.message || 'Subscription failed');
      }
    } catch (err: any) {
      setSubscribeError(err.message || 'Something went wrong. Try again.');
    } finally {
      setSubscribing(false);
    }
  };

  // Market-specific content
  const footerContent = {
    pk: {
      tagline: 'Pakistan\'s trusted online store — quality products, fast delivery, Cash on Delivery.',
      policies: [
        { label: 'Privacy Policy',    href: '/policy'   },
        { label: 'Refund Policy',     href: '/refund-policy'   },
        { label: 'Shipping Policy',   href: '/shipping-policy' },
      ],
      contact: [
        { icon: 'email', label: 'Email', value: config.email,  href: `mailto:${config.email}`  },
        { icon: 'phone', label: 'Phone', value: config.phone,  href: `tel:${config.phone.replace(/\s/g, '')}` },
        { icon: 'whatsapp', label: 'WhatsApp', value: config.phone, href: `https://wa.me/${config.whatsapp}` },
      ],
      deliveryNote: 'Free delivery above Rs. 2,000 · COD available',
    },
    us: {
      tagline: 'Premium products delivered across the USA — secure checkout, fast shipping.',
      policies: [
        { label: 'Privacy Policy',    href: '/policy'   },
        { label: 'Refund Policy',     href: '/refund-policy'   },
        { label: 'Shipping Policy',   href: '/shipping-policy' },
        { label: 'Terms of Service',  href: '/terms'    },
      ],
      contact: [
        { icon: 'email', label: 'Email',   value: config.email,   href: `mailto:${config.email}`  },
        { icon: 'phone', label: 'Phone',   value: config.phone,   href: `tel:${config.phone.replace(/\s/g, '')}` },
        { icon: 'address', label: 'Address', value: config.address, href: '#' },
      ],
      deliveryNote: 'Free shipping above $50 · Secure payment',
    },
  };

  const content = footerContent[market];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl animate-float1" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl animate-float2" />
        <div className="absolute bottom-10 left-1/2 w-48 h-48 bg-cyan-500 rounded-full filter blur-3xl animate-float3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-20 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">

          {/* Logo & About */}
          <div className="group">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-black tracking-tighter">
                MAESTRA<span className="text-violet-400">VIBE</span>
              </span>
              <span className="text-xl">{market === 'pk' ? '🇵🇰' : '🇺🇸'}</span>
            </div>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">{content.tagline}</p>
            <p className="text-xs text-violet-300 font-medium">{content.deliveryNote}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {(['Home', 'About', 'Services', 'Policy'] as const).map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                    className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center group text-sm"
                  >
                    <span className="w-1 h-1 bg-violet-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition duration-300" />
                    {item}
                  </Link>
                </li>
              ))}
              {content.policies.map((p) => (
                <li key={p.href}>
                  <Link href={p.href}
                    className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center group text-sm">
                    <span className="w-1 h-1 bg-violet-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition duration-300" />
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Get in Touch</h3>
            <ul className="space-y-4">
              {content.contact.map((item) => (
                <li key={item.label} className="flex items-start">
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center">
                      <ContactIcon type={item.icon} />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <a href={item.href}
                      className="text-white hover:text-violet-300 transition text-sm break-all"
                      target={item.icon === 'whatsapp' ? '_blank' : undefined}
                      rel={item.icon === 'whatsapp' ? 'noreferrer' : undefined}>
                      {item.value}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
            <p className="text-gray-300 mb-4 text-sm">
              {market === 'pk'
                ? 'Subscribe for latest deals and new arrivals!'
                : 'Get exclusive US offers and product updates.'}
            </p>
            <form onSubmit={handleSubscribe}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSubscribeError(''); }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-500 text-white text-sm"
                />
                <button type="submit" disabled={subscribing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 text-white rounded-lg px-4 py-1.5 transition text-sm font-medium">
                  {subscribing ? '...' : 'Join'}
                </button>
              </div>
            </form>
            {subscribeError && <p className="mt-2 text-red-400 text-xs">❌ {subscribeError}</p>}
            {subscribed && <p className="mt-3 text-green-400 text-sm font-medium">✅ Successfully Subscribed!</p>}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © <span className="text-violet-400">{new Date().getFullYear()}</span> MaestraVibe {market === 'us' ? 'USA' : 'Pakistan'}. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/policy" className="text-gray-400 hover:text-white transition">Privacy</Link>
            <Link href="/refund-policy" className="text-gray-400 hover:text-white transition">Refund</Link>
            <Link href="/shipping-policy" className="text-gray-400 hover:text-white transition">Shipping</Link>
          </div>
        </div>
      </div>

      <div ref={orbRef} className="orb absolute w-64 h-64 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 filter blur-3xl pointer-events-none" />

      <style jsx>{`
        @keyframes float1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(20px, 20px); } }
        @keyframes float2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-15px, 15px); } }
        @keyframes float3 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(0, -20px); } }
        .animate-float1 { animation: float1 8s ease-in-out infinite; }
        .animate-float2 { animation: float2 10s ease-in-out infinite; }
        .animate-float3 { animation: float3 12s ease-in-out infinite; }
        .orb { transform: translate(-50%, -50%); opacity: 0.3; }
      `}</style>
    </footer>
  );
};

function ContactIcon({ type }: { type: string }) {
  if (type === 'email') return (
    <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
  if (type === 'phone') return (
    <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
  if (type === 'whatsapp') return (
    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
  return (
    <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    </svg>
  );
}

export default Footer;