import type { BookingCategory, BookingDbStatus } from '../types/booking';

export const STATUS_TRANSLATIONS: Record<string, string> = {
  pending: 'جديد',
  'جديد': 'جديد',
  new: 'جديد',

  confirmed: 'تم التأكيد',
  'تم التأكيد': 'تم التأكيد',

  completed: 'مكتمل',
  'مكتمل': 'مكتمل',

  cancelled: 'ملغي',
  'ملغي': 'ملغي',

  // Fallbacks for legacy records
  group_cancelled: 'ملغي',
  'إلغاء جماعي': 'ملغي',
};

export const CATEGORY_ICONS: Record<BookingCategory, string> = {
  'كول سنتر': '🎧',
  'عميل جديد': '✨',
  'عميل سابق': '⭐',
  'عيد ميلاد': '🎂',
  'جامعة': '🎓',
  'إيفنت خارجي': '🎪',
  'مدرسة': '🎒',
};

export function translateStatus(status: BookingDbStatus | string): string {
  return STATUS_TRANSLATIONS[status] || status;
}

export function getCategoryIcon(category: string): string {
  return (CATEGORY_ICONS as Record<string, string>)[category] || '🎯';
}

export function formatPeopleCount(count: number | undefined | null): string {
  const num = Number(count);
  if (!num || isNaN(num) || num <= 0) return 'فرد واحد';
  if (num === 1) return 'لاعب واحد';
  if (num === 2) return 'لاعبان (٢)';
  if (num >= 3 && num <= 10) return `${num} لاعبين`;
  return `${num} لاعب`;
}
