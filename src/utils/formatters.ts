import { MobileTranslations } from '../i18n/types';

/**
 * Format price — matches website exactly (German locale, EUR, no decimals)
 * e.g., 15000 → "€15.000"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format mileage with locale-aware number formatting
 * e.g., 125000 → "125.000 km" (mk/sq) or "125,000 km" (en)
 */
export function formatMileage(mileage: number, locale: string = 'de-DE'): string {
  return `${new Intl.NumberFormat(locale).format(mileage)} km`;
}

/**
 * Format relative time with translations
 */
export function formatTimeAgo(dateString: string, fmt?: MobileTranslations['formatters']): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (!fmt) {
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  if (seconds < 60) return fmt.justNow;
  if (seconds < 3600) return fmt.minutesAgo.replace('{count}', String(Math.floor(seconds / 60)));
  if (seconds < 86400) return fmt.hoursAgo.replace('{count}', String(Math.floor(seconds / 3600)));
  if (seconds < 2592000) return fmt.daysAgo.replace('{count}', String(Math.floor(seconds / 86400)));
  return date.toLocaleDateString();
}

/**
 * Format engine size
 * e.g., 1998 → "2.0L"
 */
export function formatEngineSize(cc: number): string {
  return `${(cc / 1000).toFixed(1)}L`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format enum value for display (fallback when no translations available)
 * e.g., "PLUGIN_HYBRID" → "Plugin Hybrid"
 */
export function formatEnum(value: string): string {
  return value
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Translate an enum value using the translations object.
 * Falls back to formatEnum() if no translation found.
 */
export function translateEnum(
  category: 'fuelTypes' | 'transmissions' | 'bodyTypes' | 'drivetrains' | 'conditions' | 'vehicleTypes' | 'colors',
  value: string,
  enums: MobileTranslations['enums'],
): string {
  // Normalize: PLUGIN_HYBRID -> pluginHybrid, FWD -> fwd, FOUR_WD -> fourwd
  const normalized = value
    .toLowerCase()
    .replace(/_([a-z])/g, (_, c) => c.toUpperCase());

  const categoryMap = enums[category];
  if (categoryMap) {
    if (categoryMap[normalized]) return categoryMap[normalized];
    if (categoryMap[value]) return categoryMap[value];
    if (categoryMap[value.toLowerCase()]) return categoryMap[value.toLowerCase()];
  }

  return formatEnum(value);
}
