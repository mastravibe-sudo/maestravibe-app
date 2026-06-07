// app/page.tsx
import Link from 'next/link';
import Newsletter from '@/components/Newsletter';

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-50 to-white py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
          Dress Your <span className="text-purple-600">Vibe</span>
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
          Curated fashion for every mood, every moment. Delivered fast across Pakistan.
        </p>
        <Link
          href="/home"
          className="inline-block bg-purple-600 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-purple-700 transition-colors"
        >
          Shop Now →
        </Link>
      </section>

      {/* Newsletter */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <Newsletter />
      </section>
    </div>
  );
}