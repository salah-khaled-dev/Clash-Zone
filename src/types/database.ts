
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "bookings": {
                  Row: {
                    "booking_date": string,"branch_name": string,"created_at": string | null,"customer_name": string,"customer_phone": string,"customer_source": string | null,"customer_type": string | null,"id": string,"last_contact_date": string | null,"next_followup_date": string | null,"notes": string | null,"service_type": string,"status": string,"time_slot": string,"updated_at": string | null,"vehicle_make": string,"vehicle_model": string,"vehicle_year": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "booking_date": string,"branch_name"?: string,"created_at"?: string | null,"customer_name": string,"customer_phone": string,"customer_source"?: string | null,"customer_type"?: string | null,"id"?: string,"last_contact_date"?: string | null,"next_followup_date"?: string | null,"notes"?: string | null,"service_type": string,"status"?: string,"time_slot": string,"updated_at"?: string | null,"vehicle_make": string,"vehicle_model": string,"vehicle_year"?: string | null
                  }
                  Update: {
                    "booking_date"?: string,"branch_name"?: string,"created_at"?: string | null,"customer_name"?: string,"customer_phone"?: string,"customer_source"?: string | null,"customer_type"?: string | null,"id"?: string,"last_contact_date"?: string | null,"next_followup_date"?: string | null,"notes"?: string | null,"service_type"?: string,"status"?: string,"time_slot"?: string,"updated_at"?: string | null,"vehicle_make"?: string,"vehicle_model"?: string,"vehicle_year"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"branches": {
                  Row: {
                    "address": string | null,"created_at": string | null,"id": string,"is_active": boolean | null,"name_ar": string,"name_en": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"created_at"?: string | null,"id"?: string,"is_active"?: boolean | null,"name_ar": string,"name_en": string
                  }
                  Update: {
                    "address"?: string | null,"created_at"?: string | null,"id"?: string,"is_active"?: boolean | null,"name_ar"?: string,"name_en"?: string
                  }
                  Relationships: [
                    
                  ]
                },"services": {
                  Row: {
                    "created_at": string | null,"description": string | null,"duration_minutes": number | null,"id": string,"is_active": boolean | null,"name_ar": string,"name_en": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"description"?: string | null,"duration_minutes"?: number | null,"id"?: string,"is_active"?: boolean | null,"name_ar": string,"name_en": string
                  }
                  Update: {
                    "created_at"?: string | null,"description"?: string | null,"duration_minutes"?: number | null,"id"?: string,"is_active"?: boolean | null,"name_ar"?: string,"name_en"?: string
                  }
                  Relationships: [
                    
                  ]
                },"ClashZone_bookings": {
                  Row: {
                    "booking_date": string,"booking_time": string,"category": string,"created_at": string | null,"created_by": string | null,"customer_name": string,"duration_minutes": number | null,"id": string,"notes": string | null,"number_of_people": number,"phone": string,"status": string,"updated_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "booking_date": string,"booking_time": string,"category": string,"created_at"?: string | null,"created_by"?: string | null,"customer_name": string,"duration_minutes"?: number | null,"id"?: string,"notes"?: string | null,"number_of_people": number,"phone": string,"status"?: string,"updated_at"?: string | null
                  }
                  Update: {
                    "booking_date"?: string,"booking_time"?: string,"category"?: string,"created_at"?: string | null,"created_by"?: string | null,"customer_name"?: string,"duration_minutes"?: number | null,"id"?: string,"notes"?: string | null,"number_of_people"?: number,"phone"?: string,"status"?: string,"updated_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"ClashZone_user_roles": {
                  Row: {
                    "created_at": string | null,"email": string | null,"full_name": string | null,"is_active": boolean,"role": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"email"?: string | null,"full_name"?: string | null,"is_active"?: boolean,"role"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string | null,"email"?: string | null,"full_name"?: string | null,"is_active"?: boolean,"role"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "ClashZone_bookings_feed": {
                  Row: {
                    "booking_date": string,"booking_time": string,"category": string,"created_at": string | null,"created_by": string | null,"creator_name": string | null,"creator_role": string | null,"customer_name": string,"duration_minutes": number | null,"id": string,"notes": string | null,"number_of_people": number,"phone": string,"status": string,"updated_at": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "ClashZone_current_role":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"ClashZone_get_my_role":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"ClashZone_is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"ClashZone_is_manager_or_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const
