// app/policy/page.tsx
import { cookies } from 'next/headers';
import { getMarketFromCookie } from '@/lib/market';
import PolicyPK from '@/components/pages/PolicyPK';
import PolicyUS from '@/components/pages/PolicyUS';

export default async function PolicyPage() {
  const cookieStore = await cookies();
  const market = getMarketFromCookie(cookieStore.get('mv_market')?.value);
  return market === 'us' ? <PolicyUS /> : <PolicyPK />;
}