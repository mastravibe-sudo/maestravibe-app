import HomePageWithSearch from '@/components/HomePageWithSearch';

// ✅ FIX: Force dynamic rendering to allow useSearchParams() to work
export const dynamic = 'force-dynamic';

export default function Page() {
  return <HomePageWithSearch />;
}