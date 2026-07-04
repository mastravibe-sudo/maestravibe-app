// types/ai.ts
export type Market = 'pk' | 'us';

export type IntentType =
  | 'product_search'
  | 'price_filter'
  | 'category_browse'
  | 'product_detail'
  | 'shipping_query'
  | 'return_query'
  | 'payment_query'
  | 'order_query'
  | 'contact_query'
  | 'greeting'
  | 'complaint'
  | 'upsell_opportunity'
  | 'general';

export interface DetectedIntent {
  type: IntentType;
  confidence: number;
  entities: {
    category?:    string;
    priceMin?:    number;
    priceMax?:    number;
    keywords?:    string[];
    productName?: string;
    color?:       string;
    size?:        string;
  };
}

export interface NormalizedProduct {
  _id:         string;
  name:        string;
  price:       number;
  category:    string;
  description: string;
  images:      string[];
  colors:      string[];
  sizes:       string[];
  score?:      number;
}

export interface ChatMessage {
  role:    'user' | 'assistant';
  content: string;
}

export interface AIChatRequest {
  messages: ChatMessage[];
  products: NormalizedProduct[];
  market:   Market;
  pageContext?: string;
  cartItems?: Array<{
    name: string;
    price: number;
    qty: number;
  }>;
  userPrefs?: {
    preferredCategories?: string[];
    priceRange?: { min: number; max: number };
    lastSearchTerms?: string[];
  };
}

export interface AIChatResponse {
  message:             string;
  suggestedProductIds: string[];
  intent?:             IntentType;
  debugInfo?:          Record<string, unknown>;
}

export interface KnowledgeEntry {
  question:  string[];
  answer_pk: string;
  answer_us: string;
}