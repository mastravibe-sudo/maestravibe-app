'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useMarket } from '@/lib/market-context';
import type { Market } from '@/lib/market';
import { UserRound } from 'lucide-react';

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

// Shape returned by /api/search — adjust to match your actual product schema
interface SearchSuggestion {
  id: string;
  name: string;
  slug: string;
  image?: string;
  price?: number;
  category?: string;
}

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
function XIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
function SparkleIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l1.6 5.8L19 9l-5.4 1.2L12 16l-1.6-5.8L5 9l5.4-1.2L12 2z" />
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
        className="flex items-center gap-1.5 px-2.5 py-2 min-h-11 rounded-xl border-2 border-gray-200 hover:border-violet-400 bg-white text-sm font-semibold transition-all"
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
                setTimeout(() => window.location.reload(), 50);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors ${
                market === opt.value ? 'text-violet-700 font-semibold bg-violet-50' : 'text-gray-700'
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

// ── Shared Search Bar (used for both desktop + mobile) ─────────
// Handles: debounced live suggestions, keyboard navigation, clear button, loading state.
function SearchBar({
  variant,
  categories,
  onNavigateSearch,
}: {
  variant: 'desktop' | 'mobile';
  categories: typeof CATEGORIES;
  onNavigateSearch: (query: string) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const catRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced fetch of live suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const query = search.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data.results) ? data.results.slice(0, 6) : []);
          setShowSuggestions(true);
          setActiveIndex(-1);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce — feels instant without hammering the API on every keystroke

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const submitSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      setShowSuggestions(false);
      onNavigateSearch(trimmed);
    },
    [onNavigateSearch]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      router.push(`/?openProduct=${suggestions[activeIndex].id}`);
      return;
    }
    submitSearch(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const clearSearch = () => {
    setSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const inputId = `site-search-${variant}`;
  const listboxId = `${inputId}-listbox`;

  return (
    <div ref={boxRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        role="search"
        className="flex w-full rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-violet-500 transition-colors"
      >
        {variant === 'desktop' && (
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
                {categories.map((c) => (
                  <Link
                    key={c.value}
                    href={c.value === 'all' ? '/' : `/?category=${c.value}`}
                    onClick={() => setCatOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative flex-1">
          <input
            id={inputId}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => search.trim().length >= 2 && setShowSuggestions(true)}
            placeholder="Search products, brands, categories..."
            className="w-full pl-4 pr-9 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-white"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls={listboxId}
            aria-autocomplete="list"
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <XIcon />
            </button>
          )}
        </div>

        <button
          type="submit"
          aria-label="Search"
          className="px-4 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white transition-all"
        >
          <SearchIcon />
        </button>
      </form>

      {/* Live suggestions dropdown */}
      {showSuggestions && search.trim().length >= 2 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 max-h-96 overflow-y-auto"
        >
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <SpinnerIcon /> Searching...
            </div>
          )}

          {!loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              No products found for "{search.trim()}"
            </div>
          )}

          {!loading &&
            suggestions.map((item, idx) => (
              <Link
                key={item.id}
                href={`/?openProduct=${item.id}`}
                role="option"
                aria-selected={activeIndex === idx}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`flex items-center gap-3 px-4 py-2.5 transition ${
                  activeIndex === idx ? 'bg-violet-50' : 'hover:bg-gray-50'
                }`}
              >
                {item.image ? (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  {item.category && <p className="text-xs text-gray-400 capitalize">{item.category}</p>}
                </div>
                {typeof item.price === 'number' && (
                  <span className="text-sm font-semibold text-violet-700 shrink-0">
                    {item.price.toLocaleString()}
                  </span>
                )}
              </Link>
            ))}

          {!loading && suggestions.length > 0 && (
            <button
              type="button"
              onClick={() => submitSearch(search)}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-50 border-t border-gray-100 transition"
            >
              See all results for "{search.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header({ cartCount = 0, onCartClick }: Props) {
  const { market, config } = useMarket();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountHref, setAccountHref] = useState('/login');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch('/api/session', { cache: 'no-store' })
      .then(async (res) => {
        if (!mounted) return;
        const data = res.ok ? await res.json() : null;
        const role = data?.session?.role;
        setAccountHref(
          role === 'supplier' ? '/supplier/dashboard' :
          role === 'reseller' ? '/dashboard' :
          role === 'admin' ? '/admin/dashboard' :
          role ? '/account/dashboard' : '/login'
        );
      })
      .catch(() => {
        if (mounted) setAccountHref('/login');
      });
    return () => {
      mounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleNavigateSearch = (query: string) => {
    router.push(`/?search=${encodeURIComponent(query)}`);
  };

  const handleCategory = (value: string) => {
    router.push(value === 'all' ? '/' : `/?category=${value}`);
    setMobileOpen(false);
  };

  // ✅ NEW: Logo click — poori site "/" par hi SPA jaisa chalti hai
  // (ClientHome apna view state khud manage karta hai: home / shop /
  // product page). Agar user pehle se "/" par hai, to <Link href="/">
  // akela URL change nahi karta kyunke route wahi rehta hai — is liye
  // ek custom event fire karte hain jise ClientHome sunta hai aur turant
  // apna view "home" par reset kar deta hai, chahe URL badle ya na badle.
  const handleLogoClick = (e: React.MouseEvent) => {
    window.dispatchEvent(new Event('mv:reset-home'));
    if (pathname === '/') e.preventDefault();
  };

  const navLinks = [
    { href: '/', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/policy', label: 'Policy' },
    { href: accountHref, label: 'Account' },
  ];

  const announcementMap: Record<string, string> = {
    pk: `Free delivery above Rs. 2,000 · Cash on Delivery · ${config?.phone ?? ''}`,
    us: `Free shipping above $50 · Secure checkout · ${config?.phone ?? ''}`,
    ae: `Free delivery above AED 150 · Secure checkout · ${config?.phone ?? ''}`,
    uk: `Free delivery above £30 · Secure checkout · ${config?.phone ?? ''}`,
  };
  const marketFlag: Record<string, string> = { pk: '🇵🇰', us: '🇺🇸', ae: '🇦🇪', uk: '🇬🇧' };
  const announcementText = announcementMap[market] ?? announcementMap['pk'];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white border-b border-gray-100'
      }`}
    >
      <style>{`
        @keyframes headerShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Announcement bar — deep indigo → violet → indigo, matches the logo's cosmic palette */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-violet-800 to-indigo-950 text-white text-xs py-2 text-center tracking-wide font-medium">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
            backgroundSize: '200% 100%',
            animation: 'headerShimmer 5s linear infinite',
          }}
        />
        <span className="relative inline-flex items-center gap-1.5">
          <span className="text-sm leading-none">{marketFlag[market] ?? marketFlag.pk}</span>
          {announcementText}
          <SparkleIcon />
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link href="/" className="shrink-0 flex items-center gap-1 sm:gap-2 relative" onClick={handleLogoClick}>
            {/* Soft brand glow behind the logo, ties into the cosmic identity without overpowering the light header */}
            <div className="absolute -inset-2 rounded-full bg-violet-400/20 blur-xl -z-10" />
            {/* Logo — place the provided logo file at public/image1.png */}
            <div className="relative h-10 w-[76px] sm:h-14 sm:w-[150px]">
              <Image
                src="/image/image1.png"
                alt="Maestra Vibe"
                fill
                priority
                className="object-contain object-left"
                sizes="150px"
              />
            </div>
            <span className="whitespace-nowrap text-[10px] sm:text-xs font-bold text-gray-800">Maestra Market</span>
          </Link>

          {/* Search — desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-4">
            <SearchBar variant="desktop" categories={CATEGORIES} onNavigateSearch={handleNavigateSearch} />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto md:ml-0 shrink-0">
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === l.href ? 'text-violet-700 bg-violet-50' : 'text-gray-600 hover:text-violet-700 hover:bg-gray-50'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <MarketSwitcher />

            <Link
              href={accountHref}
              aria-label={accountHref === '/login' ? 'Log in to your account' : 'Open your profile'}
              title={accountHref === '/login' ? 'Login' : 'Profile'}
              className="flex h-11 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
            >
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </Link>

            {market === 'pk' && (
              <a
                href={`https://wa.me/${config?.whatsapp ?? ''}`}
                target="_blank"
                rel="noreferrer"
                className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition"
                title="WhatsApp"
              >
                <WhatsAppIcon />
              </a>
            )}

            <button
              onClick={onCartClick}
              className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white min-h-11 min-w-11 sm:px-4 py-2.5 rounded-xl transition-all font-medium text-sm shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <CartIcon />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none ring-2 ring-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-gray-50 transition"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Search — mobile */}
        <div className="lg:hidden mt-3">
          <SearchBar variant="mobile" categories={CATEGORIES} onNavigateSearch={handleNavigateSearch} />
        </div>
      </div>

      <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="w-full min-w-0 max-w-full flex gap-1.5 overflow-x-auto py-2 scrollbar-hide snap-x snap-mandatory scroll-px-4 -mx-4 px-4">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => handleCategory(c.value)}
                className={`flex-shrink-0 snap-start min-h-11 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap active:scale-95 ${
                  c.value === 'sale'
                    ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                    : 'text-gray-600 hover:bg-violet-100 hover:text-violet-700'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block min-h-11 px-4 py-3 rounded-xl text-gray-700 hover:bg-violet-50 hover:text-violet-700 font-medium transition"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100">
            <MarketSwitcher />
          </div>
          {market === 'pk' && (
            <a href={`https://wa.me/${config?.whatsapp ?? ''}`} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 px-4 py-3 rounded-xl text-green-700 hover:bg-green-50 font-medium transition">
              <WhatsAppIcon /> WhatsApp
            </a>
          )}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <p className="text-xs text-gray-400 px-4 mb-2 font-semibold uppercase tracking-wide">Categories</p>
            <div className="grid grid-cols-3 gap-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleCategory(c.value)}
                  className="text-left min-h-11 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-700 transition"
                >
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