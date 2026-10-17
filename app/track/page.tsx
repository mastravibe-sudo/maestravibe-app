// app/track/page.tsx
import type { Metadata } from 'next';
import TrackOrderClient from '@/components/TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track your order | Maestra Market',
  description: 'Check the status of your Maestra Market order.',
  robots: { index: false, follow: false },
};

export default function TrackPage() {
  return <TrackOrderClient />;
}