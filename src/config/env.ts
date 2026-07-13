/**
 * Public API config (Expo inlines EXPO_PUBLIC_* from `.env` at bundle time).
 * Restart Metro after changing `.env`.
 */
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://18.224.46.220:3000'
).replace(/\/$/, '');

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}
