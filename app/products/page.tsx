import type { Metadata } from 'next';
import ProductGrid from "@/components/ProductGrid";
import { getApprovedProducts } from '@/lib/seo-data';

export const metadata: Metadata = {
  title: 'Shop Products',
  description: 'Browse fashion, electronics, beauty, home, and lifestyle products at MaestraVibe.',
  alternates: { canonical: '/products' },
};

export default async function ProductsPage() {
  const products = await getApprovedProducts();

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shop Products</h1>
      <ProductGrid initialProducts={products} />
    </main>
  );
}