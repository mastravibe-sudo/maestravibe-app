// lib/home/types.ts

export interface SiteSettings {
  flash_sale_enabled:  boolean;
  flash_sale_ends_at:  string;
  flash_sale_discount: number;
  flash_sale_category: string;

  festival_enabled:    boolean;
  festival_ends_at:    string;
  festival_discount:   number;
  festival_category:   string;
  pk_festival_label:   string;
  us_festival_label:   string;
  festival_theme_pk:   string;
  festival_theme_us:   string;

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