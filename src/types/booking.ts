export type BookingStatus = 'جديد' | 'تم التواصل' | 'تم التأكيد' | 'مكتمل' | 'ملغي';

export type CustomerSource =
  | 'انستغرام'
  | 'تيك توك'
  | 'سناب شات'
  | 'واتساب'
  | 'اتصال هاتفي'
  | 'زيارة مباشرة'
  | 'صديق / توصية'
  | 'جوجل'
  | 'إعلان ممول'
  | 'أخرى';

export type CustomerType = 'new' | 'returning' | 'vip' | 'referred';

export interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_source: CustomerSource;
  customer_type: CustomerType;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string | null;
  service_type: string;
  branch_name: string;
  booking_date: string;
  time_slot: string;
  status: BookingStatus;
  notes: string | null;
  last_contact_date: string | null;
  next_followup_date: string | null;
  created_at?: string;
  updated_at?: string;
}
