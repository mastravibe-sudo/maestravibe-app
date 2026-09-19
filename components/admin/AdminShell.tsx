// components/admin/AdminShell.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback, memo, useEffect } from 'react';
import { adminFetch } from '@/lib/admin-fetch';
import {
  ProductsIco, OrdersIco, SubsIco, SubmitIco, HomeIco, AccountsIco, CJIco, LogoutIcon, Ico, DashIco,
} from './shared';

const NAV = [
  { href: '/admin/dashboard',   label: 'Dashboard',   icon: <DashIco />,     desc: 'Sales & analytics',    highlight: true },
  { href: '/admin/products',    label: 'Products',    icon: <ProductsIco />, desc: 'Catalog & inventory' },
  { href: '/admin/orders',      label: 'Orders',       icon: <OrdersIco />,  desc: 'Sales & fulfillment' },
  { href: '/admin/cj',          label: 'CJ / HHC',    icon: <CJIco />,       desc: 'Dropshipping sync' },
  { href: '/admin/suppliers',   label: 'Suppliers',   icon: <AccountsIco />, desc: 'Approvals & CNIC review', highlight: true },
  { href: '/admin/subscribers', label: 'Subscribers', icon: <SubsIco />,     desc: 'Newsletter list' },
  { href: '/admin/submissions', label: 'Submissions', icon: <SubmitIco />,   desc: 'Contact & careers' },
  { href: '/admin/homepage',    label: 'Homepage',    icon: <HomeIco />,     desc: 'Site CMS' },
  { href: '/admin/accounts',    label: 'Accounts',    icon: <AccountsIco />, desc: 'Customers & resellers' },
];

const SidebarNav = memo(function SidebarNav({ pathname, sidebarOpen }: { pathname: string; sidebarOpen: boolean }) {
  return (
    <nav className="flex-1 min-h-0 overflow-y-auto py-3 space-y-0.5 px-2">
      {NAV.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link key={item.href} href={item.href} prefetch
            title={!sidebarOpen ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
              active
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                : item.highlight
                  ? 'text-violet-300 hover:bg-gray-800 hover:text-white border border-violet-800/40'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}>
            <span className="shrink-0">{item.icon}</span>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{item.label}</p>
                <p className={`text-xs truncate ${active ? 'text-violet-100' : item.highlight ? 'text-violet-400' : 'text-gray-500'}`}>{item.desc}</p>
              </div>
            )}
            {item.highlight && !active && sidebarOpen && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
            )}
          </Link>
        );
      })}
    </nav>
  );
});

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 768) setSidebarOpen(true);
  }, [pathname]);

  const logout = useCallback(async () => {
    await adminFetch('/api/admin-login', { method: 'DELETE' });
    router.push('/admin/login');
  }, [router]);

  const toggleSidebar = useCallback(() => setSidebarOpen(p => !p), []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-violet-50/30 overflow-hidden">

      {/* Top Nav */}
      <div className="bg-white border-b border-gray-100 shrink-0 shadow-sm z-30">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-md shadow-violet-200">
              <span className="text-white font-black text-sm">MV</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-black text-gray-900 leading-none">Admin Dashboard</h1>
              <p className="hidden sm:block text-xs text-gray-500 mt-0.5">MaestraVibe Store Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleSidebar} className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-600 bg-white" aria-label="Open admin navigation">
              <Ico d="M4 6h16M4 12h16M4 18h16" cls="w-5 h-5" />
            </button>
            <button onClick={logout}
              className="min-h-11 px-3 sm:px-4 py-2 text-sm text-gray-600 hover:text-red-500 border-2 border-gray-200 hover:border-red-200 rounded-xl bg-white transition-all font-semibold flex items-center gap-1.5">
              <LogoutIcon /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto px-4 md:px-8 py-6 flex flex-col">
        <div className="flex-1 min-h-0 flex rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden bg-white relative">

          {sidebarOpen && <button type="button" aria-label="Close admin navigation" onClick={() => setSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/40 z-30" />}

          {/* Sidebar */}
          <aside className={`fixed md:relative inset-y-0 left-0 z-40 ${sidebarOpen ? 'translate-x-0 md:w-60' : '-translate-x-full md:translate-x-0 md:w-16'} w-72 shrink-0 bg-gray-900 flex flex-col transition-all duration-200 h-full relative`}>
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shrink-0">
                <ProductsIco />
              </div>
              {sidebarOpen && <span className="text-white font-black text-sm">Store CMS</span>}
            </div>

            <SidebarNav pathname={pathname} sidebarOpen={sidebarOpen} />

            {sidebarOpen && (
              <div className="px-4 py-3 border-t border-gray-800 shrink-0">
                <p className="text-xs text-gray-500 text-center">MaestraVibe Admin v2</p>
              </div>
            )}

            {/* Clearly visible collapse/expand control — pinned on the sidebar edge */}
            <button
              type="button"
              onClick={toggleSidebar}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              className="hidden md:flex absolute top-4 -right-3.5 w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-700 text-white items-center justify-center shadow-lg shadow-violet-900/30 border-2 border-white transition-all z-20">
              <Ico d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} cls="w-3.5 h-3.5" />
            </button>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-gray-50 p-3 sm:p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}