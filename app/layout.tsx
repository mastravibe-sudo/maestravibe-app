// app/layout.tsx
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { MarketProvider } from '@/lib/market-context';
import { getMarketFromCookie } from '@/lib/market';
import LayoutWrapper from '@/components/LayoutWrapper';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';
import { SITE_URL } from '@/lib/seo';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: { default: 'MaestraVibe', template: '%s | MaestraVibe' },
  description: 'Shop fashion, beauty, electronics, home, and lifestyle products at MaestraVibe.',
  openGraph: {
    siteName: 'MaestraVibe',
    type: 'website',
    locale: 'en_PK',
  },
  twitter: { card: 'summary_large_image' },
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
    <html lang="en" className={geist.variable}>
      <head>
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Maestra Market" />
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