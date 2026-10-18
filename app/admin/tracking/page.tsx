// app/admin/tracking/page.tsx
import type { Metadata } from 'next';
import AdminQuickLinks from '@/components/admin/AdminQuickLinks';
import OrderTrackingAdmin from '@/components/admin/OrderTrackingAdmin';

export const metadata: Metadata = { title: 'Order tracking | Admin', robots: { index: false, follow: false } };

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
      <AdminQuickLinks />
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order tracking</h1>
      <OrderTrackingAdmin />
    </div>
  );
}