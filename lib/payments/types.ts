// lib/payments/types.ts
export interface CreatePaymentInput {
  orderId: string;
  amount: number; // minor units (cents)
  currency: string; // 'usd'
  description: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePaymentResult {
  url: string; // hosted payment page to redirect the customer to
  reference: string; // provider session id
}

export interface PaymentProvider {
  name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
}