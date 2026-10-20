import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { AVAILABLE_COLORS, AVAILABLE_ICONS } from '../../constants/categories';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType } from '../../types/finance';
import { CategoryIcon } from '../../components/ui/CategoryIcon';

export default function CategoryModal() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const { createCategory } = useFinance();

  const [name, setName] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [icon, setIcon] = useState<string>('cart-outline');
  const [color, setColor] = useState<string>('#3B82F6');
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Nama kategori tidak boleh kosong.');
      return;
    }

    try {
      setSaving(true);
      await createCategory({
        name: name.trim(),
        type,
        icon,
        color,
      });

      router.back();
    } catch (err: any) {
      Alert.alert('Gagal Menyimpan', err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
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

        <Text style={[styles.headerTitle, { color: theme.text }]}>Tambah Kategori</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(insets.bottom, 24) + 30 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Pratinjau Kategori */}
        <View
          style={[
            styles.previewBox,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>
            Pratinjau Kategori
          </Text>
          <CategoryIcon icon={icon} color={color} size={32} containerSize={64} />
          <Text style={[styles.previewName, { color: theme.text }]}>
            {name.trim() || 'Nama Kategori'}
          </Text>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: type === 'income' ? `${theme.income}20` : `${theme.expense}20` },
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                { color: type === 'income' ? theme.income : theme.expense },
              ]}
            >
              {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </Text>
          </View>
        </View>

        {/* Input Nama */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Nama Kategori
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Contoh: Kopi, Langganan Netflix, Laundry..."
            placeholderTextColor={theme.textMuted}
            maxLength={30}
          />
        </View>

        {/* Pilihan Tipe */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Tipe Finansial
          </Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                {
                  backgroundColor: type === 'expense' ? theme.expense : theme.surface,
                  borderColor: type === 'expense' ? theme.expense : theme.border,
                },
              ]}
              onPress={() => setType('expense')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: type === 'expense' ? '#FFFFFF' : theme.text },
                ]}
              >
                Pengeluaran
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                {
                  backgroundColor: type === 'income' ? theme.income : theme.surface,
                  borderColor: type === 'income' ? theme.income : theme.border,
                },
              ]}
              onPress={() => setType('income')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: type === 'income' ? '#FFFFFF' : theme.text },
                ]}
              >
                Pemasukan
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pilihan Warna */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Pilih Warna Tema
          </Text>
          <View style={styles.colorGrid}>
            {AVAILABLE_COLORS.map((c) => {
              const isSelected = color === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    isSelected && styles.colorSelected,
                  ]}
                  onPress={() => setColor(c)}
                  activeOpacity={0.8}
                >
                  {isSelected && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Pilihan Ikon */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Pilih Ikon
          </Text>
          <View style={styles.iconGrid}>
            {AVAILABLE_ICONS.map((ic) => {
              const isSelected = icon === ic;
              return (
                <TouchableOpacity
                  key={ic}
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isSelected ? `${color}25` : theme.surface,
                      borderColor: isSelected ? color : theme.border,
                    },
                  ]}
                  onPress={() => setIcon(ic)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={ic as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={isSelected ? color : theme.textSecondary}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tombol Simpan */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: color, opacity: saving ? 0.7 : 1 },
          ]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {saving ? 'Menyimpan...' : 'Simpan Kategori'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  previewBox: {
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: Spacing.two,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: Spacing.two,
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    marginTop: Spacing.two,
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
