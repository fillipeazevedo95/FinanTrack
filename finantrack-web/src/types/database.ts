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
      users: {
        Row: {
          id: string
          email: string
          name: string
          password: string
          role: string
          avatar: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          password: string
          role?: string
          avatar?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          password?: string
          role?: string
          avatar?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          type: 'INCOME' | 'EXPENSE'
          user_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          type: 'INCOME' | 'EXPENSE'
          user_id: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          type?: 'INCOME' | 'EXPENSE'
          user_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          description: string
          amount: number
          type: 'INCOME' | 'EXPENSE'
          date: string
          user_id: string
          category_id: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          type: 'INCOME' | 'EXPENSE'
          date: string
          user_id: string
          category_id: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          type?: 'INCOME' | 'EXPENSE'
          date?: string
          user_id?: string
          category_id?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      monthly_goals: {
        Row: {
          id: string
          month: number
          year: number
          income: number
          expense: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          month: number
          year: number
          income: number
          expense: number
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          month?: number
          year?: number
          income?: number
          expense?: number
          user_id?: string
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos derivados para usar na aplicação
export type User = Database['public']['Tables']['users']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type MonthlyGoal = Database['public']['Tables']['monthly_goals']['Row']

// Tipos para inserção
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type MonthlyGoalInsert = Database['public']['Tables']['monthly_goals']['Insert']

// Tipos para atualização
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']
export type MonthlyGoalUpdate = Database['public']['Tables']['monthly_goals']['Update']