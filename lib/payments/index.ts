// lib/payments/index.ts
import type { PaymentProvider } from './types';
import { stripeProvider } from './stripe';

// To switch provider later: add a new file here and change PAYMENT_PROVIDER.
export function getProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER || 'stripe';
  switch (name) {
    case 'stripe':
      return stripeProvider;
    default:
      throw new Error(`Unknown payment provider: ${name}`);
  }
}