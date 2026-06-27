// app/services/page.tsx
import { cookies } from 'next/headers';
import { getMarketFromCookie } from '@/lib/market';
import ServicesPK from '@/components/pages/ServicesPK';
import ServicesUS from '@/components/pages/ServicesUS';

export default async function ServicesPage() {
  const cookieStore = await cookies();
  const market = getMarketFromCookie(cookieStore.get('mv_market')?.value);
  return market === 'us' ? <ServicesUS /> : <ServicesPK />;
}