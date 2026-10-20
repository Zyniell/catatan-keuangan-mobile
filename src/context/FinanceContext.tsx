import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  BackupData,
  Category,
  FinanceSummary,
  MonthlyReportSummary,
  Transaction,
  TransactionInput,
  TransactionType,
} from '../types/finance';
import {
  addCategory,
  addTransaction,
  deleteCategory,
  deleteTransaction,
  exportDatabaseData,
  getCategories,
  getFinanceSummary,
  getMonthlyReportSummary,
  getTransactions,
  importDatabaseData,
  resetAllTransactions,
  updateTransaction,
} from '../db/queries';

interface FinanceContextType {
  categories: Category[];
  recentTransactions: Transaction[];
  allTransactions: Transaction[];
  summary: FinanceSummary;
  loading: boolean;
  refreshData: () => Promise<void>;
  createTransaction: (input: TransactionInput) => Promise<number>;
  editTransaction: (id: number, input: TransactionInput) => Promise<void>;
  removeTransaction: (id: number) => Promise<void>;
  createCategory: (input: {
    name: string;
    type: TransactionType;
    icon: string;
    color: string;
  }) => Promise<number>;
  removeCategory: (id: number) => Promise<void>;
  clearAllTransactions: () => Promise<void>;
  getMonthlyReport: (year: number, month: number) => Promise<MonthlyReportSummary>;
  exportBackup: () => Promise<BackupData>;
  importBackup: (backup: BackupData) => Promise<void>;
  filterTransactions: (options: {
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
  }) => Promise<Transaction[]>;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();

  const [categories, setCategories] = useState<Category[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinanceSummary>({
    totalBalance: 0,
    totalIncomeThisMonth: 0,
    totalExpenseThisMonth: 0,
    netSavingsThisMonth: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    try {
      const [cats, recents, allTx, summ] = await Promise.all([
        getCategories(db),
        getTransactions(db, { limit: 6 }),
        getTransactions(db),
        getFinanceSummary(db),
      ]);

      setCategories(cats);
      setRecentTransactions(recents);
      setAllTransactions(allTx);
      setSummary(summ);
    } catch (err) {
      console.error('Error refreshing finance data:', err);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [cats, recents, allTx, summ] = await Promise.all([
          getCategories(db),
          getTransactions(db, { limit: 6 }),
          getTransactions(db),
          getFinanceSummary(db),
        ]);
        if (isMounted) {
          setCategories(cats);
          setRecentTransactions(recents);
          setAllTransactions(allTx);
          setSummary(summ);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error initializing finance data:', err);
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [db]);

  const createTransaction = async (input: TransactionInput): Promise<number> => {
    const id = await addTransaction(db, input);
    await refreshData();
    return id;
  };

  const editTransaction = async (id: number, input: TransactionInput): Promise<void> => {
    await updateTransaction(db, id, input);
    await refreshData();
  };

  const removeTransaction = async (id: number): Promise<void> => {
    await deleteTransaction(db, id);
    await refreshData();
  };

  const createCategory = async (input: {
    name: string;
    type: TransactionType;
    icon: string;
    color: string;
  }): Promise<number> => {
    const id = await addCategory(db, input);
    const updatedCats = await getCategories(db);
    setCategories(updatedCats);
    return id;
  };

  const removeCategory = async (id: number): Promise<void> => {
    await deleteCategory(db, id);
    const updatedCats = await getCategories(db);
    setCategories(updatedCats);
  };

  const clearAllTransactions = async (): Promise<void> => {
    await resetAllTransactions(db);
    await refreshData();
  };

  const getMonthlyReport = async (
    year: number,
    month: number
  ): Promise<MonthlyReportSummary> => {
    return await getMonthlyReportSummary(db, year, month);
  };

  const exportBackup = async (): Promise<BackupData> => {
    return await exportDatabaseData(db);
  };

  const importBackup = async (backup: BackupData): Promise<void> => {
    await importDatabaseData(db, backup);
    await refreshData();
  };

  const filterTransactions = async (options: {
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
  }): Promise<Transaction[]> => {
    return await getTransactions(db, options);
  };

  return (
    <FinanceContext.Provider
      value={{
        categories,
        recentTransactions,
        allTransactions,
        summary,
        loading,
        refreshData,
        createTransaction,
        editTransaction,
        removeTransaction,
        createCategory,
        removeCategory,
        clearAllTransactions,
        getMonthlyReport,
        exportBackup,
        importBackup,
        filterTransactions,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
