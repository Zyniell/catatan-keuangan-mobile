import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { useFinance } from '../../context/FinanceContext';
import { MonthlyReportSummary, TransactionType } from '../../types/finance';
import { formatMonthYear } from '../../utils/date';
import { formatRupiah } from '../../utils/currency';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { EmptyState } from '../../components/ui/EmptyState';

export default function ReportsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const { getMonthlyReport, allTransactions } = useFinance();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [report, setReport] = useState<MonthlyReportSummary | null>(null);

  // Muat ulang laporan setiap kali bulan/tahun atau transaksi berubah
  useEffect(() => {
    let isMounted = true;
    getMonthlyReport(selectedYear, selectedMonth).then((data) => {
      if (isMounted) setReport(data);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedYear, selectedMonth, allTransactions, getMonthlyReport]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const totalIn = report?.totalIncome || 0;
  const totalOut = report?.totalExpense || 0;
  const totalFlow = totalIn + totalOut;
  const incomeRatio = totalFlow > 0 ? (totalIn / totalFlow) * 100 : 50;
  const expenseRatio = totalFlow > 0 ? (totalOut / totalFlow) * 100 : 50;

  const activeCategories =
    activeTab === 'expense'
      ? report?.expenseCategories || []
      : report?.incomeCategories || [];

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
          Laporan & Statistik
        </Text>
      </View>

      {/* Navigasi Pemilih Bulan */}
      <View
        style={[
          styles.monthNavRow,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.navArrowBtn, { backgroundColor: theme.surfaceSubtle }]}
          onPress={handlePrevMonth}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.monthLabelContainer}>
          <Ionicons name="calendar" size={16} color={theme.primary} />
          <Text style={[styles.monthLabelText, { color: theme.text }]}>
            {formatMonthYear(selectedMonth - 1, selectedYear)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.navArrowBtn, { backgroundColor: theme.surfaceSubtle }]}
          onPress={handleNextMonth}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(insets.bottom, 20) + 80 },
        ]}
      >
        {/* Ringkasan Arus Kas Bulan Terpilih */}
        <View
          style={[
            styles.cashFlowCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>
            Arus Kas Bulanan
          </Text>

          <View style={styles.flowNumbersRow}>
            <View style={styles.flowItem}>
              <Text style={[styles.flowLabel, { color: theme.textSecondary }]}>
                Pemasukan
              </Text>
              <Text style={[styles.incomeVal, { color: theme.income }]}>
                +{formatRupiah(totalIn)}
              </Text>
            </View>

            <View style={[styles.verticalLine, { backgroundColor: theme.border }]} />

            <View style={styles.flowItem}>
              <Text style={[styles.flowLabel, { color: theme.textSecondary }]}>
                Pengeluaran
              </Text>
              <Text style={[styles.expenseVal, { color: theme.expense }]}>
                -{formatRupiah(totalOut)}
              </Text>
            </View>
          </View>

          {/* Bar Proporsional Arus Kas */}
          <View style={styles.ratioBarContainer}>
            <View
              style={[
                styles.ratioSegment,
                { width: `${incomeRatio}%`, backgroundColor: theme.income },
              ]}
            />
            <View
              style={[
                styles.ratioSegment,
                { width: `${expenseRatio}%`, backgroundColor: theme.expense },
              ]}
            />
          </View>

          {/* Saldo Bersih Bulan Ini */}
          <View
            style={[
              styles.netBox,
              {
                backgroundColor: theme.surfaceSubtle,
              },
            ]}
          >
            <Text style={[styles.netLabel, { color: theme.textSecondary }]}>
              Selisih Bersih (Tabungan):
            </Text>
            <Text
              style={[
                styles.netValue,
                {
                  color: (report?.netBalance || 0) >= 0 ? theme.income : theme.expense,
                },
              ]}
            >
              {(report?.netBalance || 0) >= 0 ? '+' : ''}
              {formatRupiah(report?.netBalance || 0)}
            </Text>
          </View>
        </View>

        {/* Tab Switch Breakdown Pengeluaran vs Pemasukan */}
        <View style={[styles.tabSwitch, { backgroundColor: theme.surfaceSubtle }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'expense' && { backgroundColor: theme.expense },
            ]}
            onPress={() => setActiveTab('expense')}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'expense' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Pengeluaran ({report?.expenseCategories.length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'income' && { backgroundColor: theme.income },
            ]}
            onPress={() => setActiveTab('income')}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'income' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Pemasukan ({report?.incomeCategories.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rincian per Kategori */}
        {activeCategories.length === 0 ? (
          <EmptyState
            icon="pie-chart-outline"
            title="Belum Ada Data"
            message={`Belum ada mutasi ${activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'} pada bulan ${formatMonthYear(selectedMonth - 1, selectedYear)}.`}
          />
        ) : (
          activeCategories.map((cat) => (
            <View
              key={cat.category_id}
              style={[
                styles.categoryReportCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.catHeaderRow}>
                <CategoryIcon
                  icon={cat.category_icon}
                  color={cat.category_color}
                  size={20}
                  containerSize={40}
                />
                <View style={styles.catNameCol}>
                  <Text style={[styles.catName, { color: theme.text }]}>
                    {cat.category_name}
                  </Text>
                  <Text style={[styles.catCount, { color: theme.textSecondary }]}>
                    {cat.count} transaksi
                  </Text>
                </View>

                <View style={styles.catAmountCol}>
                  <Text style={[styles.catAmount, { color: theme.text }]}>
                    {formatRupiah(cat.total)}
                  </Text>
                  <Text style={[styles.catPercent, { color: cat.category_color }]}>
                    {cat.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>

              {/* Bar Progres Kategori */}
              <View style={[styles.progressBarTrack, { backgroundColor: theme.surfaceSubtle }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(cat.percentage, 100)}%`,
                      backgroundColor: cat.category_color,
                    },
                  ]}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  navArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthLabelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.four,
    paddingBottom: Spacing.seven,
  },
  cashFlowCard: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  flowNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.one,
  },
  flowItem: {
    flex: 1,
  },
  verticalLine: {
    width: 1,
    height: 36,
    marginHorizontal: Spacing.two,
  },
  flowLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  incomeVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  expenseVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  ratioBarContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  ratioSegment: {
    height: '100%',
  },
  netBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: Radius.lg,
    marginTop: Spacing.two,
  },
  netLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  netValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  tabSwitch: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: Radius.lg,
    marginBottom: Spacing.three,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryReportCard: {
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  catHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catNameCol: {
    flex: 1,
    marginLeft: Spacing.two,
  },
  catName: {
    fontSize: 14,
    fontWeight: '700',
  },
  catCount: {
    fontSize: 11,
    marginTop: 2,
  },
  catAmountCol: {
    alignItems: 'flex-end',
  },
  catAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  catPercent: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
