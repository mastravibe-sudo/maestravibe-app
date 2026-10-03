// app/payment/success/page.tsx
'use client';

import { useEffect } from 'react';
import { saveCart } from '@/lib/home/helpers'; // same cart storage the storefront uses

export default function PaymentSuccess() {
  // Cart is cleared only after the customer comes back from the payment page.
  useEffect(() => {
    saveCart([]);
  }, []);

  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-semibold">Thank you!</h1>
      <p className="mt-2 text-gray-600">
        Your payment is being confirmed. We will process your order shortly.
      </p>
    </main>
  );
}