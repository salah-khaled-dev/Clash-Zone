export type BookingDbStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled';

export type BookingStatusArabic = 
  | 'جديد' 
  | 'تم التأكيد' 
  | 'مكتمل' 
  | 'ملغي';

export const STATUS_ARABIC_MAP: Record<BookingDbStatus, BookingStatusArabic> = {
  pending: 'جديد',
  confirmed: 'تم التأكيد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export const STATUS_DB_MAP: Record<string, BookingDbStatus> = {
  جديد: 'pending',
  'تم التأكيد': 'confirmed',
  مكتمل: 'completed',
  ملغي: 'cancelled',
  // Historical normalization to cancelled
  'إلغاء جماعي': 'cancelled',
  group_cancelled: 'cancelled',
  pending: 'pending',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
};

export type BookingCategory =
  | 'كول سنتر'
  | 'عميل جديد'
  | 'عميل سابق'
  | 'عيد ميلاد'
  | 'جامعة'
  | 'إيفنت خارجي'
  | 'مدرسة';

export const ClashZone_CATEGORIES: BookingCategory[] = [
  'كول سنتر',
  'عميل جديد',
  'عميل سابق',
  'عيد ميلاد',
  'جامعة',
  'إيفنت خارجي',
  'مدرسة',
];

export interface Booking {
  id: string;
  customer_name: string;
  phone: string;
  number_of_people: number;
  category: BookingCategory;
  booking_date: string;
  booking_time: string;
  duration_minutes?: number | null;
  status: BookingDbStatus;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  creator_name?: string | null;
  creator_role?: UserRole | null;
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'unassigned';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  role: UserRole;
  is_active?: boolean;
  created_at?: string;
}

