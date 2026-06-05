'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const orbRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");

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
    setSubscribeError("");

    if (!email || !email.includes("@")) {
      setSubscribeError("Please enter a valid email address!");
      return;
    }

    setSubscribing(true);

    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Already subscribed — treat as success (idempotent UX)
        setSubscribed(true);
        setEmail("");
      } else if (!res.ok) {
        throw new Error(data.message || "Subscription failed");
      } else {
        setSubscribed(true);
        setEmail("");
      }

      setTimeout(() => setSubscribed(false), 4000);
    } catch (err: any) {
      setSubscribeError(err.message || "Something went wrong. Try again.");
    } finally {
      setSubscribing(false);
    }
  };

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
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition duration-500" />
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Maestra Vibe
              </h2>
            </div>
            <p className="text-gray-300 mb-6">
              Innovating digital experiences one line of code at a time.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'About', 'Services', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                    className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center group"
                  >
                    <span className="w-1 h-1 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition duration-300" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-300">Email</p>
                  <a href="mailto:mastravibe@gmail.com" className="text-white hover:text-blue-400 transition">
                    mastravibe@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-300">Phone</p>
                  <a href="tel:+923274050806" className="text-white hover:text-blue-400 transition">
                    +92 327-4050806
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
            <p className="text-gray-300 mb-4">Subscribe for latest offers and updates.</p>

            <form onSubmit={handleSubscribe}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSubscribeError(""); }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-white"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg px-5 py-1.5 transition text-sm font-medium"
                >
                  {subscribing ? "..." : "Join"}
                </button>
              </div>
            </form>

            {subscribeError && (
              <p className="mt-2 text-red-400 text-sm">❌ {subscribeError}</p>
            )}
            {subscribed && (
              <p className="mt-3 text-green-400 text-sm font-medium">✅ Successfully Subscribed!</p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © <span className="text-blue-400">{new Date().getFullYear()}</span> MaestraVibe. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition">Terms</Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white transition">Cookies</Link>
          </div>
        </div>
      </div>

      {/* Floating orb */}
      <div ref={orbRef} className="orb absolute w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 filter blur-3xl pointer-events-none" />

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

export default Footer;