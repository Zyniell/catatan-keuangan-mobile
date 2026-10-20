const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const MONTHS_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDateIndonesian(dateString: string, includeDay = true): string {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  const dayName = DAYS_ID[date.getDay()];
  const monthName = MONTHS_SHORT_ID[m - 1] || '';

  const todayStr = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayYear = yesterday.getFullYear();
  const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
  const yesterdayDay = String(yesterday.getDate()).padStart(2, '0');
  const yesterdayStr = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;

  if (dateString === todayStr) {
    return `Hari Ini, ${d} ${monthName} ${y}`;
  }
  if (dateString === yesterdayStr) {
    return `Kemarin, ${d} ${monthName} ${y}`;
  }

  if (includeDay) {
    return `${dayName}, ${d} ${monthName} ${y}`;
  }
  return `${d} ${monthName} ${y}`;
}

export function formatMonthYear(monthIndex: number, year: number): string {
  return `${MONTHS_ID[monthIndex]} ${year}`;
}

export function getCurrentMonthRange(): { startDate: string; endDate: string; month: number; year: number } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate, month: month + 1, year };
}

export function getMonthRange(year: number, monthIndex: number): { startDate: string; endDate: string } {
  const startDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const endDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { startDate, endDate };
}

export function getFilterDateRange(
  filter: 'all' | 'today' | 'week' | 'month',
  selectedYear?: number,
  selectedMonth?: number // 1-12
): { startDate?: string; endDate?: string } {
  const today = getTodayDateString();

  if (filter === 'today') {
    return { startDate: today, endDate: today };
  }

  if (filter === 'week') {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = (dayOfWeek + 6) % 7; // Monday = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);

    const monY = monday.getFullYear();
    const monM = String(monday.getMonth() + 1).padStart(2, '0');
    const monD = String(monday.getDate()).padStart(2, '0');

    return { startDate: `${monY}-${monM}-${monD}`, endDate: today };
  }

  if (filter === 'month') {
    const y = selectedYear ?? new Date().getFullYear();
    const m = (selectedMonth ? selectedMonth - 1 : new Date().getMonth());
    return getMonthRange(y, m);
  }

  return {};
}
