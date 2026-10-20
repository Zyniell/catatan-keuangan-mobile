import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { useFinance } from '../../context/FinanceContext';
import { DailyTransactionGroup, Transaction, TransactionType } from '../../types/finance';
import { formatDateIndonesian, getFilterDateRange } from '../../utils/date';
import { formatRupiah } from '../../utils/currency';
import { TransactionItem } from '../../components/ui/TransactionItem';
import { EmptyState } from '../../components/ui/EmptyState';

type PeriodFilter = 'all' | 'today' | 'week' | 'month';

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const { allTransactions, removeTransaction } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  // Filter transaksi berdasarkan search, tipe, dan periode
  const filteredList = useMemo(() => {
    let result = [...allTransactions];

    // Filter tipe
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Filter periode
    if (periodFilter !== 'all') {
      const { startDate, endDate } = getFilterDateRange(periodFilter);
      if (startDate) {
        result = result.filter((t) => t.date >= startDate);
      }
      if (endDate) {
        result = result.filter((t) => t.date <= endDate);
      }
    }

    // Pencarian
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          (t.note && t.note.toLowerCase().includes(q)) ||
          (t.category_name && t.category_name.toLowerCase().includes(q)) ||
          (t.wallet && t.wallet.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allTransactions, typeFilter, periodFilter, searchQuery]);

  // Kelompokkan per tanggal
  const groupedTransactions: DailyTransactionGroup[] = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};

    filteredList.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    });

    const dates = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));

    return dates.map((date) => {
      const txs = groups[date];
      const totalExpense = txs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = txs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date,
        formattedDate: formatDateIndonesian(date),
        totalExpense,
        totalIncome,
        transactions: txs,
      };
    });
  }, [filteredList]);

  const handleDelete = (id: number) => {
    Alert.alert(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus catatan mutasi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await removeTransaction(id);
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header Layar */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
            paddingTop: Math.max(insets.top, 24) + 12,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Riwayat Transaksi
        </Text>
        <TouchableOpacity
          style={[styles.headerActionBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/modal/transaction')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.headerActionText}>Catat</Text>
        </TouchableOpacity>
      </View>

      {/* Bar Pencarian */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
          ]}
        >
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Cari transaksi, kategori, atau catatan..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Baris: Tipe Finansial */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              typeFilter === 'all' && { backgroundColor: theme.primary, borderColor: theme.primary },
              { borderColor: theme.border },
            ]}
            onPress={() => setTypeFilter('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: typeFilter === 'all' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Semua Tipe
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              typeFilter === 'expense' && { backgroundColor: theme.expense, borderColor: theme.expense },
              { borderColor: theme.border },
            ]}
            onPress={() => setTypeFilter('expense')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: typeFilter === 'expense' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Pengeluaran
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              typeFilter === 'income' && { backgroundColor: theme.income, borderColor: theme.income },
              { borderColor: theme.border },
            ]}
            onPress={() => setTypeFilter('income')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: typeFilter === 'income' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Pemasukan
            </Text>
          </TouchableOpacity>

          {/* Filter Periode Waktu */}
          <View style={[styles.filterDivider, { backgroundColor: theme.border }]} />

          {(['all', 'today', 'week', 'month'] as PeriodFilter[]).map((p) => {
            const labels: Record<PeriodFilter, string> = {
              all: 'Semua Waktu',
              today: 'Hari Ini',
              week: 'Minggu Ini',
              month: 'Bulan Ini',
            };
            const isSelected = periodFilter === p;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.filterChip,
                  isSelected && {
                    backgroundColor: theme.text,
                    borderColor: theme.text,
                  },
                  { borderColor: theme.border },
                ]}
                onPress={() => setPeriodFilter(p)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? theme.surface : theme.textSecondary },
                  ]}
                >
                  {labels[p]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Konten Daftar Transaksi Berkelompok */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(insets.bottom, 20) + 80 },
        ]}
      >
        {groupedTransactions.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="Tidak Ada Transaksi"
            message={
              searchQuery
                ? 'Tidak ditemukan transaksi yang cocok dengan kata kunci Anda.'
                : 'Belum ada transaksi pada periode yang dipilih.'
            }
            actionLabel={searchQuery ? 'Hapus Pencarian' : 'Catat Transaksi'}
            onAction={() => {
              if (searchQuery) setSearchQuery('');
              else router.push('/modal/transaction');
            }}
          />
        ) : (
          groupedTransactions.map((group) => (
            <View key={group.date} style={styles.groupContainer}>
              {/* Header Grup Tanggal */}
              <View style={styles.groupHeader}>
                <Text style={[styles.groupDateText, { color: theme.text }]}>
                  {group.formattedDate}
                </Text>
                <View style={styles.groupTotals}>
                  {group.totalIncome > 0 && (
                    <Text style={[styles.groupIncomeText, { color: theme.income }]}>
                      +{formatRupiah(group.totalIncome)}
                    </Text>
                  )}
                  {group.totalExpense > 0 && (
                    <Text style={[styles.groupExpenseText, { color: theme.expense }]}>
                      -{formatRupiah(group.totalExpense)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Item Transaksi pada Tanggal tersebut */}
              {group.transactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onPress={() =>
                    router.push({
                      pathname: '/modal/transaction',
                      params: { id: tx.id },
                    })
                  }
                  onLongPress={() => handleDelete(tx.id)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  headerActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchContainer: {
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 2,
  },
  filterScroll: {
    paddingHorizontal: Spacing.four,
    gap: 8,
    marginTop: Spacing.two,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
    alignSelf: 'center',
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.four,
    paddingBottom: Spacing.seven,
  },
  groupContainer: {
    marginBottom: Spacing.three,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
    paddingHorizontal: 2,
  },
  groupDateText: {
    fontSize: 13,
    fontWeight: '700',
  },
  groupTotals: {
    flexDirection: 'row',
    gap: 8,
  },
  groupIncomeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  groupExpenseText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
