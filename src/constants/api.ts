// API configuration — reads from EXPO_PUBLIC_* env vars set in .env / .env.production
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://carmarket365-production.up.railway.app/graphql';
