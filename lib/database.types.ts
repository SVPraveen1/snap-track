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
      weekly_plans: {
        Row: {
          id: string
          created_at: string
          user_id: string
          plan: Json
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          plan: Json
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          plan?: Json
        }
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