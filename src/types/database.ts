export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string;
          name_ar: string;
          name_en: string;
          address: string | null;
          is_active: boolean;
          created_at: string;
        }
        Insert: {
          id?: string;
          name_ar: string;
          name_en: string;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
        }
        Update: {
          id?: string;
          name_ar?: string;
          name_en?: string;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string;
          name_ar: string;
          name_en: string;
          description: string | null;
          duration_minutes: number | null;
          is_active: boolean;
          created_at: string;
        }
        Insert: {
          id?: string;
          name_ar: string;
          name_en: string;
          description?: string | null;
          duration_minutes?: number | null;
          is_active?: boolean;
          created_at?: string;
        }
        Update: {
          id?: string;
          name_ar?: string;
          name_en?: string;
          description?: string | null;
          duration_minutes?: number | null;
          is_active?: boolean;
          created_at?: string;
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string;
          customer_name: string;
          customer_phone: string;
          customer_source: string | null;
          customer_type: string | null;
          vehicle_make: string;
          vehicle_model: string;
          vehicle_year: string | null;
          service_type: string;
          branch_name: string;
          booking_date: string;
          time_slot: string;
          status: 'جديد' | 'تم التواصل' | 'تم التأكيد' | 'مكتمل' | 'ملغي';
          notes: string | null;
          last_contact_date: string | null;
          next_followup_date: string | null;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          customer_name: string;
          customer_phone: string;
          customer_source?: string | null;
          customer_type?: string | null;
          vehicle_make: string;
          vehicle_model: string;
          vehicle_year?: string | null;
          service_type: string;
          branch_name?: string;
          booking_date: string;
          time_slot: string;
          status?: 'جديد' | 'تم التواصل' | 'تم التأكيد' | 'مكتمل' | 'ملغي';
          notes?: string | null;
          last_contact_date?: string | null;
          next_followup_date?: string | null;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_source?: string | null;
          customer_type?: string | null;
          vehicle_make?: string;
          vehicle_model?: string;
          vehicle_year?: string | null;
          service_type?: string;
          branch_name?: string;
          booking_date?: string;
          time_slot?: string;
          status?: 'جديد' | 'تم التواصل' | 'تم التأكيد' | 'مكتمل' | 'ملغي';
          notes?: string | null;
          last_contact_date?: string | null;
          next_followup_date?: string | null;
          created_at?: string;
          updated_at?: string;
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
