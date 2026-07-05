'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import Header from '@/components/header';
import { usePathname } from 'next/navigation';
import ClientHome from '@/components/ClientHome';

interface Props {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: Props) {
  const [cartCount, setCartCount] = useState(0);
  const [showCart,  setShowCart]  = useState(false);
  const pathname = usePathname();

  const isHome = pathname === '/';

  // Admin panel aur reseller dashboard pe homepage wala Header (categories, market switcher, cart) bilkul show nahi hoga
  const hideMainHeader = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');

  return (
    <>
      {!hideMainHeader && (
        <Header
          cartCount={cartCount}
          onCartClick={() => setShowCart(true)}
        />
      )}
      <main className="flex-1">
        {isHome ? (
          <ClientHome
            cartCount={cartCount}
            onCartCountChange={setCartCount}
            showCart={showCart}
            onCartClose={() => setShowCart(false)}
          />
        ) : (
          children
        )}
      </main>
    </>
  );
}