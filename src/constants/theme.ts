import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    textMuted: '#94A3B8', // Slate 400
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9', // Slate 100
    backgroundElement: '#E2E8F0', // Slate 200
    backgroundSelected: '#CBD5E1', // Slate 300
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    primary: '#4F46E5', // Indigo 600
    primaryLight: '#EEF2FF', // Indigo 50
    income: '#10B981', // Emerald 500
    incomeLight: '#ECFDF5', // Emerald 50
    expense: '#EF4444', // Red 500
    expenseLight: '#FEF2F2', // Red 50
    card: '#FFFFFF',
  },
  dark: {
    text: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    textMuted: '#64748B', // Slate 500
    background: '#0B0F19', // Deep dark
    surface: '#161F30',
    surfaceSubtle: '#1E293B',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    border: '#27354A',
    borderLight: '#1E293B',
    primary: '#6366F1', // Indigo 500
    primaryLight: '#1E1B4B',
    income: '#34D399', // Emerald 400
    incomeLight: '#064E3B',
    expense: '#F87171', // Red 400
    expenseLight: '#450A0A',
    card: '#161F30',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display, sans-serif)',
    serif: 'var(--font-serif, serif)',
    rounded: 'var(--font-rounded, sans-serif)',
    mono: 'var(--font-mono, monospace)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 70 }) ?? 0;
export const MaxContentWidth = 800;
