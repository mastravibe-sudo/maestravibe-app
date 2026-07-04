import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl font-black text-violet-600 mb-4">404</div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-600 mb-6">The page you’re looking for doesn’t exist or may have moved.</p>
        <Link href="/" className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-6 py-3 text-white font-semibold hover:bg-violet-700 transition">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
