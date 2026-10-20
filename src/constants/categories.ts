import { Category } from '../types/finance';

export const DEFAULT_WALLETS = ['Tunai', 'Rekening Bank', 'E-Wallet'] as const;

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Pengeluaran (Expenses)
  {
    name: 'Makanan & Minuman',
    type: 'expense',
    icon: 'fast-food-outline',
    color: '#F59E0B',
    is_default: 1,
  },
  {
    name: 'Transportasi',
    type: 'expense',
    icon: 'car-outline',
    color: '#3B82F6',
    is_default: 1,
  },
  {
    name: 'Belanja',
    type: 'expense',
    icon: 'cart-outline',
    color: '#EC4899',
    is_default: 1,
  },
  {
    name: 'Tagihan & Utilitas',
    type: 'expense',
    icon: 'receipt-outline',
    color: '#8B5CF6',
    is_default: 1,
  },
  {
    name: 'Hiburan',
    type: 'expense',
    icon: 'game-controller-outline',
    color: '#6366F1',
    is_default: 1,
  },
  {
    name: 'Kesehatan',
    type: 'expense',
    icon: 'medkit-outline',
    color: '#EF4444',
    is_default: 1,
  },
  {
    name: 'Pendidikan',
    type: 'expense',
    icon: 'school-outline',
    color: '#10B981',
    is_default: 1,
  },
  {
    name: 'Sedekah & Donasi',
    type: 'expense',
    icon: 'heart-outline',
    color: '#F43F5E',
    is_default: 1,
  },
  {
    name: 'Keluarga & Rumah',
    type: 'expense',
    icon: 'home-outline',
    color: '#14B8A6',
    is_default: 1,
  },
  {
    name: 'Pengeluaran Lainnya',
    type: 'expense',
    icon: 'ellipsis-horizontal-circle-outline',
    color: '#64748B',
    is_default: 1,
  },

  // Pemasukan (Income)
  {
    name: 'Gaji Pokok',
    type: 'income',
    icon: 'wallet-outline',
    color: '#10B981',
    is_default: 1,
  },
  {
    name: 'Bonus & THR',
    type: 'income',
    icon: 'gift-outline',
    color: '#059669',
    is_default: 1,
  },
  {
    name: 'Usaha & Bisnis',
    type: 'income',
    icon: 'briefcase-outline',
    color: '#0EA5E9',
    is_default: 1,
  },
  {
    name: 'Investasi',
    type: 'income',
    icon: 'trending-up-outline',
    color: '#8B5CF6',
    is_default: 1,
  },
  {
    name: 'Hadiah & Tunjangan',
    type: 'income',
    icon: 'happy-outline',
    color: '#F59E0B',
    is_default: 1,
  },
  {
    name: 'Pemasukan Lainnya',
    type: 'income',
    icon: 'add-circle-outline',
    color: '#64748B',
    is_default: 1,
  },
];

export const AVAILABLE_ICONS = [
  'fast-food-outline',
  'car-outline',
  'cart-outline',
  'receipt-outline',
  'game-controller-outline',
  'medkit-outline',
  'school-outline',
  'heart-outline',
  'home-outline',
  'wallet-outline',
  'gift-outline',
  'briefcase-outline',
  'trending-up-outline',
  'happy-outline',
  'fitness-outline',
  'airplane-outline',
  'cafe-outline',
  'book-outline',
  'phone-portrait-outline',
  'construct-outline',
  'shirt-outline',
  'paw-outline',
  'film-outline',
  'musical-notes-outline',
  'sparkles-outline',
];

export const AVAILABLE_COLORS = [
  '#EF4444', // Red
  '#F43F5E', // Rose
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#10B981', // Emerald
  '#059669', // Green
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#A855F7', // Violet
  '#D946EF', // Fuchsia
  '#64748B', // Slate
];
