'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useMarket } from '@/lib/market-context';
import type { Market } from '@/lib/market';

const CATEGORIES = [
  { name: 'All',         value: 'all'          },
  { name: 'Women',       value: 'women'        },
  { name: 'Men',         value: 'men'          },
  { name: 'Kids',        value: 'kids'         },
  { name: 'Kurta',       value: 'kurta-shalwar'},
  { name: 'Dress',       value: 'dress'        },
  { name: 'Tops',        value: 'tops'         },
  { name: 'Jeans',       value: 'jeans-pants'  },
  { name: 'Shoes',       value: 'shoes'        },
  { name: 'Bags',        value: 'bags'         },
  { name: 'Jewelry',     value: 'jewelry'      },
  { name: 'Accessories', value: 'accessories'  },
  { name: 'Winter',      value: 'winter'       },
  { name: 'Summer',      value: 'summer'       },
  { name: 'Beauty',      value: 'beauty'       },
  { name: 'Sports',      value: 'sports'       },
  { name: 'Home',        value: 'home'         },
  { name: 'Electronics', value: 'electronics'  },
  { name: 'Books',       value: 'books'        },
  { name: 'Sale',        value: 'sale'         },
];

interface Props {
  cartCount?: number;
  onCartClick?: () => void;
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" />
    </svg>
  );
}
function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.122 1.532 5.859L.057 23.97l6.255-1.643A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.876 9.876 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.868 9.868 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z" />
    </svg>
  );
}

// ── Market Switcher ────────────────────────────────────────────
function MarketSwitcher() {
  const { market, setMarket } = useMarket();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options: { value: Market; flag: string; label: string }[] = [
    { value: 'pk', flag: '🇵🇰', label: 'Pakistan' },
    { value: 'us', flag: '🇺🇸', label: 'USA'      },
    { value: 'ae', flag: '🇦🇪', label: 'UAE'      },
    { value: 'uk', flag: '🇬🇧', label: 'UK'       },
  ];

  const current = options.find((o) => o.value === market) ?? options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border-2 border-gray-200 hover:border-violet-400 bg-white text-sm font-semibold transition-all"
        title="Switch market"
      >
        <span className="text-base">{current.flag}</span>
        <span className="hidden sm:inline text-gray-700">{current.label}</span>
        <ChevronDown open={open} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setMarket(opt.value);
                setOpen(false);
                // Allow context to update then reload
                setTimeout(() => window.location.reload(), 50);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors ${
                market === opt.value ? 'text-violet-600 font-semibold bg-violet-50' : 'text-gray-700'
              }`}
            >
              <span className="text-base">{opt.flag}</span>
              <span>{opt.label}</span>
              {market === opt.value && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header({ cartCount = 0, onCartClick }: Props) {
  const { market, config } = useMarket();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen,    setCatOpen]    = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [search,     setSearch]     = useState('');
  const router   = useRouter();
  const pathname = usePathname();
  const catRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/?search=${encodeURIComponent(search.trim())}`);
  };

  const handleCategory = (value: string) => {
    router.push(value === 'all' ? '/' : `/?category=${value}`);
    setCatOpen(false);
    setMobileOpen(false);
  };

  const navLinks = [
    { href: '/',         label: 'Shop'     },
    { href: '/about',    label: 'About'    },
    { href: '/services', label: 'Services' },
    { href: '/policy',   label: 'Policy'   },
    { href: '/account',  label: 'Account'  },
  ];

  // Market-aware announcement bar
  const announcementMap: Record<string, string> = {
    pk: `🇵🇰 Free delivery above Rs. 2,000 · Cash on Delivery · ${config?.phone ?? ''}`,
    us: `🇺🇸 Free shipping above $50 · Secure checkout · ${config?.phone ?? ''}`,
    ae: `🇦🇪 Free delivery above AED 150 · Secure checkout · ${config?.phone ?? ''}`,
    uk: `🇬🇧 Free delivery above £30 · Secure checkout · ${config?.phone ?? ''}`,
  };
  const announcementText = announcementMap[market] ?? announcementMap['pk'];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white border-b border-gray-100'
    }`}>
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-violet-700 text-white text-xs py-2 text-center tracking-wide font-medium">
        {announcementText}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">

          {/* ── Logo ── */}
          {/* Replace /images/logo.png with your actual logo path */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            {/* LOGO IMAGE — set your image path below */}
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-md shadow-violet-200">
              {/* Uncomment next line and remove the fallback span once you have a logo */}
              {/* <Image src="/images/logo.png" alt="MaestraVibe" fill className="object-contain" priority /> */}
              <span className="text-white font-black text-lg">M</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900">
              MAESTRA<span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">VIBE</span>
            </span>
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="flex w-full rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-violet-500 transition-colors">
              <div className="relative" ref={catRef}>
                <button
                  type="button"
                  onClick={() => setCatOpen(!catOpen)}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition border-r border-gray-200 whitespace-nowrap"
                >
                  Categories <ChevronDown open={catOpen} />
                </button>
                {catOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 max-h-72 overflow-y-auto">
                    {CATEGORIES.map(c => (
                      <button key={c.value} onClick={() => handleCategory(c.value)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition">
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="flex-1 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-white"
              />
              <button type="submit" className="px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white transition-all">
                <SearchIcon />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === l.href ? 'text-violet-600 bg-violet-50' : 'text-gray-600 hover:text-violet-600 hover:bg-gray-50'
                  }`}>
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Market Switcher */}
            <MarketSwitcher />

            {/* WhatsApp — PK only */}
            {market === 'pk' && (
              <a href={`https://wa.me/${config?.whatsapp ?? ''}`} target="_blank" rel="noreferrer"
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition"
                title="WhatsApp">
                <WhatsAppIcon />
              </a>
            )}

            {/* Cart */}
            <button onClick={onCartClick}
              className="relative flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-4 py-2.5 rounded-xl transition-all font-medium text-sm shadow-md shadow-violet-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
              <CartIcon />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none ring-2 ring-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden mt-3 flex rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-violet-500 transition-colors">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none" />
          <button type="submit" className="px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 transition-all">
            <SearchIcon />
          </button>
        </form>
      </div>

      {/* Category strip — swipeable on mobile */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1.5 overflow-x-auto py-2 scrollbar-hide snap-x snap-mandatory scroll-px-4 -mx-4 px-4">
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => handleCategory(c.value)}
                className="flex-shrink-0 snap-start px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-violet-100 hover:text-violet-700 transition whitespace-nowrap active:scale-95">
                {c.name}
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
              className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-violet-50 hover:text-violet-600 font-medium transition">
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100">
            <MarketSwitcher />
          </div>
          <div className="pt-2 border-t border-gray-100 mt-2">
            <p className="text-xs text-gray-400 px-4 mb-2 font-semibold uppercase tracking-wide">Categories</p>
            <div className="grid grid-cols-3 gap-1">
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => handleCategory(c.value)}
                  className="text-left px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-600 transition">
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}