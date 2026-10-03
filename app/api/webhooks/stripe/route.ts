// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/payments/stripe';
import { createAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs'; // raw body + signature check

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  const rawBody = await req.text(); // must be raw text, not req.json()
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const s = event.data.object as Stripe.Checkout.Session;
        const orderId = s.metadata?.orderId;
        if (!orderId || s.payment_status !== 'paid') break;

        // order.total was computed on the server at order time, so this check is meaningful.
        const { data: order } = await supabase
          .from('orders')
          .select('total,currency')
          .eq('id', orderId)
          .single();
        const expected = order ? Math.round(Number(order.total) * 100) : -1;
        if (!order || expected !== s.amount_total || (s.currency ?? '') !== (order.currency ?? 'usd')) {
          console.error('Payment mismatch for order', orderId);
          break;
        }

        // Idempotent: Stripe may resend events.
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            payment_reference: s.id,
            paid_at: new Date().toISOString(),
          })
          .eq('id', orderId)
          .neq('payment_status', 'paid');
        break;
      }
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const orderId = s.metadata?.orderId;
        if (orderId)
          await supabase
            .from('orders')
            .update({ payment_status: 'failed' })
            .eq('id', orderId)
            .eq('payment_status', 'pending');
        break;
      }
    }
  } catch (e) {
    console.error('webhook handler error', e);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 }); // Stripe retries
  }

  return NextResponse.json({ received: true });
}