// app/layout.tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { MarketProvider } from '@/lib/market-context';
import { getMarketFromCookie } from '@/lib/market';
import LayoutWrapper from '@/components/LayoutWrapper';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';

export const metadata: Metadata = {
  title: 'Maestra Market',
  description: 'Premium online shopping',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
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
      <head>
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Maestra Market" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        <MarketProvider initialMarket={initialMarket}>
          <LayoutWrapper>{children}</LayoutWrapper>
          <PwaInstallPrompt />
        </MarketProvider>
      </body>
    </html>
  );
}