// app/about/page.tsx
import { cookies } from 'next/headers';
import { getMarketFromCookie } from '@/lib/market';
import AboutPK from '@/components/pages/AboutPK';
import AboutUS from '@/components/pages/AboutUS';

export default async function AboutPage() {
  const cookieStore = await cookies();
  const market = getMarketFromCookie(cookieStore.get('mv_market')?.value);
  return market === 'us' ? <AboutUS /> : <AboutPK />;
}