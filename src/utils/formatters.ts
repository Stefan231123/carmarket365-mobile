// Formatting utilities for display

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
 * Format mileage with unit
 * e.g., 125000 → "125,000 km"
 */
export function formatMileage(mileage: number): string {
  return `${new Intl.NumberFormat('en-US').format(mileage)} km`;
}

/**
 * Format relative time
 * e.g., "2 days ago", "3 hours ago"
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
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
 * Format enum value for display
 * e.g., "PLUGIN_HYBRID" → "Plugin Hybrid"
 */
export function formatEnum(value: string): string {
  return value
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}
