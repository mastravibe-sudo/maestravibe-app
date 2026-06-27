// lib/product-search.ts
// ─── Smart semantic product search without vector DB ──────────────────────────

import type { NormalizedProduct, DetectedIntent } from '@/types/ai';

// ── Scoring weights ────────────────────────────────────────────────────────────
const WEIGHTS = {
  exactNameMatch:     15,
  partialNameMatch:    5,
  categoryMatch:      10,
  keywordInName:       4,
  keywordInDesc:       2,
  colorMatch:          3,
  sizeMatch:           3,
  inPriceRange:        8,
  nearPriceRange:      3,   // within 20% of range
};

// ── Category synonyms ──────────────────────────────────────────────────────────
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  watches:     ['watch', 'watches', 'ghadi', 'timepiece', 'wristwatch', 'smartwatch'],
  shoes:       ['shoe', 'shoes', 'joota', 'jootay', 'sneaker', 'boot', 'chappal', 'sandal', 'footwear', 'slipper'],
  headphones:  ['headphone', 'earphone', 'earpiece', 'airpod', 'wireless ear', 'buds', 'tws', 'in-ear', 'over-ear'],
  bags:        ['bag', 'backpack', 'handbag', 'purse', 'tote', 'sling', 'clutch'],
  wallets:     ['wallet', 'bataue', 'card holder'],
  perfumes:    ['perfume', 'fragrance', 'cologne', 'attar', 'itr', 'scent'],
  sunglasses:  ['sunglass', 'sunglasses', 'shades', 'eyewear', 'chashma', 'specs'],
  accessories: ['belt', 'cap', 'hat', 'bracelet', 'necklace', 'ring', 'jewelry', 'tie', 'scarf'],
  electronics: ['charger', 'cable', 'power bank', 'phone case', 'cover', 'protector'],
};

// ── Normalize text for comparison ─────────────────────────────────────────────
function norm(str: string): string {
  return str.toLowerCase().trim();
}

// ── Check if product belongs to a category ────────────────────────────────────
function matchesCategory(product: NormalizedProduct, category: string): boolean {
  const prodCat = norm(product.category);
  const prodName = norm(product.name);
  const synonyms = CATEGORY_SYNONYMS[category] || [category];

  return synonyms.some(
    (syn) => prodCat.includes(syn) || prodName.includes(syn)
  );
}

// ── Score a single product against the intent ──────────────────────────────────
function scoreProduct(
  product: NormalizedProduct,
  intent: DetectedIntent,
  rawQuery: string
): number {
  let score = 0;
  const qLower    = norm(rawQuery);
  const nameLower = norm(product.name);
  const descLower = norm(product.description);
  const catLower  = norm(product.category);

  // ── Exact name match ──────────────────────────────────────────────────────
  if (nameLower === qLower) score += WEIGHTS.exactNameMatch;

  // ── Category match ────────────────────────────────────────────────────────
  if (intent.entities.category) {
    if (matchesCategory(product, intent.entities.category)) {
      score += WEIGHTS.categoryMatch;
    }
  }

  // ── Keyword matches ───────────────────────────────────────────────────────
  for (const kw of intent.entities.keywords || []) {
    if (nameLower.includes(kw))  score += WEIGHTS.keywordInName;
    if (descLower.includes(kw))  score += WEIGHTS.keywordInDesc;
    if (catLower.includes(kw))   score += WEIGHTS.keywordInName;
  }

  // ── Partial name match (raw query words in product name) ──────────────────
  const queryWords = qLower.split(/\s+/).filter((w) => w.length > 2);
  for (const word of queryWords) {
    if (nameLower.includes(word)) score += WEIGHTS.partialNameMatch;
  }

  // ── Color match ───────────────────────────────────────────────────────────
  if (intent.entities.color) {
    const color = intent.entities.color.toLowerCase();
    const hasColor =
      (product.colors || []).some((c) => norm(c).includes(color)) ||
      nameLower.includes(color) ||
      descLower.includes(color);
    if (hasColor) score += WEIGHTS.colorMatch;
  }

  // ── Size match ────────────────────────────────────────────────────────────
  if (intent.entities.size) {
    const size = intent.entities.size.toLowerCase();
    const hasSize =
      (product.sizes || []).some((s) => norm(s) === size) ||
      nameLower.includes(size);
    if (hasSize) score += WEIGHTS.sizeMatch;
  }

  // ── Price range match ─────────────────────────────────────────────────────
  const price = product.price;
  const { priceMin, priceMax } = intent.entities;

  if (priceMin !== undefined || priceMax !== undefined) {
    const aboveMin  = priceMin === undefined || price >= priceMin;
    const belowMax  = priceMax === undefined || price <= priceMax;

    if (aboveMin && belowMax) {
      score += WEIGHTS.inPriceRange;
    } else {
      // Near range: within 20%
      const tolerance = (priceMax || priceMin || price) * 0.2;
      const nearMin   = priceMin ? Math.abs(price - priceMin) <= tolerance : true;
      const nearMax   = priceMax ? Math.abs(price - priceMax) <= tolerance : true;
      if (nearMin && nearMax) score += WEIGHTS.nearPriceRange;
    }
  }

  return score;
}

// ── Main search function ───────────────────────────────────────────────────────
export function searchProducts(
  products: NormalizedProduct[],
  intent: DetectedIntent,
  rawQuery: string,
  options: {
    maxResults?:   number;
    minScore?:     number;
    strictPrice?:  boolean;
  } = {}
): NormalizedProduct[] {
  const {
    maxResults  = 5,
    minScore    = 3,
    strictPrice = false,
  } = options;

  // Score all products
  let scored = products
    .map((p) => ({ product: p, score: scoreProduct(p, intent, rawQuery) }))
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => b.score - a.score);

  // Strict price filtering (user explicitly asked for price range)
  if (strictPrice && (intent.entities.priceMin || intent.entities.priceMax)) {
    scored = scored.filter(({ product }) => {
      const { priceMin, priceMax } = intent.entities;
      const aboveMin = priceMin === undefined || product.price >= priceMin;
      const belowMax = priceMax === undefined || product.price <= priceMax;
      return aboveMin && belowMax;
    });
  }

  return scored.slice(0, maxResults).map(({ product, score }) => ({
    ...product,
    score,
  }));
}

// ── Format product catalog for prompt (compact) ────────────────────────────────
export function formatProductsForPrompt(
  products: NormalizedProduct[],
  market: string,
  maxProducts = 60
): string {
  return products
    .slice(0, maxProducts)
    .filter((p) => p._id)
    .map((p) => {
      const displayPrice =
        market === 'pk'
          ? `Rs.${p.price.toLocaleString()}`
          : `$${Math.ceil(p.price / 280)}`;
      const colors = p.colors?.slice(0, 3).join('/') || '';
      const sizes  = p.sizes?.slice(0, 3).join('/') || '';
      return [
        `ID:${p._id}`,
        `NAME:${p.name}`,
        `PRICE:${displayPrice}`,
        `CAT:${p.category}`,
        colors ? `COLORS:${colors}` : null,
        sizes  ? `SIZES:${sizes}`   : null,
        `DESC:${(p.description || '').slice(0, 50)}`,
      ]
        .filter(Boolean)
        .join('|');
    })
    .join('\n');
}

// ── Build a pre-filtered catalog for the AI prompt ────────────────────────────
// Keeps the most relevant products near the top so the LLM sees them first
export function buildSmartCatalog(
  products: NormalizedProduct[],
  intent: DetectedIntent,
  rawQuery: string,
  market: string
): { catalog: string; topResults: NormalizedProduct[] } {
  // Get top matches
  const topResults = searchProducts(products, intent, rawQuery, {
    maxResults:  10,
    minScore:    2,
    strictPrice: intent.type === 'price_filter',
  });

  // If we have top results, put them first, then fill rest
  const topIds   = new Set(topResults.map((p) => p._id));
  const rest     = products.filter((p) => !topIds.has(p._id));
  const ordered  = [...topResults, ...rest];

  const catalog  = formatProductsForPrompt(ordered, market, 70);

  return { catalog, topResults };
}
