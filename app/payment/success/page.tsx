// app/payment/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, PackageSearch } from 'lucide-react';
import { saveCart } from '@/lib/home/helpers'; // same cart storage the storefront uses

export default function PaymentSuccess() {
  const [orderId, setOrderId] = useState('');

  // Cart is cleared only after the customer comes back from the payment page.
  useEffect(() => {
    saveCart([]);
    setOrderId((new URLSearchParams(window.location.search).get('order') ?? '').slice(0, 64));
  }, []);

  return (
    <main className="mx-auto max-w-md p-6 sm:p-8 text-center space-y-4">
      <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" aria-hidden="true" />
      <h1 className="text-2xl font-semibold">Thank you!</h1>
      <p className="text-gray-600">Your payment is being confirmed. We will process your order shortly.</p>
      {orderId && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-left">
          <p className="text-xs text-gray-500">Your order ID (save it to track your order)</p>
          <p className="font-mono text-sm font-semibold text-gray-900 break-all">{orderId}</p>
          <Link href={`/track?order=${encodeURIComponent(orderId)}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:underline">
            <PackageSearch className="w-4 h-4" aria-hidden="true" /> Track this order
          </Link>
        </div>
      )}
    </main>
  );
}