// lib/market.ts

export type Market = 'pk' | 'us' | 'uk' | 'ae';
export interface MarketConfig {
  market: Market;
  currency: 'PKR' | 'USD';
  currencySymbol: 'Rs.' | '$';
  locale: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  deliveryDays: string;
  freeDeliveryAbove: string;
  codAvailable: boolean;
  language: string;
}

export const MARKET_CONFIG: Record<Market, MarketConfig> = {
  pk: {
    market: 'pk',
    currency: 'PKR',
    currencySymbol: 'Rs.',
    locale: 'en-PK',
    phone: '+92 327-4050806',
    email: 'mastravibe@gmail.com',
    address: 'Pakistan',
    whatsapp: '923274050806',
    deliveryDays: '2–4 business days',
    freeDeliveryAbove: 'Rs. 2,000', 
    codAvailable: true,
    language: 'en-PK',
  },
  us: {
    market: 'us',
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    phone: '+1 (800) 123-4567',
    email: 'us@maestravibe.com',
    address: '123 Commerce St, New York, NY 10001',
    whatsapp: '',
    deliveryDays: '3–7 business days',
    freeDeliveryAbove: '$50',
    codAvailable: false,
    language: 'en-US',
  },
  uk: {
    market: 'uk',
    currency: 'PKR',
    currencySymbol: 'Rs.',
    locale: 'en-GB',
    phone: '+44 20 1234 5678',
    email: 'uk@maestravibe.com',
    address: 'London, United Kingdom',
    whatsapp: '',
    deliveryDays: '3–6 business days',
    freeDeliveryAbove: '£30',
    codAvailable: false,
    language: 'en-GB',
  },
  ae: {
    market: 'ae',
    currency: 'PKR',
    currencySymbol: 'Rs.',
    locale: 'en-AE',
    phone: '+971 50 123 4567',
    email: 'ae@maestravibe.com',
    address: 'Dubai, UAE',
    whatsapp: '',
    deliveryDays: '2–5 business days',
    freeDeliveryAbove: 'AED 150',
    codAvailable: false,
    language: 'en-AE',
  },
};

export function displayPrice(
  price: number,
  market: Market,
  exchangeRate = 280
): string {
  if (market === 'pk') {
    return `Rs. ${price.toLocaleString('en-PK')}`;
  }
  const usd = Math.ceil(price / exchangeRate);
  return `$${usd.toLocaleString('en-US')}`;
}

export function getMarketFromCookie(cookieValue: string | undefined): Market {
  if (cookieValue === 'us') return 'us';
  return 'pk';
}