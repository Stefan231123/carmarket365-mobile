// CarMarket365 brand theme — matches web app styling exactly

export const COLORS = {
  // Primary actions — black, not blue
  primary: '#030213',
  primaryLight: '#000000',

  // Blue is ONLY for prices and specific highlights
  price: '#2563eb',           // Blue-600
  priceDark: '#1d4ed8',       // Blue-700

  // Spec icon colors (matching website exactly)
  specMileage: '#2563eb',     // Blue-600 (Gauge)
  specFuel: '#16a34a',        // Green-600 (Fuel)
  specYear: '#9333ea',        // Purple-600 (Calendar)
  specLocation: '#dc2626',    // Red-600 (MapPin)

  // Backgrounds
  background: '#ffffff',
  backgroundMuted: 'rgba(236, 236, 240, 0.3)', // muted/30
  surface: '#ffffff',
  card: '#ffffff',

  // Zinc palette (matching website)
  zinc50: '#fafafa',
  zinc100: '#f4f4f5',
  zinc200: '#e4e4e7',
  zinc300: '#d4d4d8',
  zinc400: '#a1a1aa',

  // Input background
  inputBg: '#f4f4f5',         // zinc-100

  // Text
  text: '#111111',            // near-black foreground
  textSecondary: '#717182',   // muted-foreground
  textMuted: '#717182',       // same as website

  // Borders
  border: 'rgba(0, 0, 0, 0.1)',
  borderZinc: '#f4f4f5',      // zinc-100 (subtle card borders)

  // Status
  error: '#d4183d',           // destructive
  success: '#22c55e',         // Green-500
  warning: '#f59e0b',         // Amber-500

  // Heart / saved
  heartActive: '#ef4444',      // Red-500

  // Basics
  white: '#ffffff',
  black: '#000000',

  // Social
  facebook: '#1877F2',

  // Featured badge
  featuredBg: '#dbeafe',      // blue-100
  featuredText: '#1d4ed8',    // blue-700
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 10,    // matches website text-xs at 14px base
  sm: 13,    // matches website text-sm
  md: 14,    // matches website text-base (14px base font)
  lg: 18,    // matches website text-lg
  xl: 22,    // matches website text-xl
  xxl: 28,   // matches website text-2xl
  heading: 33, // matches website text-3xl
  title: 42,   // matches website text-4xl
};

export const BORDER_RADIUS = {
  sm: 6,        // radius-sm
  md: 8,        // radius-md
  lg: 10,       // radius-lg (base --radius)
  xl: 12,       // rounded-xl (cards)
  '2xl': 16,    // rounded-2xl (page cards, buttons)
  '3xl': 24,    // rounded-3xl (dropdowns)
  full: 9999,   // rounded-full (pills, inputs, toggles)
};
