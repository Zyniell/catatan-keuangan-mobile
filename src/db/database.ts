import { type SQLiteDatabase } from 'expo-sqlite';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export const DATABASE_NAME = 'catatan_keuangan.db';

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  // Aktifkan mode WAL dan skema tabel
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      wallet TEXT NOT NULL DEFAULT 'Tunai',
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date DESC);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);
  `);

  // Auto-seeding kategori awal jika tabel kategori masih kosong
  const catCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories'
  );

  if (!catCount || catCount.count === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await db.runAsync(
        'INSERT INTO categories (name, type, icon, color, is_default) VALUES (?, ?, ?, ?, ?)',
        [cat.name, cat.type, cat.icon, cat.color, cat.is_default]
      );
    }
  }
}
