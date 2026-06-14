'use client';

import HomePage from '@/components/Homepage';

interface Props {
  cartCount?: number;
  onCartCountChange?: (count: number) => void;
  showCart?: boolean;
  onCartClose?: () => void;
}

export default function ClientHome({
  onCartCountChange,
  showCart,
  onCartClose,
}: Props) {
  return (
    <HomePage
      onCartCountChange={onCartCountChange}
      showCart={showCart}
      onCartClose={onCartClose}
    />
  );
}