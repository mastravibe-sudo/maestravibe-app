// app/admin/reviews/page.tsx
import type { Metadata } from 'next';
import AdminQuickLinks from '@/components/admin/AdminQuickLinks';
import ReviewsModeration from '@/components/admin/ReviewsModeration';

export const metadata: Metadata = { title: 'Reviews | Admin', robots: { index: false, follow: false } };

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
      <AdminQuickLinks />
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Review moderation</h1>
      <ReviewsModeration />
    </div>
  );
}