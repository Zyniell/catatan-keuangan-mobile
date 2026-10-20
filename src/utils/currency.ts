/**
 * Memformat angka ke format mata uang Rupiah Indonesia (IDR)
 * Contoh: 50000 -> "Rp 50.000"
 */
export function formatRupiah(amount: number, withPrefix = true): string {
  if (isNaN(amount)) return withPrefix ? 'Rp 0' : '0';

  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  const parts = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (withPrefix) {
    return isNegative ? `-Rp ${parts}` : `Rp ${parts}`;
  }

  return isNegative ? `-${parts}` : parts;
}

/**
 * Mengubah string input pengguna (bisa ada tanda titik/koma) menjadi nilai angka bulat
 */
export function parseRupiahInput(value: string): number {
  if (!value) return 0;
  const cleanStr = value.replace(/[^0-9]/g, '');
  const parsed = parseInt(cleanStr, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Memformat nominal singkat untuk label grafik atau ringkasan padat
 * Contoh: 1.500.000 -> "1,5 Jt", 50.000 -> "50 rb"
 */
export function formatShortRupiah(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 1_000_000_000) {
    const val = (absAmount / 1_000_000_000).toFixed(1).replace('.0', '').replace('.', ',');
    return `${sign}${val} M`;
  }
  if (absAmount >= 1_000_000) {
    const val = (absAmount / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',');
    return `${sign}${val} Jt`;
  }
  if (absAmount >= 1_000) {
    const val = (absAmount / 1_000).toFixed(0);
    return `${sign}${val} rb`;
  }

  return `${sign}${absAmount}`;
}
