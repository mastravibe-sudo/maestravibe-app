'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const CATEGORIES = [
  { name: "Sab",          value: "all",           icon: "✨" },

  { name: "Women",        value: "women",          icon: "👗" },

  { name: "Men",          value: "men",            icon: "👔" },

  { name: "Kids",         value: "kids",           icon: "🧒" },

  { name: "Kurta",        value: "kurta-shalwar",  icon: "🥻" },

  { name: "Dress",        value: "dress",          icon: "👘" },

  { name: "Tops",         value: "tops",           icon: "👕" },

  { name: "Jeans",        value: "jeans-pants",    icon: "👖" },

  { name: "Shoes",        value: "shoes",          icon: "👟" },

  { name: "Bags",         value: "bags",           icon: "👜" },

  { name: "Jewelry",      value: "jewelry",        icon: "💍" },

  { name: "Accessories",  value: "accessories",    icon: "🧣" },

  { name: "Winter",       value: "winter",         icon: "🧥" },

  { name: "Summer",       value: "summer",         icon: "☀️" },

  { name: "Beauty",       value: "beauty",         icon: "💄" },

  { name: "Sports",       value: "sports",         icon: "⚽" },

  { name: "Home",         value: "home",           icon: "🏠" },

  { name: "Electronics",  value: "electronics",    icon: "📱" },

  { name: "Books",        value: "books",          icon: "📚" },

  { name: "Sale 🔥",      value: "sale",           icon: "🏷️" },
];

interface Props {
  cartCount?: number;
  onCartClick?: () => void;
}

export default function Header({ cartCount = 0, onCartClick }: Props) {
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [catOpen,     setCatOpen]     = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [search,      setSearch]      = useState('');
  const router   = useRouter();
  const pathname = usePathname();
  const catRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close cat dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/home?search=${encodeURIComponent(search.trim())}`);
  };

  const handleCategory = (value: string) => {
    router.push(`/home?category=${value}`);
    setCatOpen(false);
    setMobileOpen(false);
  };

  const navLinks = [
    { href: '/home',     label: 'Shop'     },
    { href: '/about',    label: 'About'    },
    { href: '/services', label: 'Services' },
    { href: '/policy', label: 'Policy' },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white border-b border-gray-100'}`}>

      {/* Top bar */}
      <div className="bg-gray-900 text-white text-xs py-1.5 text-center tracking-wide">
        🚚 Free delivery on orders above Rs. 2000 &nbsp;·&nbsp; Cash on Delivery available
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-gray-900">
              MAESTRA<span className="text-purple-600">VIBE</span>
            </span>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="flex w-full rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-purple-500 transition-colors">
              {/* Category dropdown */}
              <div className="relative" ref={catRef}>
                <button type="button" onClick={() => setCatOpen(!catOpen)}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition border-r border-gray-200 whitespace-nowrap">
                  Categories
                  <svg className={`w-3.5 h-3.5 transition-transform ${catOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {catOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                    {CATEGORIES.map(c => (
                      <button key={c.value} onClick={() => handleCategory(c.value)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition">
                        {c.icon} {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search input */}
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="flex-1 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-white" />

              <button type="submit" className="px-4 bg-purple-600 hover:bg-purple-700 text-white transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            {/* Nav links — desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${pathname === l.href ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'}`}>
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* WhatsApp */}
            <a href="https://wa.me/923274050806" target="_blank" rel="noreferrer"
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition text-lg">
              💬
            </a>

            {/* Cart */}
            <button onClick={onCartClick}
              className="relative flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition">
              <span className="text-lg">🛒</span>
              <span className="hidden sm:inline text-sm font-medium">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600">
              {mobileOpen
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden mt-3 flex rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-purple-500 transition-colors">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none" />
          <button type="submit" className="px-4 bg-purple-600 text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Category pills strip */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => handleCategory(c.value)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition whitespace-nowrap">
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-600 font-medium transition">
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <p className="text-xs text-gray-400 px-4 mb-2">Categories</p>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => handleCategory(c.value)}
                  className="text-left px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition">
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}