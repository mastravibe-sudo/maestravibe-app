// lib/home/theme-gradients.ts
// Central place for festival/flash-sale color themes.
// IMPORTANT: Tailwind can't resolve dynamic strings like `bg-${theme}-600`
// at build time (JIT purge removes classes it can't see literally in the
// source), so every theme's classes are spelled out here in full.

export const THEME_OPTIONS = [
  'violet', 'emerald', 'green', 'blue', 'cyan', 'rose', 'orange', 'yellow', 'gray',
] as const;

export type ThemeKey = typeof THEME_OPTIONS[number];

export const THEME_LABELS: Record<ThemeKey, string> = {
  violet: 'Violet (brand default)',
  emerald: 'Emerald',
  green: 'Green',
  blue: 'Blue',
  cyan: 'Cyan',
  rose: 'Rose',
  orange: 'Orange',
  yellow: 'Yellow',
  gray: 'Gray / Black Friday',
};

// gradient used for the live banner background
export const THEME_GRADIENTS: Record<ThemeKey, string> = {
  violet: 'from-violet-600 to-indigo-700',
  emerald: 'from-emerald-600 to-emerald-500',
  green: 'from-green-600 to-green-500',
  blue: 'from-blue-600 to-indigo-600',
  cyan: 'from-cyan-600 to-blue-500',
  rose: 'from-rose-600 to-pink-500',
  orange: 'from-orange-600 to-amber-500',
  yellow: 'from-yellow-500 to-orange-400',
  gray: 'from-gray-700 to-gray-600',
};

// text color used on the white CTA button so it matches the theme
export const THEME_TEXT: Record<ThemeKey, string> = {
  violet: 'text-indigo-700',
  emerald: 'text-emerald-700',
  green: 'text-green-700',
  blue: 'text-blue-700',
  cyan: 'text-cyan-700',
  rose: 'text-rose-700',
  orange: 'text-orange-700',
  yellow: 'text-yellow-700',
  gray: 'text-gray-700',
};

function normalize(theme?: string): ThemeKey {
  return (THEME_OPTIONS as readonly string[]).includes(theme ?? '') ? (theme as ThemeKey) : 'violet';
}

export function themeGradientClass(theme?: string) {
  return THEME_GRADIENTS[normalize(theme)];
}

export function themeTextClass(theme?: string) {
  return THEME_TEXT[normalize(theme)];
}