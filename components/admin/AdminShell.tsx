// components/admin/AdminShell.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ProductsIco, OrdersIco, SubsIco, SubmitIco, HomeIco, AccountsIco, CJIco, LogoutIcon, Ico,
} from './shared';

// Dashboard icon
const DashIco = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const NAV = [
  // ✅ Dashboard sabse pehle
  { href: '/admin/dashboard',   label: 'Dashboard',   icon: <DashIco />,     desc: 'Sales & analytics',    highlight: true },
  { href: '/admin/products',    label: 'Products',    icon: <ProductsIco />, desc: 'Catalog & inventory' },
  { href: '/admin/orders',      label: 'Orders',      icon: <OrdersIco />,   desc: 'Sales & fulfillment' },
  { href: '/admin/cj',          label: 'CJ / HHC',    icon: <CJIco />,       desc: 'Dropshipping sync' },
  { href: '/admin/subscribers', label: 'Subscribers', icon: <SubsIco />,     desc: 'Newsletter list' },
  { href: '/admin/submissions', label: 'Submissions', icon: <SubmitIco />,   desc: 'Contact & careers' },
  { href: '/admin/homepage',    label: 'Homepage',    icon: <HomeIco />,     desc: 'Site CMS' },
  { href: '/admin/accounts',    label: 'Accounts',    icon: <AccountsIco />, desc: 'Customers & resellers' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const logout = async () => {
    await fetch('/api/admin-login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-violet-50/30 overflow-hidden">

      {/* Top Nav */}
      <div className="bg-white border-b border-gray-100 shrink-0 shadow-sm z-30">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-md shadow-violet-200">
              <span className="text-white font-black text-sm">MV</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-none">Admin Dashboard</h1>
              <p className="text-xs text-gray-400 mt-0.5">MaestraVibe Store Management</p>
            </div>
          </div>
          <button onClick={logout}
            className="px-4 py-2 text-sm text-gray-500 hover:text-red-500 border-2 border-gray-200 hover:border-red-200 rounded-xl bg-white transition-all font-semibold flex items-center gap-1.5">
            <LogoutIcon /> Logout
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto px-4 md:px-8 py-6 flex flex-col">
        <div className="flex-1 min-h-0 flex rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden bg-white">

          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} shrink-0 bg-gray-900 flex flex-col transition-all duration-200 h-full`}>
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shrink-0">
                <ProductsIco />
              </div>
              {sidebarOpen && <span className="text-white font-black text-sm">Store CMS</span>}
              <button type="button" onClick={() => setSidebarOpen(p => !p)} className="ml-auto text-gray-400 hover:text-white transition-colors">
                <Ico d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} cls="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 min-h-0 overflow-y-auto py-3 space-y-0.5 px-2">
              {NAV.map(item => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                      active
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                        : item.highlight
                          ? 'text-violet-300 hover:bg-gray-800 hover:text-white border border-violet-800/40'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}>
                    <span className="shrink-0">{item.icon}</span>
                    {sidebarOpen && (
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{item.label}</p>
                        <p className={`text-xs truncate ${active ? 'text-violet-100' : item.highlight ? 'text-violet-400' : 'text-gray-600'}`}>{item.desc}</p>
                      </div>
                    )}
                    {/* Dot indicator for Dashboard */}
                    {item.highlight && !active && sidebarOpen && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar footer */}
            {sidebarOpen && (
              <div className="px-4 py-3 border-t border-gray-800 shrink-0">
                <p className="text-xs text-gray-600 text-center">MaestraVibe Admin v2</p>
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
