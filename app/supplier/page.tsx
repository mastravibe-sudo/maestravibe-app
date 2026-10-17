// app/supplier/page.tsx
import type { Metadata } from 'next';
import SupplierDashboardPanel from '@/components/supplier/SupplierDashboardPanel';

export const metadata: Metadata = {
  title: 'Supplier dashboard | Maestra Market',
  robots: { index: false, follow: false },
};

export default function SupplierPage() {
  return <SupplierDashboardPanel />;
}