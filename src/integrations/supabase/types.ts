export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          clinic_id: string
          created_by: string | null
          date: string
          duration: number
          id: string
          notes: string
          patient_id: string
          status: string
          time: string
          type: string
        }
        Insert: {
          clinic_id: string
          created_by?: string | null
          date?: string
          duration?: number
          id?: string
          notes?: string
          patient_id: string
          status?: string
          time?: string
          type?: string
        }
        Update: {
          clinic_id?: string
          created_by?: string | null
          date?: string
          duration?: number
          id?: string
          notes?: string
          patient_id?: string
          status?: string
          time?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_users: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          name: string
          password: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          name: string
          password: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          name?: string
          password?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "clinic_users_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          amount: number
          clinic_id: string
          created_at: string
          date: string
          debt_id: string
          id: string
          note: string | null
          recorded_by: string | null
        }
        Insert: {
          amount: number
          clinic_id: string
          created_at?: string
          date: string
          debt_id: string
          id?: string
          note?: string | null
          recorded_by?: string | null
        }
        Update: {
          amount?: number
          clinic_id?: string
          created_at?: string
          date?: string
          debt_id?: string
          id?: string
          note?: string | null
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          amount: number
          clinic_id: string
          created_at: string
          created_by: string | null
          date: string
          id: string
          is_paid: boolean
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          amount: number
          clinic_id: string
          created_at?: string
          created_by?: string | null
          date: string
          id?: string
          is_paid?: boolean
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          amount?: number
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          is_paid?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age: number | null
          allergies: string
          blood_type: string
          clinic_id: string
          country: string
          created_at: string
          created_by: string | null
          date_of_birth: string
          email: string
          id: string
          medical_history: string
          name: string
          phone: string
        }
        Insert: {
          age?: number | null
          allergies?: string
          blood_type?: string
          clinic_id: string
          country?: string
          created_at?: string
          created_by?: string | null
          date_of_birth?: string
          email?: string
          id?: string
          medical_history?: string
          name: string
          phone?: string
        }
        Update: {
          age?: number | null
          allergies?: string
          blood_type?: string
          clinic_id?: string
          country?: string
          created_at?: string
          created_by?: string | null
          date_of_birth?: string
          email?: string
          id?: string
          medical_history?: string
          name?: string
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          clinic_id: string
          date: string
          id: string
          method: string
          note: string
          patient_id: string
          recorded_by: string | null
        }
        Insert: {
          amount?: number
          clinic_id: string
          date?: string
          id?: string
          method?: string
          note?: string
          patient_id: string
          recorded_by?: string | null
        }
        Update: {
          amount?: number
          clinic_id?: string
          date?: string
          id?: string
          method?: string
          note?: string
          patient_id?: string
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
        ]
      }
      treatments: {
        Row: {
          added_by: string | null
          clinic_id: string
          cost: number
          date: string
          description: string
          id: string
          notes: string
          patient_id: string
          tooth: string | null
        }
        Insert: {
          added_by?: string | null
          clinic_id: string
          cost?: number
          date?: string
          description: string
          id?: string
          notes?: string
          patient_id: string
          tooth?: string | null
        }
        Update: {
          added_by?: string | null
          clinic_id?: string
          cost?: number
          date?: string
          description?: string
          id?: string
          notes?: string
          patient_id?: string
          tooth?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatments_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "doctor" | "receptionist" | "assistant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["doctor", "receptionist", "assistant"],
    },
  },
} as const

