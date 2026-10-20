import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  useColorScheme,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { useFinance } from '../../context/FinanceContext';
import { StatCard } from '../../components/ui/StatCard';
import { TransactionItem } from '../../components/ui/TransactionItem';
import { EmptyState } from '../../components/ui/EmptyState';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const { recentTransactions, summary, refreshData } = useFinance();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header Aplikasi */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.appTitle, { color: theme.text }]}>Catatan Keuangan</Text>
          <Text style={[styles.appSubtitle, { color: theme.textSecondary }]}>
            100% Offline • Aman & Privat
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.headerIconBtn, { backgroundColor: theme.surfaceSubtle }]}
          onPress={() => router.push('/modal/transaction')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
          />
        }
      >
        {/* Kartu Saldo Utama */}
        <StatCard summary={summary} />

        {/* Tombol Aksi Cepat Tambah Transaksi */}
        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/modal/transaction')}
          activeOpacity={0.85}
        >
          <View style={styles.actionBtnIcon}>
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.actionBtnTextCol}>
            <Text style={styles.actionBtnTitle}>+ Catat Transaksi Baru</Text>
            <Text style={styles.actionBtnSubtitle}>
              Catat pengeluaran atau pemasukan harian seketika
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Bagian Transaksi Terkini */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Transaksi Terkini
            </Text>
            {recentTransactions.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/transactions')}
                activeOpacity={0.7}
              >
                <Text style={[styles.viewAllText, { color: theme.primary }]}>
                  Lihat Semua
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {recentTransactions.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="Belum Ada Transaksi"
              message="Mulai catat transaksi pengeluaran atau pemasukan Anda hari ini."
              actionLabel="Catat Sekarang"
              onAction={() => router.push('/modal/transaction')}
            />
          ) : (
            recentTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                showDate
                onPress={() =>
                  router.push({
                    pathname: '/modal/transaction',
                    params: { id: tx.id },
                  })
                }
              />
            ))
          )}
        </View>
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
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.four,
    paddingBottom: Spacing.seven,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.xl,
    marginVertical: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnIcon: {
    marginRight: Spacing.two,
  },
  actionBtnTextCol: {
    flex: 1,
  },
  actionBtnTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  actionBtnSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  recentSection: {
    marginTop: Spacing.three,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
