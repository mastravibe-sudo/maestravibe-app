// lib/home/constants.ts

import type { SiteSettings, OccasionItem, Testimonial, FaqItem } from './types';

export const FALLBACK_SLIDES = [
  {
    image:    '/image/image1.png',
    fallback: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop',
    title:    'New Collection',
    sub:      'Trendy fashion, one click away',
    tag:      'Summer 2025',
  },
  {
    image:    '/image/image 2.png',
    fallback: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&auto=format&fit=crop',
    title:    'Premium Quality',
    sub:      'Genuine products at fair prices',
    tag:      'Top Picks',
  },
  {
    image:    '/image/image 4.png',
    fallback: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop',
    title:    'Fast Delivery',
    sub:      'Cash on delivery — all over Pakistan',
    tag:      'COD Available',
  },
];

export const FALLBACK_CATEGORIES = [
  { label: 'Men',         value: 'men',         image_url: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400&auto=format&fit=crop', emoji: '' },
  { label: 'Women',       value: 'women',       image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&auto=format&fit=crop', emoji: '' },
  { label: 'Kids',        value: 'kids',        image_url: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&auto=format&fit=crop', emoji: '' },
  { label: 'Accessories', value: 'accessories', image_url: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&auto=format&fit=crop', emoji: '' },
  { label: 'Sale',        value: 'sale',        image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&auto=format&fit=crop', emoji: '' },
];

export const SORT_OPTIONS = [
  { label: 'Default',           value: 'default'    },
  { label: 'Price: Low → High', value: 'price-asc'  },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Name A–Z',          value: 'name-asc'   },
  { label: 'Name Z–A',          value: 'name-desc'  },
];

export const TESTIMONIALS: Testimonial[] = [
  { name: 'Ayesha K.',  city: 'Lahore',    text: 'Delivery was super fast and the product quality exceeded my expectations. Highly recommend MaestraVibe!', rating: 5 },
  { name: 'Ahmed R.',   city: 'Karachi',   text: 'Cash on delivery made it so easy. The kurta set I ordered looks exactly like the pictures. Will order again.', rating: 5 },
  { name: 'Sarah M.',   city: 'New York',  text: 'Ordered from the US and the quality was outstanding. Shipping was quick and packaging was beautiful.', rating: 5 },
  { name: 'Bilal M.',   city: 'Islamabad', text: 'Amazing quality! Got it in 3 days and the size was perfect. Customer support was also very helpful.', rating: 5 },
];

export const OCCASIONS_PK: OccasionItem[] = [
  { label: 'Eid Collection', emoji: '🌙', query: 'eid',        gradient: 'from-emerald-500 to-teal-600'  },
  { label: 'Wedding Ready',  emoji: '💍', query: 'wedding',    gradient: 'from-rose-500 to-pink-600'     },
  { label: 'Office Looks',   emoji: '💼', query: 'formal',     gradient: 'from-slate-600 to-gray-700'    },
  { label: 'Casual Vibes',   emoji: '👕', query: 'casual',     gradient: 'from-blue-500 to-indigo-600'   },
  { label: 'Glow Up ✨',     emoji: '💎', query: 'accessories', gradient: 'from-amber-500 to-orange-500' },
  { label: 'On Sale 🔥',     emoji: '🏷️', query: 'sale',       gradient: 'from-red-500 to-rose-600'      },
];

export const OCCASIONS_US: OccasionItem[] = [
  { label: 'Summer Looks', emoji: '☀️', query: 'summer',      gradient: 'from-orange-500 to-amber-500'  },
  { label: 'Work Outfits', emoji: '💼', query: 'formal',      gradient: 'from-slate-600 to-gray-700'    },
  { label: 'Party Ready',  emoji: '🎉', query: 'dress',       gradient: 'from-rose-500 to-pink-600'     },
  { label: 'Casual Style', emoji: '👕', query: 'casual',      gradient: 'from-blue-500 to-indigo-600'   },
  { label: 'Accessories',  emoji: '💍', query: 'accessories', gradient: 'from-violet-500 to-purple-600' },
  { label: 'On Sale 🔥',   emoji: '🏷️', query: 'sale',        gradient: 'from-red-500 to-rose-600'      },
];

export const TRENDING_PK = [
  'Lawn suits', 'Wireless earbuds', 'Watches for men', 'Summer kurtis',
  'Kids shoes', 'Gold earrings', 'Shalwar kameez', 'Sunglasses',
  'Casual sneakers', 'Bridal jewelry', 'Office bags', 'Perfume',
];

export const TRENDING_US = [
  'Summer dresses', 'Sneakers', 'Watches', 'Sunglasses',
  'Handbags', 'Jewelry', 'Kids clothes', 'Casual shirts',
];

export const FAQS_PK: FaqItem[] = [
  { q: 'Kya MaestraVibe Cash on Delivery offer karta hai?',  a: 'Haan! Hum poore Pakistan mein Cash on Delivery offer karte hain. Order receive karte waqt payment karein — koi advance nahi.' },
  { q: 'Delivery mein kitna waqt lagta hai?',                a: 'Lahore, Karachi, Islamabad mein 1-2 din. Baqi cities mein 2-4 business days.' },
  { q: 'Kya main order return kar sakta hun?',               a: '7-din ka hassle-free return policy hai. Damaged ya wrong item mili toh full refund ya replacement.' },
  { q: 'Products genuine hain?',                             a: 'Haan, 100%. Har product humari team quality verify karti hai.' },
  { q: 'Minimum order kitna hai?',                           a: 'Koi minimum order nahi! Rs. 1,500 se upar free delivery milti hai.' },
  { q: 'MaestraVibe se paise kaise kama saktay hain?',       a: 'Reseller program join karein — products share karein, khud profit set karein, hum delivery handle karein.' },
];

export const FAQS_US: FaqItem[] = [
  { q: 'Do you offer free shipping?',       a: 'Yes! Free shipping on all orders above $50. Standard delivery in 3-7 business days.' },
  { q: 'What is your return policy?',       a: 'We offer a 7-day hassle-free return policy. Damaged or wrong items get a full refund.' },
  { q: 'Are the products authentic?',       a: 'Absolutely. Every product is quality-verified by our team before dispatch.' },
  { q: 'How do I track my order?',          a: 'You will receive a tracking link via email once your order is dispatched.' },
  { q: 'Can I earn with MaestraVibe?',      a: 'Yes! Join our affiliate program — share products and earn commission on every sale.' },
];

export const MARKET_CONFIG: Record<string, {
  currency: string; symbol: string; freeDeliveryMin: string;
  phone: string; conversionRate: number; label: string; flag: string;
  codAvailable: boolean;
}> = {
  pk: { currency: 'PKR', symbol: 'Rs.',  freeDeliveryMin: '1,500', phone: '03274050806',     conversionRate: 1,   label: 'Pakistan', flag: '🇵🇰', codAvailable: true  },
  us: { currency: 'USD', symbol: '$',    freeDeliveryMin: '50',    phone: '+1-800-000-0000',  conversionRate: 280, label: 'USA',      flag: '🇺🇸', codAvailable: false },
  ae: { currency: 'AED', symbol: 'AED',  freeDeliveryMin: '150',   phone: '+971-000-0000',    conversionRate: 76,  label: 'UAE',      flag: '🇦🇪', codAvailable: false },
  uk: { currency: 'GBP', symbol: '£',    freeDeliveryMin: '30',    phone: '+44-000-0000',     conversionRate: 355, label: 'UK',       flag: '🇬🇧', codAvailable: false },
};

export const FESTIVAL_THEME_CLASSES: Record<string, string> = {
  emerald: 'from-emerald-600 to-emerald-500',
  green:   'from-green-600 to-green-500',
  blue:    'from-blue-600 to-blue-500',
  cyan:    'from-cyan-600 to-cyan-500',
  violet:  'from-violet-600 to-purple-500',
  rose:    'from-rose-600 to-pink-500',
  orange:  'from-orange-600 to-amber-500',
  yellow:  'from-yellow-500 to-amber-400',
  gray:    'from-gray-800 to-gray-600',
};

export const festivalGradient = (theme: string): string =>
  FESTIVAL_THEME_CLASSES[theme] ?? FESTIVAL_THEME_CLASSES.violet;

export const DEFAULT_SETTINGS: SiteSettings = {
  flash_sale_enabled:  true,
  flash_sale_ends_at:  '2030-01-01T00:00:00.000Z',
  flash_sale_discount: 50,
  flash_sale_category: 'sale',

  festival_enabled:    false,
  festival_ends_at:    '2030-01-08T00:00:00.000Z',
  festival_discount:   30,
  festival_category:   'sale',
  pk_festival_label:   '',
  us_festival_label:   '',
  festival_theme_pk:   'emerald',
  festival_theme_us:   'blue',

  pk_banner_title: '🎉 Sale up to 50% off · Free delivery above Rs. 1,500 · Cash on Delivery · 7-day returns',
  us_banner_title: '🎉 Sale up to 50% off · Free shipping above $50 · Secure Checkout · Easy Returns',

  trending_pk: TRENDING_PK,
  trending_us: TRENDING_US,

  stats_customers: '10K+',
  stats_products:  '500+',
  stats_rating:    '4.9★',
};