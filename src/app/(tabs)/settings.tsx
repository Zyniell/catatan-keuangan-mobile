import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../../components/ui/CategoryIcon';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const {
    categories,
    removeCategory,
    exportBackup,
    clearAllTransactions,
    allTransactions,
  } = useFinance();

  const [exporting, setExporting] = useState(false);

  // Kategori buatan pengguna sendiri (is_default === 0)
  const customCategories = categories.filter((c) => c.is_default === 0);

  const handleDeleteCategory = (id: number, name: string) => {
    Alert.alert(
      'Hapus Kategori',
      `Apakah Anda yakin ingin menghapus kategori "${name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCategory(id);
              Alert.alert('Sukses', `Kategori "${name}" berhasil dihapus.`);
            } catch (err: any) {
              Alert.alert('Gagal Menghapus', err?.message || 'Kategori tidak dapat dihapus.');
            }
          },
        },
      ]
    );
  };

  const handleExportBackup = async () => {
    try {
      setExporting(true);
      const backupData = await exportBackup();
      const jsonString = JSON.stringify(backupData, null, 2);

      const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `catatan_keuangan_backup_${dateStr}.json`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Simpan / Bagikan Cadangan Catatan Keuangan',
          UTI: 'public.json',
        });
      } else {
        Alert.alert(
          'Cadangan Tersimpan',
          `Berkas cadangan berhasil disimpan di:\n${fileUri}`
        );
      }
    } catch (err: any) {
      Alert.alert('Gagal Ekspor', err?.message || 'Terjadi kesalahan saat mengekspor data.');
    } finally {
      setExporting(false);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Konfirmasi Reset Data',
      'Seluruh riwayat transaksi Anda akan dihapus secara permanen. Kategori bawaan akan tetap aman. Anda yakin?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Lanjutkan Reset',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Peringatan Terakhir',
              'Tindakan ini TIDAK BISA DIBATALKAN. Hapus seluruh transaksi sekarang?',
              [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Hapus Sekarang',
                  style: 'destructive',
                  onPress: async () => {
                    await clearAllTransactions();
                    Alert.alert('Sukses', 'Seluruh data transaksi berhasil direset.');
                  },
                },
              ]
            );
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Pengaturan</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(insets.bottom, 20) + 80 },
        ]}
      >
        {/* Banner Offline & Privasi */}
        <View
          style={[
            styles.privacyCard,
            { backgroundColor: `${theme.primary}12`, borderColor: `${theme.primary}30` },
          ]}
        >
          <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
          <View style={styles.privacyTextCol}>
            <Text style={[styles.privacyTitle, { color: theme.primary }]}>
              Penyimpanan 100% Offline
            </Text>
            <Text style={[styles.privacyDesc, { color: theme.textSecondary }]}>
              Data transaksi dan keuangan Anda tersimpan utuh di perangkat lokal (SQLite)
              tanpa koneksi server, tanpa pelacak, dan tanpa iklan.
            </Text>
          </View>
        </View>

        {/* Manajemen Kategori Kustom */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Kategori Kustom Anda
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/modal/category')}
              activeOpacity={0.7}
            >
              <Text style={[styles.addText, { color: theme.primary }]}>+ Tambah Baru</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.cardBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {customCategories.length === 0 ? (
              <View style={styles.emptyCustomBox}>
                <Ionicons name="pricetags-outline" size={28} color={theme.textMuted} />
                <Text style={[styles.emptyCustomText, { color: theme.textSecondary }]}>
                  Belum ada kategori kustom. Anda dapat membuat kategori baru dengan tombol di atas.
                </Text>
              </View>
            ) : (
              customCategories.map((c, index) => (
                <View
                  key={c.id}
                  style={[
                    styles.categoryRow,
                    index < customCategories.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.borderLight,
                    },
                  ]}
                >
                  <CategoryIcon
                    icon={c.icon}
                    color={c.color}
                    size={20}
                    containerSize={36}
                  />
                  <View style={styles.categoryInfoCol}>
                    <Text style={[styles.categoryRowName, { color: theme.text }]}>
                      {c.name}
                    </Text>
                    <Text style={[styles.categoryRowType, { color: theme.textSecondary }]}>
                      {c.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteCategoryBtn}
                    onPress={() => handleDeleteCategory(c.id, c.name)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.expense} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Cadangan & Berkas Data */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Cadangan & Berkas Lokal
          </Text>

          <View
            style={[
              styles.cardBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleExportBackup}
              disabled={exporting}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: `${theme.primary}18` }]}>
                <Ionicons name="cloud-download-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={[styles.actionTitle, { color: theme.text }]}>
                  {exporting ? 'Menyiapkan Cadangan...' : 'Ekspor Cadangan (JSON)'}
                </Text>
                <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
                  Simpan berkas seluruh mutasi ({allTransactions.length} transaksi) ke memori HP
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Zona Bahaya */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.expense }]}>
            Zona Bahaya
          </Text>

          <View
            style={[
              styles.cardBox,
              { backgroundColor: theme.surface, borderColor: `${theme.expense}40` },
            ]}
          >
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleResetData}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: `${theme.expense}18` }]}>
                <Ionicons name="warning-outline" size={20} color={theme.expense} />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={[styles.actionTitle, { color: theme.expense }]}>
                  Reset Seluruh Data Transaksi
                </Text>
                <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
                  Hapus permanen semua catatan mutasi (Kategori bawaan tetap ada)
                </Text>
              </View>
              <Ionicons name="trash-outline" size={18} color={theme.expense} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Informasi Aplikasi */}
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.textMuted }]}>
            Catatan Keuangan v1.0.0 (Offline Edition)
          </Text>
          <Text style={[styles.versionSub, { color: theme.textMuted }]}>
            Ditenagai oleh React Native & Expo SQLite WAL
          </Text>
        </View>
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
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.four,
    paddingBottom: Spacing.seven,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.three,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  privacyTextCol: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  privacyDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  addText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardBox: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  emptyCustomBox: {
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyCustomText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
  },
  categoryInfoCol: {
    flex: 1,
    marginLeft: Spacing.two,
  },
  categoryRowName: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryRowType: {
    fontSize: 11,
    marginTop: 2,
  },
  deleteCategoryBtn: {
    padding: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
  },
  actionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextCol: {
    flex: 1,
    marginLeft: Spacing.two,
    marginRight: Spacing.two,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  versionSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
