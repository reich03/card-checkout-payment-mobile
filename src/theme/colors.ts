export const colors = {
  background: '#fdf8f8',
  surface: '#fdf8f8',
  surfaceContainerLow: '#f7f3f2',
  surfaceContainer: '#f1edec',
  brand: '#006c4a',
  brandBright: '#00C389',
  brandMuted: 'rgba(0, 108, 74, 0.12)',
  primary: '#181919',
  secondaryContainer: '#61f9bb',
  onSecondaryContainer: '#00714e',
  onSecondaryFixedVariant: '#005237',
  onSurface: '#1c1b1b',
  onSurfaceVariant: '#444748',
  outline: '#747878',
  outlineVariant: '#c4c7c7',
  white: '#ffffff',
  placeholder: '#e5e2e1',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  marginMobile: 20,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  sheet: 32,
  full: 9999,
} as const;
