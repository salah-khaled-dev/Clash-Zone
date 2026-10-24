import { supabase } from '../lib/supabase';
import type { Booking, BookingCategory, BookingDbStatus, UserRole, UserProfile } from '../types/booking';
import { STATUS_DB_MAP, WARZONE_CATEGORIES } from '../types/booking';
import type { Database } from '../types/database';
import { normalizeTimeSlot } from '../utils/timeSlots';

type WarzoneBookingRow = Database['public']['Tables']['warzone_bookings']['Row'];
type WarzoneBookingInsert = Database['public']['Tables']['warzone_bookings']['Insert'];
type WarzoneBookingUpdate = Database['public']['Tables']['warzone_bookings']['Update'];
type WarzoneBookingFeedRow = Database['public']['Views']['warzone_bookings_feed']['Row'];

function normalizeBooking(row: WarzoneBookingRow | WarzoneBookingFeedRow | any): Booking {
  const parsedPeople = Number(row.number_of_people);
  const numberOfPeople = !isNaN(parsedPeople) && parsedPeople > 0 ? Math.floor(parsedPeople) : 1;
  const rawStatus = (row.status || 'pending').toLowerCase();
  const status: BookingDbStatus = (STATUS_DB_MAP[rawStatus] || 'pending') as BookingDbStatus;
  
  const category = (
    WARZONE_CATEGORIES.includes(row.category as BookingCategory) 
      ? row.category 
      : 'عميل جديد'
  ) as BookingCategory;

  return {
    id: row.id,
    customer_name: row.customer_name,
    phone: row.phone,
    number_of_people: numberOfPeople,
    category: category,
    booking_date: row.booking_date,
    booking_time: normalizeTimeSlot(row.booking_time),
    status: status,
    notes: row.notes,
    created_at: row.created_at || undefined,
    updated_at: row.updated_at || undefined,
    created_by: row.created_by || null,
    creator_name: row.creator_name || (row.created_by ? 'غير مسجل' : 'غير مسجل'),
    creator_role: (row.creator_role as UserRole) || null,
  };
}

export const bookingsService = {
  /**
   * Fetch current user's profile and role from public.warzone_user_roles
   */
  async getCurrentUserProfile(): Promise<UserProfile> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { id: '', email: '', full_name: '', role: 'unassigned', is_active: false };
    }

    const { data, error } = await supabase
      .from('warzone_user_roles')
      .select('full_name, role, email, is_active, created_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) {
      return {
        id: user.id,
        email: user.email || '',
        full_name: (user.user_metadata?.full_name as string) || '',
        role: 'unassigned',
        is_active: false
      };
    }

    return {
      id: user.id,
      email: data.email || user.email || '',
      full_name: data.full_name || (user.user_metadata?.full_name as string) || '',
      role: (data.role as UserRole) || 'unassigned',
      is_active: data.is_active ?? true,
      created_at: data.created_at || user.created_at
    };
  },

  /**
   * Fetch current user's role from public.warzone_user_roles
   */
  async getCurrentUserRole(): Promise<UserRole> {
    const profile = await this.getCurrentUserProfile();
    return profile.role;
  },

  /**
   * Fetch all War Zone bookings from public.warzone_bookings_feed sorted by date and time
   */
  async getBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('warzone_bookings_feed')
      .select('*')
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true });

    if (error) {
      console.error('Error fetching War Zone bookings:', error);
      if (error.code === '42501' || error.message.includes('permission denied')) {
        throw new Error('ليس لديك صلاحية لعرض الحجوزات. يرجى التواصل مع المسؤول.');
      }
      throw new Error(`فشل تحميل الحجوزات: ${error.message}`);
    }

    return (data || []).map(normalizeBooking);
  },

  /**
   * Fetch a single booking by ID
   */
  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('warzone_bookings_feed')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching booking ${id}:`, error);
      throw new Error(`فشل تحميل تفاصيل الحجز: ${error.message}`);
    }

    return data ? normalizeBooking(data) : null;
  },

  /**
   * Create a new War Zone booking in public.warzone_bookings
   */
  async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> {
    const numberOfPeople = Math.max(1, Math.floor(Number(booking.number_of_people) || 1));
    const rawCategory = booking.category || 'عميل جديد';
    const category: BookingCategory = WARZONE_CATEGORIES.includes(rawCategory as BookingCategory)
      ? (rawCategory as BookingCategory)
      : 'عميل جديد';

    const rawStatus = (booking.status || 'pending').toLowerCase();
    const status: BookingDbStatus = (STATUS_DB_MAP[rawStatus] || 'pending') as BookingDbStatus;

    if (!booking.customer_name || !booking.customer_name.trim()) {
      throw new Error('اسم العميل مطلوب');
    }

    if (!booking.phone || !booking.phone.trim()) {
      throw new Error('رقم الهاتف مطلوب');
    }

    if (!booking.booking_date) {
      throw new Error('تاريخ الحجز مطلوب');
    }

    if (!booking.booking_time) {
      throw new Error('وقت الحجز مطلوب');
    }

    const insertData: WarzoneBookingInsert = {
      customer_name: booking.customer_name.trim(),
      phone: booking.phone.trim(),
      number_of_people: numberOfPeople,
      category: category,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      status: status,
      notes: booking.notes ? booking.notes.trim() : null,
    };

    const { data, error } = await supabase
      .from('warzone_bookings')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating War Zone booking:', error);
      if (error.code === '42501') {
        throw new Error('ليس لديك صلاحية لإنشاء حجز جديد');
      }
      throw new Error(`فشل إنشاء الحجز: ${error.message}`);
    }

    if (data?.id) {
      const refreshed = await this.getBookingById(data.id);
      if (refreshed) return refreshed;
    }

    return normalizeBooking(data);
  },

  /**
   * Update an existing booking
   */
  async updateBooking(
    id: string, 
    bookingData: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Booking> {
    const updateData: WarzoneBookingUpdate = {
      updated_at: new Date().toISOString()
    };

    if (bookingData.customer_name !== undefined) {
      updateData.customer_name = bookingData.customer_name.trim();
    }

    if (bookingData.phone !== undefined) {
      updateData.phone = bookingData.phone.trim();
    }

    if (bookingData.number_of_people !== undefined) {
      updateData.number_of_people = Math.max(1, Math.floor(Number(bookingData.number_of_people) || 1));
    }

    if (bookingData.category !== undefined) {
      const cat = bookingData.category;
      updateData.category = WARZONE_CATEGORIES.includes(cat as BookingCategory) ? cat : 'عميل جديد';
    }

    if (bookingData.booking_date !== undefined) {
      updateData.booking_date = bookingData.booking_date;
    }

    if (bookingData.booking_time !== undefined) {
      updateData.booking_time = bookingData.booking_time;
    }

    if (bookingData.status !== undefined) {
      const rawStatus = (bookingData.status || 'pending').toLowerCase();
      updateData.status = (STATUS_DB_MAP[rawStatus] || 'pending') as BookingDbStatus;
    }

    if (bookingData.notes !== undefined) {
      updateData.notes = bookingData.notes ? bookingData.notes.trim() : null;
    }

    const { data, error } = await supabase
      .from('warzone_bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating booking ${id}:`, error);
      if (error.code === '42501') {
        throw new Error('ليس لديك الصلاحية المطلوبة لتحديث هذا الحجز');
      }
      throw new Error(`فشل تحديث الحجز: ${error.message}`);
    }

    if (data?.id) {
      const refreshed = await this.getBookingById(data.id);
      if (refreshed) return refreshed;
    }

    return normalizeBooking(data);
  },

  /**
   * Reschedule booking time & date (preserves existing status unless specified)
   */
  async rescheduleBooking(id: string, date: string, time: string, status?: BookingDbStatus): Promise<Booking> {
    const payload: Partial<Booking> = {
      booking_date: date,
      booking_time: time,
    };
    if (status) {
      payload.status = status;
    }
    return this.updateBooking(id, payload);
  },

  /**
   * Confirm booking
   */
  async confirmBooking(id: string): Promise<Booking> {
    return this.updateBooking(id, {
      status: 'confirmed',
    });
  },

  /**
   * Complete booking
   */
  async completeBooking(id: string): Promise<Booking> {
    return this.updateBooking(id, {
      status: 'completed',
    });
  },

  /**
   * Cancel booking
   */
  async cancelBooking(id: string): Promise<Booking> {
    return this.updateBooking(id, {
      status: 'cancelled',
    });
  },

  /**
   * Permanently delete booking from database (Admin & Manager only)
   */
  async deleteBooking(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('warzone_bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting booking ${id}:`, error);
      if (error.code === '42501') {
        throw new Error('عفواً، لا يملك الموظف صلاحية الحذف النهائي للحجوزات. تقتصر هذه الصلاحية على المسؤولين.');
      }
      throw new Error(`فشل حذف الحجز: ${error.message}`);
    }

    return true;
  }
};

export default bookingsService;
