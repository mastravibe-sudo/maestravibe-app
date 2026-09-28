import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { getApprovedCategory } from '@/lib/seo-data';
import { categorySlug, SITE_URL } from '@/lib/seo';

type CategoryPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getApprovedCategory(slug);
  if (!result) return { title: 'Category Not Found', robots: { index: false, follow: false } };

  const title = `${result.category} Products`;
  const description = `Shop ${result.products.length} ${result.category} products at MaestraVibe. Explore the collection and order online.`;
  const canonical = `/categories/${categorySlug(result.category)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: 'MaestraVibe', type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const result = await getApprovedCategory(slug);
  if (!result) notFound();

  const canonical = new URL(`/categories/${categorySlug(result.category)}`, SITE_URL).toString();

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL.toString() },
          { '@type': 'ListItem', position: 2, name: result.category, item: canonical },
        ],
      }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-purple-700">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="capitalize text-gray-700">{result.category}</li>
        </ol>
      </nav>
      <header className="mb-8">
        <h1 className="text-3xl font-bold capitalize text-gray-900">{result.category} Products</h1>
        <p className="mt-2 text-gray-600">Browse {result.products.length} products in this collection.</p>
      </header>
      {result.products.length ? (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {result.products.map((product, index) => (
            <li key={product.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <Link href={`/products/${encodeURIComponent(product.id)}`} className="block">
                <div className="relative aspect-square bg-gray-50">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={`${product.name} product photo`}
                      fill
                      priority={index < 2}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover"
                    />
                  ) : <span className="flex h-full items-center justify-center text-gray-400">Image unavailable</span>}
                </div>
                <div className="p-4">
                  <h2 className="line-clamp-2 font-semibold text-gray-900">{product.name}</h2>
                  <p className="mt-2 font-bold text-gray-800">Rs. {Number(product.price).toLocaleString('en-PK')}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : <p>No products are currently available in this category.</p>}
    </main>
  );
}
