import type { Metadata } from 'next';
import CartPageClient from '@/components/CartPageClient';

export const metadata: Metadata = {
  title: 'Your Cart',
  description: 'Review the items in your MaestraVibe cart.',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartPageClient />;
}
