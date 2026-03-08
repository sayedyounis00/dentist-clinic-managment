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
          created_at: string
          id: string
          name: string
          password: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          password: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          password?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      patients: {
        Row: {
          allergies: string
          blood_type: string
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
          allergies?: string
          blood_type?: string
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
          allergies?: string
          blood_type?: string
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
          date: string
          id: string
          method: string
          note: string
          patient_id: string
          recorded_by: string | null
        }
        Insert: {
          amount?: number
          date?: string
          id?: string
          method?: string
          note?: string
          patient_id: string
          recorded_by?: string | null
        }
        Update: {
          amount?: number
          date?: string
          id?: string
          method?: string
          note?: string
          patient_id?: string
          recorded_by?: string | null
        }
        Relationships: [
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
      app_role: "doctor" | "receptionist"
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
      app_role: ["doctor", "receptionist"],
    },
  },
} as const
