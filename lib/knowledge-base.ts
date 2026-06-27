// lib/knowledge-base.ts
// ─── MaestraVibe Company Knowledge Base ───────────────────────────────────────
// Edit this file to update FAQ, policies, contact info, etc.

import type { KnowledgeEntry, Market } from '@/types/ai';

// ── Company Info ───────────────────────────────────────────────────────────────
export const COMPANY_INFO = {
  pk: {
    name:          'MaestraVibe Pakistan',
    whatsapp:      '0327-4050806',
    email:         'pk@maestravibe.com',
    instagram:     '@maestravibe.pk',
    workingHours:  'Somvar se Shanivar, 9am–9pm',
    currency:      'Rs.',
    freeDelivery:  2000,
    deliveryDays:  '3–5 business days',
    codAvailable:  true,
    returnDays:    7,
    exchangeDays:  14,
  },
  us: {
    name:          'MaestraVibe USA',
    email:         'us@maestravibe.com',
    instagram:     '@maestravibe.us',
    workingHours:  'Mon–Fri, 9am–6pm EST',
    currency:      '$',
    freeShipping:  50,
    deliveryDays:  '3–7 business days',
    codAvailable:  false,
    returnDays:    30,
    exchangeDays:  30,
  },
} as const;

// ── Knowledge Entries ──────────────────────────────────────────────────────────
export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ── Delivery / Shipping ────────────────────────────────────────────────────
  {
    question: ['delivery', 'shipping', 'kitne din', 'days', 'deliver', 'ship', 'pahunchega', 'pahunche'],
    answer_pk: `📦 Delivery 3–5 business days mein hoti hai.\n✅ Rs.2000 se upar FREE delivery!\n💵 Rs.2000 se neeche Rs.150 delivery charge.\nCOD (Cash on Delivery) available hai! 🎉`,
    answer_us: `📦 Shipping takes 3–7 business days.\n✅ FREE shipping on orders above $50!\nBelow $50: flat $5 shipping fee.\nWe ship to all 50 US states! 🇺🇸`,
  },

  // ── Returns ────────────────────────────────────────────────────────────────
  {
    question: ['return', 'wapas', 'refund', 'vapas', 'vaapis', 'money back', 'paise wapas'],
    answer_pk: `🔄 Return Policy:\n✅ 7 din ke andar return kar sakte hain\n✅ Product bilkul original condition mein hona chahiye\n✅ Tags/packing intact ho\n📞 WhatsApp: 0327-4050806 pe contact karein\n⏱️ Refund 5–7 din mein process hoga`,
    answer_us: `🔄 Return Policy:\n✅ 30-day hassle-free returns\n✅ Item must be unused with original packaging\n✅ Tags must be attached\n📧 Email: us@maestravibe.com\n⏱️ Refund processed within 5–7 business days`,
  },

  // ── Exchange ───────────────────────────────────────────────────────────────
  {
    question: ['exchange', 'badalna', 'size change', 'color change', 'different size', 'wrong size'],
    answer_pk: `🔁 Exchange Policy:\n✅ 14 din ke andar exchange ho sakta hai\n✅ Size ya color change karna ho to WhatsApp karein\n📞 0327-4050806\n⚠️ Sale items exchange nahi honge`,
    answer_us: `🔁 Exchange Policy:\n✅ 30-day exchange window\n✅ Wrong size or color? Email us immediately\n📧 us@maestravibe.com\n⚠️ Sale/clearance items are final sale`,
  },

  // ── Payment ────────────────────────────────────────────────────────────────
  {
    question: ['payment', 'pay', 'cod', 'cash', 'card', 'online', 'jazzcash', 'easypaisa', 'bank transfer', 'kaise pay', 'bhejain'],
    answer_pk: `💳 Payment Methods:\n✅ COD (Cash on Delivery) — most popular!\n✅ JazzCash\n✅ EasyPaisa\n✅ Bank Transfer (HBL, Meezan, UBL)\n✅ Credit/Debit Card\n\n🏆 COD recommended — delivery pe pay karo!`,
    answer_us: `💳 Payment Methods:\n✅ Visa / Mastercard\n✅ American Express\n✅ PayPal\n✅ Apple Pay\n✅ Google Pay\nAll transactions are SSL encrypted 🔒`,
  },

  // ── Contact ────────────────────────────────────────────────────────────────
  {
    question: ['contact', 'number', 'whatsapp', 'call', 'email', 'baat', 'phone', 'helpline', 'support'],
    answer_pk: `📞 Hamare saath rabta karein:\n💬 WhatsApp: 0327-4050806\n📧 Email: pk@maestravibe.com\n📸 Instagram: @maestravibe.pk\n⏰ Somvar–Shanivar, 9am–9pm`,
    answer_us: `📞 Reach us at:\n📧 Email: us@maestravibe.com\n📸 Instagram: @maestravibe.us\n⏰ Mon–Fri, 9am–6pm EST\nWe reply within 24 hours! ⚡`,
  },

  // ── Order Status ───────────────────────────────────────────────────────────
  {
    question: ['order', 'track', 'status', 'kahan', 'mera order', 'tracking', 'order ka', 'confirm'],
    answer_pk: `📦 Order track karne ke liye:\n1️⃣ WhatsApp pe order number bhejein: 0327-4050806\n2️⃣ Apna naam aur order date batayein\n✅ Order confirm hone pe SMS aata hai\n🚚 Dispatch hone pe tracking number milega`,
    answer_us: `📦 To track your order:\n1️⃣ Email us: us@maestravibe.com with your order #\n2️⃣ You'll receive a tracking email after dispatch\n✅ Orders confirmed within 2–4 hours\n🚚 Tracking link sent via email`,
  },

  // ── Authenticity / Quality ─────────────────────────────────────────────────
  {
    question: ['original', 'real', 'fake', 'quality', 'asli', 'genuine', 'authentic', 'naqli', 'copy'],
    answer_pk: `✅ 100% Authentic Products!\nMaestraVibe sirf genuine items sell karta hai.\n🏆 Quality guarantee har product pe\n🔄 Agar quality issue ho to 7 din mein return karein`,
    answer_us: `✅ 100% Authentic Products!\nAll MaestraVibe products are genuine and quality-checked.\n🏆 Every item is inspected before shipping\n🔄 Quality issue? Return within 30 days, no questions asked`,
  },

  // ── Discount / Sale ────────────────────────────────────────────────────────
  {
    question: ['discount', 'sale', 'offer', 'coupon', 'code', 'promo', 'uccha', 'sasta', 'cheap', 'deal'],
    answer_pk: `🎁 Discount ke liye:\n📸 Instagram follow karein @maestravibe.pk — exclusive deals!\n💬 WhatsApp karein aur student/bulk discount poochein\n🛍️ Rs.2000+ order pe FREE delivery bhi milti hai!`,
    answer_us: `🎁 For discounts:\n📸 Follow @maestravibe.us on Instagram for exclusive deals!\n📧 Sign up for email newsletter — get 10% off first order!\n✅ Free shipping automatically above $50`,
  },

  // ── Bulk / Wholesale ───────────────────────────────────────────────────────
  {
    question: ['bulk', 'wholesale', 'quantity', 'dozen', 'business', 'resell', 'resale', 'store'],
    answer_pk: `📦 Bulk/Wholesale Inquiry:\nHum bulk orders accept karte hain!\n📞 WhatsApp: 0327-4050806\nBulk discount available hai quantity ke hisaab se.\n✅ Resellers ke liye special pricing!`,
    answer_us: `📦 Bulk/Wholesale:\nWe do accept bulk orders!\n📧 Email: us@maestravibe.com with your requirements\n✅ Volume discounts available\n📋 Minimum order quantities may apply`,
  },

  // ── Warranty ───────────────────────────────────────────────────────────────
  {
    question: ['warranty', 'guarantee', 'kharab', 'broken', 'defect', 'damaged', 'tuta', 'kaam nahi'],
    answer_pk: `🛡️ Warranty Policy:\n✅ Manufacturing defect pe full replacement\n✅ Damage in transit — photos bhejein turant\n📞 WhatsApp: 0327-4050806\n⚠️ Physical damage warranty cover nahi karta`,
    answer_us: `🛡️ Warranty Policy:\n✅ Manufacturing defects covered\n✅ Damaged in shipping? Email photos within 48 hours\n📧 us@maestravibe.com\n⚠️ Physical/accidental damage not covered`,
  },

  // ── Gift / Packaging ───────────────────────────────────────────────────────
  {
    question: ['gift', 'wrap', 'packaging', 'present', 'birthday', 'surprise', 'taufa'],
    answer_pk: `🎁 Gift Packaging:\nHaan! Gift wrapping available hai.\n✅ Special message card bhi add kar sakte hain\n📞 Order ke waqt WhatsApp pe batayein: 0327-4050806\nExtra charge: Rs.100 only!`,
    answer_us: `🎁 Gift Packaging:\nYes! Gift wrapping is available.\n✅ Add a personalized message card\n📧 Note it in order comments or email us\nGift wrap: $3 extra`,
  },
];

// ── Helper: Get best FAQ match ─────────────────────────────────────────────────
export function findKnowledgeMatch(
  userText: string,
  market: Market
): string | null {
  const lower = userText.toLowerCase();

  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.question) {
      if (lower.includes(keyword.toLowerCase())) {
        // Longer keyword = more specific match = higher weight
        score += keyword.length > 5 ? 2 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Only return if reasonably confident
  if (bestScore >= 2 && bestMatch) {
    return market === 'pk' ? bestMatch.answer_pk : bestMatch.answer_us;
  }
  return null;
}

// ── Compile company context for system prompt ──────────────────────────────────
export function getCompanyContext(market: Market): string {
  const info = COMPANY_INFO[market];

  if (market === 'pk') {
    return `COMPANY: MaestraVibe Pakistan
WHATSAPP: 0327-4050806 | EMAIL: pk@maestravibe.com
DELIVERY: 3–5 din | FREE: Rs.2000+ | COD: Available ✅
RETURNS: 7 din | EXCHANGE: 14 din
PAYMENT: COD, JazzCash, EasyPaisa, Card, Bank Transfer
HOURS: Somvar–Shanivar 9am–9pm`;
  } else {
    return `COMPANY: MaestraVibe USA
EMAIL: us@maestravibe.com | INSTAGRAM: @maestravibe.us
SHIPPING: 3–7 days | FREE: $50+ | COD: Not available
RETURNS: 30 days | EXCHANGE: 30 days
PAYMENT: Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay
HOURS: Mon–Fri 9am–6pm EST`;
  }
}
