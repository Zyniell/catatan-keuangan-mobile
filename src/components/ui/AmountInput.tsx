import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { formatRupiah, parseRupiahInput } from '../../utils/currency';
import { TransactionType } from '../../types/finance';

interface AmountInputProps {
  amount: number;
  onChangeAmount: (val: number) => void;
  type: TransactionType;
}

const QUICK_AMOUNTS = [
  { label: '+10 rb', value: 10000 },
  { label: '+20 rb', value: 20000 },
  { label: '+50 rb', value: 50000 },
  { label: '+100 rb', value: 100000 },
  { label: '+500 rb', value: 500000 },
];

export function AmountInput({ amount, onChangeAmount, type }: AmountInputProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const accentColor = type === 'income' ? theme.income : theme.expense;

  const handleTextChange = (text: string) => {
    const parsed = parseRupiahInput(text);
    onChangeAmount(parsed);
  };

  const handleQuickAdd = (addValue: number) => {
    onChangeAmount(amount + addValue);
  };

  const handleClear = () => {
    onChangeAmount(0);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Nominal Transaksi</Text>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.prefix, { color: accentColor }]}>Rp</Text>
        <TextInput
          style={[styles.input, { color: accentColor }]}
          value={amount > 0 ? formatRupiah(amount, false) : ''}
          placeholder="0"
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
          onChangeText={handleTextChange}
          maxLength={15}
          selectTextOnFocus
        />
        {amount > 0 && (
          <TouchableOpacity
            style={[styles.clearBtn, { backgroundColor: theme.surfaceSubtle }]}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Text style={[styles.clearText, { color: theme.textSecondary }]}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Add Chips */}
      <View style={styles.chipsRow}>
        {QUICK_AMOUNTS.map((chip) => (
          <TouchableOpacity
            key={chip.label}
            style={[
              styles.chip,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() => handleQuickAdd(chip.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, { color: theme.text }]}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.two,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  prefix: {
    fontSize: 28,
    fontWeight: '800',
    marginRight: Spacing.one,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    paddingVertical: 4,
  },
  clearBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.two,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
