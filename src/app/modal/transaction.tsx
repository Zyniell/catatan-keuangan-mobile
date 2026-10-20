import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { DEFAULT_WALLETS } from '../../constants/categories';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType } from '../../types/finance';
import { getCurrentTimeString, getTodayDateString } from '../../utils/date';
import { AmountInput } from '../../components/ui/AmountInput';
import { CategoryIcon } from '../../components/ui/CategoryIcon';

export default function TransactionModal() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const {
    categories,
    allTransactions,
    createTransaction,
    editTransaction,
    removeTransaction,
  } = useFinance();

  const existing = isEditing && id ? allTransactions.find((t) => t.id === Number(id)) : null;

  const [type, setType] = useState<TransactionType>(existing?.type || 'expense');
  const [amount, setAmount] = useState<number>(existing?.amount || 0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    existing?.category_id || null
  );
  const [wallet, setWallet] = useState<string>(existing?.wallet || 'Tunai');
  const [date, setDate] = useState<string>(existing?.date || getTodayDateString());
  const [time, setTime] = useState<string>(existing?.time || getCurrentTimeString());
  const [note, setNote] = useState<string>(existing?.note || '');
  const [saving, setSaving] = useState<boolean>(false);

  // Filter kategori berdasarkan tipe yang dipilih (expense atau income)
  const filteredCategories = categories.filter((c) => c.type === type);

  // Kategori terpilih yang valid untuk tipe saat ini
  const activeCategoryId =
    selectedCategoryId !== null && filteredCategories.some((c) => c.id === selectedCategoryId)
      ? selectedCategoryId
      : filteredCategories[0]?.id || null;

  const handleTypeToggle = (newType: TransactionType) => {
    setType(newType);
    const firstCat = categories.find((c) => c.type === newType);
    if (firstCat) {
      setSelectedCategoryId(firstCat.id);
    }
  };

  const handleSave = async () => {
    if (amount <= 0) {
      Alert.alert('Perhatian', 'Nominal transaksi harus lebih dari 0.');
      return;
    }

    if (!activeCategoryId) {
      Alert.alert('Perhatian', 'Silakan pilih kategori transaksi.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        type,
        amount,
        category_id: activeCategoryId,
        date,
        time,
        wallet,
        note: note.trim() || undefined,
      };

      if (isEditing && id) {
        await editTransaction(Number(id), payload);
      } else {
        await createTransaction(payload);
      }

      router.back();
    } catch (err: any) {
      Alert.alert('Gagal Menyimpan', err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus catatan transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTransaction(Number(id));
              router.back();
            } catch (err: any) {
              Alert.alert('Gagal Menghapus', err?.message || 'Gagal menghapus.');
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header Modal */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
            paddingTop: Math.max(insets.top, 20) + 12,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isEditing ? 'Ubah Transaksi' : 'Catat Transaksi'}
        </Text>

        {isEditing ? (
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={22} color={theme.expense} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(insets.bottom, 24) + 30 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Toggle Tipe: Pengeluaran vs Pemasukan */}
        <View style={[styles.typeToggleContainer, { backgroundColor: theme.surfaceSubtle }]}>
          <TouchableOpacity
            style={[
              styles.typeTab,
              type === 'expense' && { backgroundColor: theme.expense },
            ]}
            onPress={() => handleTypeToggle('expense')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-up-circle-outline"
              size={18}
              color={type === 'expense' ? '#FFFFFF' : theme.textSecondary}
            />
            <Text
              style={[
                styles.typeTabText,
                { color: type === 'expense' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Pengeluaran
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeTab,
              type === 'income' && { backgroundColor: theme.income },
            ]}
            onPress={() => handleTypeToggle('income')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-down-circle-outline"
              size={18}
              color={type === 'income' ? '#FFFFFF' : theme.textSecondary}
            />
            <Text
              style={[
                styles.typeTabText,
                { color: type === 'income' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Pemasukan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Nominal Rupiah */}
        <AmountInput amount={amount} onChangeAmount={setAmount} type={type} />

        {/* Pemilih Kategori */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Pilih Kategori
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/modal/category')}
              activeOpacity={0.7}
            >
              <Text style={[styles.addCatText, { color: theme.primary }]}>
                + Kategori Baru
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoryGrid}>
            {filteredCategories.map((cat) => {
              const isSelected = activeCategoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: isSelected
                        ? `${cat.color}20`
                        : theme.surface,
                      borderColor: isSelected ? cat.color : theme.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  activeOpacity={0.7}
                >
                  <CategoryIcon
                    icon={cat.icon}
                    color={cat.color}
                    size={22}
                    containerSize={40}
                  />
                  <Text
                    style={[
                      styles.categoryName,
                      {
                        color: isSelected ? cat.color : theme.text,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Pemilih Dompet / Sumber Dana */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Sumber Dana / Dompet
          </Text>
          <View style={styles.walletRow}>
            {DEFAULT_WALLETS.map((w) => {
              const isSelected = wallet === w;
              return (
                <TouchableOpacity
                  key={w}
                  style={[
                    styles.walletChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setWallet(w)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.walletChipText,
                      { color: isSelected ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {w}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tanggal & Waktu */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Tanggal & Waktu
          </Text>
          <View style={styles.dateTimeRow}>
            <View
              style={[
                styles.dateTimeInputBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.dateTimeTextInput, { color: theme.text }]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View
              style={[
                styles.dateTimeInputBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Ionicons name="time-outline" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.dateTimeTextInput, { color: theme.text }]}
                value={time}
                onChangeText={setTime}
                placeholder="HH:mm"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Catatan / Keterangan */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Catatan / Keterangan (Opsional)
          </Text>
          <View
            style={[
              styles.noteInputBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextInput
              style={[styles.noteTextInput, { color: theme.text }]}
              value={note}
              onChangeText={setNote}
              placeholder="Contoh: Makan siang di warteg, belanja mingguan..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Tombol Simpan */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: type === 'income' ? theme.income : theme.expense,
              opacity: saving ? 0.7 : 1,
            },
          ]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {saving
              ? 'Menyimpan...'
              : isEditing
              ? 'Simpan Perubahan'
              : 'Simpan Catatan'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.four,
    paddingBottom: Spacing.seven,
  },
  typeToggleContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: Radius.lg,
    marginBottom: Spacing.three,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  typeTabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginVertical: Spacing.two,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addCatText: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: Radius.lg,
  },
  categoryName: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },
  walletRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.one,
  },
  walletChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  walletChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.one,
  },
  dateTimeInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  dateTimeTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  noteInputBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: Spacing.one,
  },
  noteTextInput: {
    fontSize: 14,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    marginTop: Spacing.five,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
