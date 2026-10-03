// lib/payments/stripe.ts
import Stripe from 'stripe';
import type { PaymentProvider } from './types';

// Lazy init: build on Vercel must not crash if the key is missing at import time.
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export const stripeProvider: PaymentProvider = {
  name: 'stripe',
  async createPayment(input) {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      client_reference_id: input.orderId,
      metadata: { orderId: input.orderId },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.currency,
            unit_amount: input.amount,
            product_data: { name: input.description },
          },
        },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    });
    if (!session.url) throw new Error('Stripe did not return a checkout URL');
    return { url: session.url, reference: session.id };
  },
};