import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { formatRupiah } from '../../utils/currency';
import { FinanceSummary } from '../../types/finance';

interface StatCardProps {
  summary: FinanceSummary;
}

export function StatCard({ summary }: StatCardProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const isPositiveBalance = summary.totalBalance >= 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Total Saldo Utama */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="wallet" size={16} color={theme.primary} />
          <Text style={[styles.title, { color: theme.textSecondary }]}>Total Saldo Bersih</Text>
        </View>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isPositiveBalance ? `${theme.income}15` : `${theme.expense}15`,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isPositiveBalance ? theme.income : theme.expense },
            ]}
          >
            {isPositiveBalance ? 'Surplus' : 'Defisit'}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.balanceAmount,
          { color: isPositiveBalance ? theme.text : theme.expense },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatRupiah(summary.totalBalance)}
      </Text>

      {/* Garis Pemisah */}
      <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

      {/* Ringkasan Pemasukan & Pengeluaran Bulan Ini */}
      <View style={styles.metricsRow}>
        {/* Pemasukan */}
        <View style={styles.metricItem}>
          <View style={styles.metricLabelRow}>
            <View style={[styles.arrowCircle, { backgroundColor: `${theme.income}20` }]}>
              <Ionicons name="arrow-down" size={12} color={theme.income} />
            </View>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              Pemasukan Bulan Ini
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.income }]} numberOfLines={1}>
            +{formatRupiah(summary.totalIncomeThisMonth)}
          </Text>
        </View>

        {/* Separator vertikal */}
        <View style={[styles.verticalDivider, { backgroundColor: theme.borderLight }]} />

        {/* Pengeluaran */}
        <View style={styles.metricItem}>
          <View style={styles.metricLabelRow}>
            <View style={[styles.arrowCircle, { backgroundColor: `${theme.expense}20` }]}>
              <Ionicons name="arrow-up" size={12} color={theme.expense} />
            </View>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              Pengeluaran Bulan Ini
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.expense }]} numberOfLines={1}>
            -{formatRupiah(summary.totalExpenseThisMonth)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    marginVertical: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginVertical: Spacing.one,
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.three,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  arrowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  verticalDivider: {
    width: 1,
    height: 36,
    marginHorizontal: Spacing.two,
  },
});
