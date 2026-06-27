// lib/voice-normalizer.ts
// ─── Normalizes voice/text input before sending to AI ────────────────────────
// Handles: Urdu number words, phone number formatting, email spoken form, etc.

// ── Urdu / Hindi number words ──────────────────────────────────────────────────
const URDU_NUMBERS: Record<string, number> = {
  // Basic
  ek: 1, do: 2, teen: 3, char: 4, paanch: 5,
  chhe: 6, chheh: 6, saat: 7, aath: 8, nau: 9, das: 10,
  gyarah: 11, barah: 12, terah: 13, chaudah: 14, pandrah: 15,
  solah: 16, satrah: 17, atharah: 18, unees: 19, bees: 20,
  pachees: 25, tees: 30, chalees: 40, pachaas: 50,
  saath: 60, sattar: 70, assi: 80, nabbe: 90,
  sau: 100, hazaar: 1000, lakh: 100000, crore: 10000000,
  // English spoken
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, hundred: 100, thousand: 1000,
};

// ── Convert spoken Urdu number to digit ───────────────────────────────────────
export function urduNumberToDigit(text: string): string {
  let result = text;
  // Replace longest matches first (sort by word length desc)
  const sorted = Object.entries(URDU_NUMBERS).sort((a, b) => b[0].length - a[0].length);
  for (const [word, digit] of sorted) {
    const re = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(re, String(digit));
  }
  return result;
}

// ── Normalize price mentions ───────────────────────────────────────────────────
// "do hazaar rupaye" → "2000 rupees"
export function normalizePriceMention(text: string): string {
  let result = urduNumberToDigit(text);

  // "X hazaar" → "X000"
  result = result.replace(/(\d+)\s*hazaar/gi, (_, n) => String(parseInt(n) * 1000));
  result = result.replace(/(\d+)\s*thousand/gi, (_, n) => String(parseInt(n) * 1000));
  result = result.replace(/(\d+)\s*lakh/gi, (_, n) => String(parseInt(n) * 100000));
  result = result.replace(/(\d+)\s*hundred/gi, (_, n) => String(parseInt(n) * 100));

  return result;
}

// ── Normalize phone numbers spoken aloud ─────────────────────────────────────
// "zero three two seven" → "0327"
export function normalizeSpokenPhone(text: string): string {
  const digitWords: Record<string, string> = {
    zero: '0', one: '1', two: '2', three: '3', four: '4',
    five: '5', six: '6', seven: '7', eight: '8', nine: '9',
    'oh': '0',
  };
  let result = text;
  for (const [word, digit] of Object.entries(digitWords)) {
    result = result.replace(new RegExp(`\\b${word}\\b`, 'gi'), digit);
  }
  return result;
}

// ── Normalize category misspellings ──────────────────────────────────────────
const CATEGORY_CORRECTIONS: Record<string, string> = {
  'wach':    'watch',  'watche':  'watch',  'ghari':   'watch',
  'ghadi':   'watch',  'ghadiya': 'watch',  'watchs':  'watches',
  'shose':   'shoes',  'shues':   'shoes',  'jute':    'joota',
  'jutay':   'jootay', 'chppl':   'chappal','headfone': 'headphone',
  'earfone': 'earphone', 'erphone': 'earphone', 'airpods': 'airpod',
  'sunglas': 'sunglasses', 'goggles': 'sunglasses', 'chashma': 'sunglasses',
  'parfume': 'perfume', 'itr': 'perfume', 'attar': 'perfume',
  'beg':     'bag',    'backbag':  'backpack', 'wallat': 'wallet',
};

export function correctCategorySpelling(text: string): string {
  let result = text;
  for (const [typo, correct] of Object.entries(CATEGORY_CORRECTIONS)) {
    result = result.replace(new RegExp(`\\b${typo}\\b`, 'gi'), correct);
  }
  return result;
}

// ── Master normalize function ─────────────────────────────────────────────────
export function normalizeUserInput(rawText: string): string {
  let text = rawText.trim();

  // Max length guard
  if (text.length > 500) text = text.slice(0, 500);

  // Apply normalizers
  text = normalizePriceMention(text);
  text = correctCategorySpelling(text);

  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}
