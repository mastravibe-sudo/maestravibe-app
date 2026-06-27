// app/layout.tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { MarketProvider } from '@/lib/market-context';
import { getMarketFromCookie } from '@/lib/market';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata: Metadata = {
  title: 'MaestraVibe',
  description: 'Premium online shopping',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const marketCookie = cookieStore.get('mv_market')?.value;
  const initialMarket = getMarketFromCookie(marketCookie);

  return (
    <html lang="en">
      <body>
        <MarketProvider initialMarket={initialMarket}>
          <LayoutWrapper>{children}</LayoutWrapper>
        </MarketProvider>
      </body>
    </html>
  );
}