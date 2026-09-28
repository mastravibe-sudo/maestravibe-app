export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://maestravibe.pk');
export const SITE_ORIGIN = SITE_URL.origin;

export function categorySlug(category: string): string {
  return category
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
