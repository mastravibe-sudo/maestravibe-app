import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import ProductPageClient from '@/components/ProductPageClient';
import { getApprovedProduct } from '@/lib/seo-data';
import { categorySlug, SITE_URL } from '@/lib/seo';

type ProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getDescription = (name: string, description?: string) =>
  description?.trim().slice(0, 160) || `${name} from MaestraVibe. Browse product details and order online.`;

export async function generateMetadata({ params, searchParams }: ProductPageProps): Promise<Metadata> {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const product = await getApprovedProduct(id);
  if (!product) return { title: 'Product Not Found', robots: { index: false, follow: false } };

  const description = getDescription(product.name, product.description);
  const canonical = `/products/${encodeURIComponent(product.id)}`;
  const image = product.images?.[0] || '/icons/icon-512.png';
  const checkoutOpen = Array.isArray(query.checkout) ? query.checkout.includes('1') : query.checkout === '1';

  return {
    title: product.name,
    description,
    alternates: { canonical },
    robots: checkoutOpen ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      url: canonical,
      siteName: 'MaestraVibe',
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [image],
    },
    other: {
      'product:price:amount': Number(product.price).toFixed(2),
      'product:price:currency': 'PKR',
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getApprovedProduct(id);
  if (!product) notFound();

  const categoryPath = `/categories/${categorySlug(product.category)}`;
  const productUrl = new URL(`/products/${encodeURIComponent(product.id)}`, SITE_URL).toString();
  const sku = (product as typeof product & { sku?: string }).sku || product.id;
  const stock = (product as typeof product & { stock?: number | null }).stock;
  const variants = product.variants ?? [];
  const outOfStock = stock === 0 || (variants.length > 0 && variants.every(variant => variant.stock === 0));
  const images = product.images?.length ? product.images : [new URL('/icons/icon-512.png', SITE_URL).toString()];

  return (
    <main>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: images,
        description: getDescription(product.name, product.description),
        sku,
        brand: { '@type': 'Brand', name: product.merchant_name || 'MaestraVibe' },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'PKR',
          price: Number(product.price).toFixed(2),
          availability: `https://schema.org/${outOfStock ? 'OutOfStock' : 'InStock'}`,
        },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL.toString() },
          { '@type': 'ListItem', position: 2, name: product.category, item: new URL(categoryPath, SITE_URL).toString() },
          { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
        ],
      }} />
      <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-4 md:px-8 py-5 text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-purple-700">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href={categoryPath} className="capitalize hover:text-purple-700">{product.category}</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="line-clamp-1 text-gray-700">{product.name}</li>
        </ol>
      </nav>
      <meta property="product:price:amount" content={Number(product.price).toFixed(2)} />
      <meta property="product:price:currency" content="PKR" />
      <ProductPageClient product={product} />
    </main>
  );
}
