// lib/home/types.ts

export interface SiteSettings {
  flash_sale_enabled:  boolean;
  flash_sale_ends_at:  string;
  flash_sale_discount: number;
  flash_sale_category: string;

  // Market-specific Flash Sale fields — optional so existing data/older
  // /api/settings responses that don't have them yet still type-check.
  flash_sale_discount_pk?: number;
  flash_sale_discount_us?: number;
  flash_sale_ends_at_pk?:  string;
  flash_sale_ends_at_us?:  string;
  flash_sale_category_pk?: string;
  flash_sale_category_us?: string;
  flash_sale_theme_pk?:    string;
  flash_sale_theme_us?:    string;
  flash_sale_image_pk?:    string;
  flash_sale_image_us?:    string;
  flash_sale_label_pk?:    string;
  flash_sale_label_us?:    string;

  festival_enabled:    boolean;
  festival_ends_at:    string;
  festival_discount:   number;
  festival_category:   string;
  pk_festival_label:   string;
  us_festival_label:   string;
  festival_theme_pk:   string;
  festival_theme_us:   string;

  // Market-specific Festival fields — optional for the same reason as above.
  festival_discount_pk?: number;
  festival_discount_us?: number;
  festival_ends_at_pk?:  string;
  festival_ends_at_us?:  string;
  festival_category_pk?: string;
  festival_category_us?: string;
  festival_image_pk?:    string;
  festival_image_us?:    string;

  pk_banner_title:     string;
  us_banner_title:     string;

  trending_pk?: string[];
  trending_us?: string[];

  stats_customers: string;
  stats_products:  string;
  stats_rating:    string;
}

export interface CmsBanner {
  id:           string;
  title:        string;
  subtitle:     string;
  tag:          string;
  image_url:    string;
  button_label: string;
  button_link:  string;
  market:       'pk' | 'us' | 'both';
  is_active:    boolean;
  sort_order:   number;
}

export interface CmsCategory {
  id:         string;
  label:      string;
  value:      string;
  image_url:  string;
  emoji:      string;
  is_active:  boolean;
  sort_order: number;
}

export interface ProductVariant {
  id:           string;
  size:         string;
  color:        string;
  price:        number;
  actual_price?: number | null;
  stock?:       number | null;
}

export interface CartItem {
  _id:           string;
  name:          string;
  price:         number;
  quantity:      number;
  images:        string[];
  selectedColor: string;
  selectedSize:  string;
  [key: string]: any;
}

export interface CustomerInfo {
  name:    string;
  email:   string;
  phone:   string;
  address: string;
  city:    string;
  area:    string;

  // ✅ NEW: finer-grained address info + live GPS pin, so riders/HHC/supplier
  // get an unambiguous drop-off point instead of just free-text city/area.
  district?:     string; // e.g. "Lahore District"
  block?:        string; // e.g. "Block C, DHA Phase 5" — manual, no reliable OSM tag for this
  locationLink?: string; // Google Maps link to the exact detected pin
  lat?:          number;
  lng?:          number;
}

// ✅ NEW: shape of a just-detected (not yet confirmed) GPS location, held in
// state until the customer explicitly confirms "yes, deliver here".
export interface DetectedLocation {
  city:         string;
  area:         string;
  district:     string;
  address:      string;
  locationLink: string;
  lat:          number;
  lng:          number;
}

export interface Slide {
  id:          string;
  image:       string;
  fallback:    string;
  title:       string;
  sub:         string;
  tag:         string;
  buttonLabel: string;
  buttonLink:  string;
}

export interface CategoryItem {
  label: string;
  value: string;
  image: string;
  emoji: string;
}

// Alias kept for compatibility with components (e.g. CategoriesSection.tsx)
// that import the older 'CategoryForGrid' name. Same shape as CategoryItem —
// this fixes the missing-export build error without touching any component
// or changing the actual data shape.
export type CategoryForGrid = CategoryItem;

// Matches the shape of each entry in MARKET_CONFIG (lib/home/constants.ts).
// Added so components (e.g. CheckoutFlow.tsx) can import a proper type for
// the `marketCfg` object instead of relying on inference from another file.
export interface MarketConfigEntry {
  currency:        string;
  symbol:          string;
  freeDeliveryMin: string;
  phone:           string;
  conversionRate:  number;
  label:           string;
  flag:            string;
  codAvailable:    boolean;
}

export interface OccasionItem {
  label:    string;
  emoji:    string;
  query:    string;
  gradient: string;
}

export interface Testimonial {
  name:   string;
  city:   string;
  text:   string;
  rating: number;
}

export interface FaqItem {
  q: string;
  a: string;
}