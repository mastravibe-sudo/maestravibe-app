// lib/intent-detector.ts
// ─── Detects what the user actually wants ─────────────────────────────────────

import type { DetectedIntent, IntentType } from '@/types/ai';

// ── Keyword maps ───────────────────────────────────────────────────────────────
const INTENT_PATTERNS: Record<IntentType, string[]> = {
  greeting: [
    'hi', 'hello', 'hey', 'salam', 'assalam', 'walaikum', 'hiya', 'sup',
    'good morning', 'good afternoon', 'good evening', 'kya haal', 'kaise ho',
  ],
  product_search: [
    'show', 'dikhao', 'dekho', 'chahiye', 'want', 'need', 'looking for',
    'dhundh', 'search', 'find', 'do you have', 'available', 'koi',
    'recommend', 'suggest', 'best', 'top',
  ],
  price_filter: [
    'under', 'below', 'tak', 'neeche', 'budget', 'cheap', 'sasta',
    'affordable', 'above', 'upar', 'between', 'range', 'price', 'rs.',
    'rupee', 'dollar', '$', '₹', 'kitna', 'mehnga',
  ],
  category_browse: [
    'watch', 'ghadi', 'shoe', 'joota', 'chappal', 'headphone', 'earphone',
    'airpod', 'bag', 'wallet', 'belt', 'perfume', 'sunglasses', 'cap',
    'jacket', 'shirt', 'trouser', 'pant', 'charger', 'phone case',
    'jewelry', 'bracelet', 'necklace', 'ring', 'bottle', 'mug',
  ],
  product_detail: [
    'detail', 'info', 'tell me about', 'batao', 'specification', 'spec',
    'size', 'color', 'material', 'weight', 'dimension', 'feature',
  ],
  shipping_query: [
    'delivery', 'shipping', 'deliver', 'ship', 'kitne din', 'days', 'time',
    'waqt', 'track', 'tracking', 'kahan', 'pahunche', 'dispatch',
  ],
  return_query: [
    'return', 'wapas', 'refund', 'vapas', 'money back', 'paise wapas',
    'cancel', 'exchange', 'badalna', 'replace', 'replacement',
  ],
  payment_query: [
    'payment', 'pay', 'cod', 'cash', 'card', 'jazzcash', 'easypaisa',
    'bank', 'transfer', 'online', 'paypal', 'apple pay',
  ],
  order_query: [
    'order', 'status', 'confirm', 'placed', 'mera order', 'check order',
    'order number', 'kahan hai',
  ],
  contact_query: [
    'contact', 'number', 'whatsapp', 'call', 'email', 'phone', 'helpline',
    'support', 'baat', 'message', 'reach',
  ],
  complaint: [
    'problem', 'issue', 'not working', 'kaam nahi', 'broken', 'tuta',
    'damaged', 'wrong', 'galat', 'disappointed', 'bad', 'worst', 'fraud',
    'complaint', 'angry',
  ],
  upsell_opportunity: [
    'anything else', 'more', 'also', 'aur', 'kuch aur', 'combination',
    'match', 'gift', 'taufa', 'surprise',
  ],
  general: [],
};

// ── Category keyword map ───────────────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  watches:     ['watch', 'watches', 'ghadi', 'ghadiyaan', 'timepiece', 'wristwatch'],
  shoes:       ['shoe', 'shoes', 'joota', 'jootay', 'sneaker', 'boot', 'chappal', 'sandal', 'footwear'],
  headphones:  ['headphone', 'earphone', 'earpiece', 'airpod', 'wireless ear', 'buds', 'tws'],
  bags:        ['bag', 'backpack', 'handbag', 'purse', 'tote', 'briefcase', 'luggage'],
  wallets:     ['wallet', 'bataue', 'purse', 'card holder', 'money clip'],
  perfumes:    ['perfume', 'fragrance', 'scent', 'attar', 'cologne', 'spray', 'itr'],
  sunglasses:  ['sunglass', 'sunglasses', 'shades', 'eyewear', 'chashma'],
  accessories: ['belt', 'cap', 'hat', 'bracelet', 'necklace', 'ring', 'jewelry'],
  electronics: ['charger', 'phone case', 'cable', 'power bank', 'earbuds'],
};

// ── Price extractor ────────────────────────────────────────────────────────────
function extractPrices(text: string, market: string): { min?: number; max?: number } {
  const lower = text.toLowerCase();
  const result: { min?: number; max?: number } = {};

  // Pattern: "under X" / "X tak" / "below X" / "less than X"
  const underMatch = lower.match(
    /(?:under|below|tak|neeche|upto|less than|se kam|within)\s*(?:rs\.?|rupees?|\$)?\s*([\d,]+)/i
  );
  if (underMatch) {
    result.max = parseInt(underMatch[1].replace(/,/g, ''));
    if (market === 'us' && result.max < 500) result.max = result.max * 280; // $ to PKR
  }

  // Pattern: "above X" / "X se upar" / "more than X"
  const aboveMatch = lower.match(
    /(?:above|above|upar|more than|se upar|at least|minimum)\s*(?:rs\.?|rupees?|\$)?\s*([\d,]+)/i
  );
  if (aboveMatch) {
    result.min = parseInt(aboveMatch[1].replace(/,/g, ''));
    if (market === 'us' && result.min < 500) result.min = result.min * 280;
  }

  // Pattern: "X to Y" / "X–Y" / "X se Y"
  const rangeMatch = lower.match(
    /(?:rs\.?|rupees?|\$)?\s*([\d,]+)\s*(?:to|se|–|-|aur)\s*(?:rs\.?|rupees?|\$)?\s*([\d,]+)/i
  );
  if (rangeMatch) {
    let a = parseInt(rangeMatch[1].replace(/,/g, ''));
    let b = parseInt(rangeMatch[2].replace(/,/g, ''));
    if (market === 'us') {
      if (a < 500) a = a * 280;
      if (b < 500) b = b * 280;
    }
    result.min = Math.min(a, b);
    result.max = Math.max(a, b);
  }

  return result;
}

// ── Color extractor ────────────────────────────────────────────────────────────
function extractColor(text: string): string | undefined {
  const colors = [
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple',
    'brown', 'grey', 'gray', 'silver', 'gold', 'orange', 'beige', 'navy',
    'kala', 'safed', 'lal', 'neela', 'hara', 'peela', 'gulabi', 'sunehra',
  ];
  const lower = text.toLowerCase();
  return colors.find((c) => lower.includes(c));
}

// ── Size extractor ─────────────────────────────────────────────────────────────
function extractSize(text: string): string | undefined {
  const sizeMatch = text.match(/\b(xs|s|m|l|xl|xxl|xxxl|\d{1,2})\b/i);
  return sizeMatch?.[1]?.toLowerCase();
}

// ── Keyword extractor ──────────────────────────────────────────────────────────
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'be', 'to', 'of', 'and', 'or',
    'in', 'on', 'at', 'for', 'with', 'do', 'does', 'have', 'has', 'ka',
    'ki', 'ke', 'hai', 'hain', 'se', 'ko', 'ne', 'pe', 'par', 'aur',
    'main', 'mein', 'me', 'that', 'this', 'it', 'i', 'you', 'we',
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 8);
}

// ── Main intent detector ───────────────────────────────────────────────────────
export function detectIntent(userText: string, market: string): DetectedIntent {
  const lower = userText.toLowerCase();
  const scores: Partial<Record<IntentType, number>> = {};

  // Score each intent
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    let score = 0;
    for (const pattern of patterns) {
      if (lower.includes(pattern.toLowerCase())) {
        score += pattern.split(' ').length > 1 ? 3 : 1; // multi-word = higher score
      }
    }
    if (score > 0) scores[intent as IntentType] = score;
  }

  // Find best intent
  let bestIntent: IntentType = 'general';
  let bestScore = 0;
  for (const [intent, score] of Object.entries(scores)) {
    if ((score || 0) > bestScore) {
      bestScore = score || 0;
      bestIntent = intent as IntentType;
    }
  }

  // Find category
  let category: string | undefined;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) {
      category = cat;
      break;
    }
  }

  // If category found and intent is general, upgrade to category_browse
  if (category && bestIntent === 'general') {
    bestIntent = 'category_browse';
    bestScore = 2;
  }

  // If price found, upgrade or set to price_filter
  const prices = extractPrices(userText, market);
  if ((prices.min || prices.max) && bestIntent === 'general') {
    bestIntent = 'price_filter';
    bestScore = 2;
  }

  // If we see both a category/product AND a price, prefer product_search
  if (category && (prices.min || prices.max)) {
    bestIntent = 'product_search';
    bestScore = 5;
  }

  return {
    type:       bestIntent,
    confidence: Math.min(bestScore / 5, 1),
    entities: {
      category,
      priceMin:    prices.min,
      priceMax:    prices.max,
      keywords:    extractKeywords(userText),
      color:       extractColor(userText),
      size:        extractSize(userText),
    },
  };
}
