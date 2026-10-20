import { type SQLiteDatabase } from 'expo-sqlite';
import {
  BackupData,
  Category,
  CategoryReport,
  FinanceSummary,
  MonthlyReportSummary,
  Transaction,
  TransactionInput,
  TransactionType,
} from '../types/finance';
import { getCurrentMonthRange, getMonthRange } from '../utils/date';

/**
 * Mengambil daftar kategori
 */
export async function getCategories(
  db: SQLiteDatabase,
  type?: TransactionType
): Promise<Category[]> {
  if (type) {
    return await db.getAllAsync<Category>(
      'SELECT * FROM categories WHERE type = ? ORDER BY is_default DESC, name ASC',
      [type]
    );
  }
  return await db.getAllAsync<Category>(
    'SELECT * FROM categories ORDER BY type ASC, is_default DESC, name ASC'
  );
}

/**
 * Menambahkan kategori kustom
 */
export async function addCategory(
  db: SQLiteDatabase,
  category: { name: string; type: TransactionType; icon: string; color: string }
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO categories (name, type, icon, color, is_default) VALUES (?, ?, ?, ?, 0)',
    [category.name, category.type, category.icon, category.color]
  );
  return result.lastInsertRowId;
}

/**
 * Menghapus kategori kustom (hanya kategori non-default dan belum terpakai pada transaksi)
 */
export async function deleteCategory(db: SQLiteDatabase, id: number): Promise<boolean> {
  // Cek apakah ada transaksi yang memakai kategori ini
  const txCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
    [id]
  );

  if (txCount && txCount.count > 0) {
    throw new Error('Kategori tidak dapat dihapus karena masih digunakan pada transaksi yang ada.');
  }

  const result = await db.runAsync(
    'DELETE FROM categories WHERE id = ? AND is_default = 0',
    [id]
  );
  return result.changes > 0;
}

/**
 * Mengambil daftar transaksi dengan opsi filter tanggal, tipe, dan pencarian
 */
export async function getTransactions(
  db: SQLiteDatabase,
  options?: {
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Transaction[]> {
  let query = `
    SELECT 
      t.id,
      t.type,
      t.amount,
      t.category_id,
      c.name AS category_name,
      c.icon AS category_icon,
      c.color AS category_color,
      t.date,
      t.time,
      t.wallet,
      t.note,
      t.created_at,
      t.updated_at
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE 1=1
  `;

  const params: (string | number)[] = [];

  if (options?.type) {
    query += ' AND t.type = ?';
    params.push(options.type);
  }

  if (options?.startDate) {
    query += ' AND t.date >= ?';
    params.push(options.startDate);
  }

  if (options?.endDate) {
    query += ' AND t.date <= ?';
    params.push(options.endDate);
  }

  if (options?.searchQuery && options.searchQuery.trim().length > 0) {
    query += ' AND (t.note LIKE ? OR c.name LIKE ? OR t.wallet LIKE ?)';
    const term = `%${options.searchQuery.trim()}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY t.date DESC, t.time DESC, t.id DESC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
    if (options?.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }
  }

  return await db.getAllAsync<Transaction>(query, params);
}

/**
 * Mengambil transaksi berdasarkan ID
 */
export async function getTransactionById(
  db: SQLiteDatabase,
  id: number
): Promise<Transaction | null> {
  return await db.getFirstAsync<Transaction>(
    `SELECT 
      t.id,
      t.type,
      t.amount,
      t.category_id,
      c.name AS category_name,
      c.icon AS category_icon,
      c.color AS category_color,
      t.date,
      t.time,
      t.wallet,
      t.note,
      t.created_at,
      t.updated_at
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?`,
    [id]
  );
}

/**
 * Menambahkan transaksi baru
 */
export async function addTransaction(
  db: SQLiteDatabase,
  input: TransactionInput
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO transactions (type, amount, category_id, date, time, wallet, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.type,
      input.amount,
      input.category_id,
      input.date,
      input.time,
      input.wallet,
      input.note || null,
    ]
  );
  return result.lastInsertRowId;
}

/**
 * Mengubah transaksi
 */
export async function updateTransaction(
  db: SQLiteDatabase,
  id: number,
  input: TransactionInput
): Promise<void> {
  await db.runAsync(
    `UPDATE transactions 
     SET type = ?, amount = ?, category_id = ?, date = ?, time = ?, wallet = ?, note = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      input.type,
      input.amount,
      input.category_id,
      input.date,
      input.time,
      input.wallet,
      input.note || null,
      id,
    ]
  );
}

/**
 * Menghapus transaksi
 */
export async function deleteTransaction(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

/**
 * Menghitung ringkasan total saldo dan mutasi bulan ini
 */
export async function getFinanceSummary(db: SQLiteDatabase): Promise<FinanceSummary> {
  const monthRange = getCurrentMonthRange();

  // Total saldo akumulatif sepanjang waktu
  const overall = await db.getFirstAsync<{
    total_income: number | null;
    total_expense: number | null;
  }>(`
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
    FROM transactions
  `);

  const allIncome = overall?.total_income || 0;
  const allExpense = overall?.total_expense || 0;
  const totalBalance = allIncome - allExpense;

  // Mutasi bulan berjalan
  const thisMonth = await db.getFirstAsync<{
    month_income: number | null;
    month_expense: number | null;
  }>(
    `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as month_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as month_expense
    FROM transactions
    WHERE date >= ? AND date <= ?
  `,
    [monthRange.startDate, monthRange.endDate]
  );

  const totalIncomeThisMonth = thisMonth?.month_income || 0;
  const totalExpenseThisMonth = thisMonth?.month_expense || 0;
  const netSavingsThisMonth = totalIncomeThisMonth - totalExpenseThisMonth;

  return {
    totalBalance,
    totalIncomeThisMonth,
    totalExpenseThisMonth,
    netSavingsThisMonth,
  };
}

/**
 * Mengambil ringkasan laporan bulanan per kategori dan totalnya
 */
export async function getMonthlyReportSummary(
  db: SQLiteDatabase,
  year: number,
  month: number // 1-12
): Promise<MonthlyReportSummary> {
  const { startDate, endDate } = getMonthRange(year, month - 1);

  // Ambil total pengeluaran dan pemasukan bulan tersebut
  const totalStats = await db.getFirstAsync<{
    total_income: number | null;
    total_expense: number | null;
  }>(
    `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
    FROM transactions
    WHERE date >= ? AND date <= ?
  `,
    [startDate, endDate]
  );

  const totalIncome = totalStats?.total_income || 0;
  const totalExpense = totalStats?.total_expense || 0;
  const netBalance = totalIncome - totalExpense;

  // Breakdown kategori pengeluaran
  const expenseRows = await db.getAllAsync<{
    category_id: number;
    category_name: string;
    category_icon: string;
    category_color: string;
    total: number;
    count: number;
  }>(
    `
    SELECT 
      t.category_id,
      c.name as category_name,
      c.icon as category_icon,
      c.color as category_color,
      SUM(t.amount) as total,
      COUNT(t.id) as count
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'expense' AND t.date >= ? AND t.date <= ?
    GROUP BY t.category_id
    ORDER BY total DESC
  `,
    [startDate, endDate]
  );

  const expenseCategories: CategoryReport[] = expenseRows.map((row) => ({
    ...row,
    percentage: totalExpense > 0 ? (row.total / totalExpense) * 100 : 0,
  }));

  // Breakdown kategori pemasukan
  const incomeRows = await db.getAllAsync<{
    category_id: number;
    category_name: string;
    category_icon: string;
    category_color: string;
    total: number;
    count: number;
  }>(
    `
    SELECT 
      t.category_id,
      c.name as category_name,
      c.icon as category_icon,
      c.color as category_color,
      SUM(t.amount) as total,
      COUNT(t.id) as count
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'income' AND t.date >= ? AND t.date <= ?
    GROUP BY t.category_id
    ORDER BY total DESC
  `,
    [startDate, endDate]
  );

  const incomeCategories: CategoryReport[] = incomeRows.map((row) => ({
    ...row,
    percentage: totalIncome > 0 ? (row.total / totalIncome) * 100 : 0,
  }));

  return {
    year,
    month,
    totalIncome,
    totalExpense,
    netBalance,
    expenseCategories,
    incomeCategories,
  };
}

/**
 * Reset seluruh transaksi (data kategori bawaan tetap terjaga)
 */
export async function resetAllTransactions(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM transactions');
}

/**
 * Ekspor seluruh data untuk cadangan offline
 */
export async function exportDatabaseData(db: SQLiteDatabase): Promise<BackupData> {
  const categories = await db.getAllAsync<Category>('SELECT * FROM categories');
  const transactions = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions ORDER BY date ASC, time ASC'
  );

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    transactions,
  };
}

/**
 * Memulihkan data dari cadangan offline JSON
 */
export async function importDatabaseData(
  db: SQLiteDatabase,
  backup: BackupData
): Promise<void> {
  await db.withTransactionAsync(async () => {
    // 1. Pulihkan kategori baru yang belum ada
    for (const cat of backup.categories) {
      const exists = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM categories WHERE name = ? AND type = ?',
        [cat.name, cat.type]
      );
      if (!exists) {
        await db.runAsync(
          'INSERT INTO categories (name, type, icon, color, is_default) VALUES (?, ?, ?, ?, ?)',
          [cat.name, cat.type, cat.icon, cat.color, cat.is_default ?? 0]
        );
      }
    }

    // 2. Pulihkan transaksi
    for (const tx of backup.transactions) {
      await db.runAsync(
        `INSERT INTO transactions (type, amount, category_id, date, time, wallet, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tx.type,
          tx.amount,
          tx.category_id,
          tx.date,
          tx.time,
          tx.wallet,
          tx.note || null,
          tx.created_at || new Date().toISOString(),
        ]
      );
    }
  });
}
