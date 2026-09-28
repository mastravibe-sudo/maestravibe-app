import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import HomePageWithSearch from '@/components/HomePageWithSearch';
import JsonLd from '@/components/JsonLd';
import { getApprovedProducts } from '@/lib/seo-data';
import { SITE_URL } from '@/lib/seo';
import { getMarketFromCookie } from '@/lib/market';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = await searchParams;
  const checkoutOpen = Array.isArray(query.checkout)
    ? query.checkout.includes('1')
    : query.checkout === '1';

  return {
    title: 'Online Shopping in Pakistan',
    description: 'Shop fashion, beauty, electronics, home, and lifestyle products at MaestraVibe. Discover new arrivals and order online.',
    alternates: { canonical: '/' },
    openGraph: {
      title: 'MaestraVibe Online Shopping',
      description: 'Discover fashion, beauty, electronics, and lifestyle products at MaestraVibe.',
      url: '/',
      siteName: 'MaestraVibe',
      type: 'website',
      images: [{ url: '/icons/icon-512.png', alt: 'MaestraVibe' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'MaestraVibe Online Shopping',
      description: 'Discover fashion, beauty, electronics, and lifestyle products at MaestraVibe.',
      images: ['/icons/icon-512.png'],
    },
    robots: checkoutOpen ? { index: false, follow: false } : { index: true, follow: true },
  };
}

// ✅ FIX: Force dynamic rendering to allow useSearchParams() to work
export const dynamic = 'force-dynamic';

export default async function Page() {
  const cookieStore = await cookies();
  const market = getMarketFromCookie(cookieStore.get('mv_market')?.value);
  const products = await getApprovedProducts(market === 'us' ? 'us' : 'pk');
  const organizationId = new URL('#organization', SITE_URL).toString();

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': organizationId,
            name: 'MaestraVibe',
            url: SITE_URL.toString(),
            logo: new URL('/icons/icon-512.png', SITE_URL).toString(),
          },
          {
            '@type': 'WebSite',
            '@id': new URL('#website', SITE_URL).toString(),
            name: 'MaestraVibe',
            url: SITE_URL.toString(),
            publisher: { '@id': organizationId },
          },
        ],
      }} />
      <HomePageWithSearch initialProducts={products} />
    </>
  );
}