// components/admin/AdminQuickLinks.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, CreditCard, MessageSquare } from 'lucide-react';

const LINKS = [
  { href: '/admin/cnic', label: 'Supplier CNIC', Icon: CreditCard },
  { href: '/admin/reviews', label: 'Reviews', Icon: MessageSquare },
  { href: '/admin/tracking', label: 'Order tracking', Icon: ClipboardList },
];

export default function AdminQuickLinks() {
  const path = usePathname();
  return (
    <nav className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Admin quick links">
      <Link href="/admin" className="inline-flex items-center shrink-0 rounded-full px-4 py-2 text-sm font-semibold min-h-10 bg-gray-100 text-gray-700">
        Admin home
      </Link>
      {LINKS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}
          className={`inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-sm font-semibold min-h-10 ${path === href ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
          <Icon className="w-4 h-4" aria-hidden="true" /> {label}
        </Link>
      ))}
    </nav>
  );
}