import { supabase } from '../lib/supabase';
import type { Booking } from '../types/booking';
import type { Database } from '../types/database';

export const bookingsService = {
  /**
   * Fetch all bookings sorted by date and time slot
   */
  async getBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: true })
      .order('time_slot', { ascending: true });

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    return (data || []) as Booking[];
  },

  /**
   * Fetch a single booking by ID
   */
  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching booking ${id}:`, error);
      return null;
    }

    return data as Booking;
  },

  /**
   * Create a new CRM booking
   */
  async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> {
    const insertData: Database['public']['Tables']['bookings']['Insert'] = {
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      customer_source: booking.customer_source,
      customer_type: booking.customer_type,
      vehicle_make: booking.vehicle_make,
      vehicle_model: booking.vehicle_model,
      vehicle_year: booking.vehicle_year || null,
      service_type: booking.service_type,
      branch_name: booking.branch_name || 'فرع الرياض - حي المروج',
      booking_date: booking.booking_date,
      time_slot: booking.time_slot,
      status: booking.status || 'جديد',
      notes: booking.notes || null,
      last_contact_date: booking.last_contact_date || null,
      next_followup_date: booking.next_followup_date || null
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    return data as Booking;
  },

  /**
   * Update an existing booking
   */
  async updateBooking(
    id: string, 
    bookingData: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Booking | null> {
    const updateData: Database['public']['Tables']['bookings']['Update'] = {
      ...bookingData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating booking ${id}:`, error);
      throw error;
    }

    return data as Booking;
  },

  /**
   * Confirm/Reschedule booking time
   */
  async rescheduleBooking(id: string, date: string, timeSlot: string): Promise<Booking | null> {
    return this.updateBooking(id, {
      booking_date: date,
      time_slot: timeSlot,
      status: 'تم التأكيد'
    });
  },

  /**
   * Confirm/Complete a booking
   */
  async confirmBooking(id: string): Promise<Booking | null> {
    return this.updateBooking(id, {
      status: 'تم التأكيد',
      last_contact_date: new Date().toISOString()
    });
  },

  /**
   * Complete a booking
   */
  async completeBooking(id: string): Promise<Booking | null> {
    return this.updateBooking(id, {
      status: 'مكتمل'
    });
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string): Promise<Booking | null> {
    return this.updateBooking(id, {
      status: 'ملغي'
    });
  },

  /**
   * Delete a booking from DB
   */
  async deleteBooking(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting booking ${id}:`, error);
      return false;
    }

    return true;
  },

  /**
   * Calculate CRM dashboard analytics and marketing conversions
   */
  async getDashboardStats() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*');

    if (error) {
      console.error('Error fetching statistics:', error);
      return {
        total: 0,
        today: 0,
        upcoming: 0,
        new: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        clientTypes: { newCount: 0, returningCount: 0, vipCount: 0, referredCount: 0 },
        marketingSources: {} as Record<string, number>,
        topSource: 'لا يوجد',
        conversionRate: 0
      };
    }

    const bookingsList = (data || []) as Booking[];
    const todayStr = new Date().toISOString().split('T')[0];

    // Status counts
    const total = bookingsList.length;
    const newCount = bookingsList.filter(b => b.status === 'جديد').length;
    const confirmedCount = bookingsList.filter(b => b.status === 'تم التأكيد').length;
    const completedCount = bookingsList.filter(b => b.status === 'مكتمل').length;
    const cancelledCount = bookingsList.filter(b => b.status === 'ملغي').length;
    
    // Date schedules
    const todayCount = bookingsList.filter(b => b.booking_date === todayStr).length;
    const upcomingCount = bookingsList.filter(b => b.booking_date > todayStr && b.status !== 'ملغي').length;

    // Customer types metrics
    const clientTypes = {
      newCount: bookingsList.filter(b => b.customer_type === 'new').length,
      returningCount: bookingsList.filter(b => b.customer_type === 'returning').length,
      vipCount: bookingsList.filter(b => b.customer_type === 'vip').length,
      referredCount: bookingsList.filter(b => b.customer_type === 'referred').length
    };

    // Marketing channel distribution
    const marketingSources = bookingsList.reduce((acc, b) => {
      const source = b.customer_source || 'أخرى';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find top channel
    let topSource = 'لا يوجد';
    let maxCount = 0;
    Object.entries(marketingSources).forEach(([source, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topSource = source;
      }
    });

    // Conversion rate: (completed + confirmed bookings) / total bookings
    const successfulCount = completedCount + confirmedCount;
    const conversionRate = total > 0 ? Math.round((successfulCount / total) * 100) : 0;

    return {
      total,
      today: todayCount,
      upcoming: upcomingCount,
      new: newCount,
      confirmed: confirmedCount,
      completed: completedCount,
      cancelled: cancelledCount,
      clientTypes,
      marketingSources,
      topSource,
      conversionRate
    };
  }
};
export default bookingsService;
