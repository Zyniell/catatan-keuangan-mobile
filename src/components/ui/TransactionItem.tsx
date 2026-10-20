import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { formatRupiah } from '../../utils/currency';
import { Transaction } from '../../types/finance';
import { CategoryIcon } from './CategoryIcon';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  onLongPress?: () => void;
  showDate?: boolean;
}

export function TransactionItem({
  transaction,
  onPress,
  onLongPress,
  showDate = false,
}: TransactionItemProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? theme.income : theme.expense;
  const prefix = isIncome ? '+' : '-';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Ikon Kategori */}
      <CategoryIcon
        icon={transaction.category_icon || 'pricetag-outline'}
        color={transaction.category_color || theme.primary}
        size={20}
        containerSize={42}
      />

      {/* Info Deskripsi */}
      <View style={styles.infoCol}>
        <Text style={[styles.categoryTitle, { color: theme.text }]} numberOfLines={1}>
          {transaction.category_name || 'Tanpa Kategori'}
        </Text>

        <View style={styles.subRow}>
          {/* Badge Dompet */}
          <View style={[styles.walletBadge, { backgroundColor: theme.surfaceSubtle }]}>
            <Text style={[styles.walletText, { color: theme.textSecondary }]}>
              {transaction.wallet}
            </Text>
          </View>

          {/* Catatan jika ada */}
          {transaction.note ? (
            <Text
              style={[styles.noteText, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              • {transaction.note}
            </Text>
          ) : null}

          {/* Jam atau Tanggal */}
          <Text style={[styles.timeText, { color: theme.textMuted }]}>
            {showDate ? `${transaction.date} ` : ''}{transaction.time}
          </Text>
        </View>
      </View>

      {/* Nominal */}
      <View style={styles.amountCol}>
        <Text style={[styles.amountText, { color: amountColor }]} numberOfLines={1}>
          {prefix}{formatRupiah(transaction.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  infoCol: {
    flex: 1,
    marginLeft: Spacing.two,
    marginRight: Spacing.two,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  walletBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  walletText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    flexShrink: 1,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
