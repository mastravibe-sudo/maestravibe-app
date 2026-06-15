import { Suspense } from 'react';
import HomePage from '@/components/Homepage';

// ✅ Suspense ke andar alag wrapper component
function HomePageWrapper() {
  return <HomePage />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm font-medium">Loading MaestraVibe...</p>
      </div>
    </div>}>
      <HomePageWrapper />
    </Suspense>
  );
}