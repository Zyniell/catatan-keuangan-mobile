export type TransactionType = 'expense' | 'income';

export type WalletType = 'Tunai' | 'Rekening Bank' | 'E-Wallet';

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  is_default: number; // 1 = default/system, 0 = custom
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category_id: number;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  wallet: string;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  category_id: number;
  date: string;
  time: string;
  wallet: string;
  note?: string;
}

export interface DailyTransactionGroup {
  date: string; // YYYY-MM-DD
  formattedDate: string;
  totalExpense: number;
  totalIncome: number;
  transactions: Transaction[];
}

export interface FinanceSummary {
  totalBalance: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
  netSavingsThisMonth: number;
}

export interface CategoryReport {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyReportSummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  expenseCategories: CategoryReport[];
  incomeCategories: CategoryReport[];
}

export interface BackupData {
  version: number;
  exportedAt: string;
  categories: Category[];
  transactions: Transaction[];
}
