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
    PostgrestVersion: "14.5"
  }
  neo: {
    Tables: {
      analyses: {
        Row: {
          audit_score: number | null
          created_at: string
          draws_count: number | null
          filters: Json
          id: string
          is_pinned: boolean
          results: Json
          tags: string[] | null
          tenant_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audit_score?: number | null
          created_at?: string
          draws_count?: number | null
          filters?: Json
          id?: string
          is_pinned?: boolean
          results?: Json
          tags?: string[] | null
          tenant_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audit_score?: number | null
          created_at?: string
          draws_count?: number | null
          filters?: Json
          id?: string
          is_pinned?: boolean
          results?: Json
          tags?: string[] | null
          tenant_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          analysis_id: string | null
          context_snapshot: string | null
          created_at: string
          id: string
          message_count: number
          tenant_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          context_snapshot?: string | null
          created_at?: string
          id?: string
          message_count?: number
          tenant_id: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          context_snapshot?: string | null
          created_at?: string
          id?: string
          message_count?: number
          tenant_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_limits: {
        Row: {
          can_export_csv: boolean
          can_invite_members: boolean
          can_use_ai: boolean
          max_analyses: number
          max_backtest_draws: number
          max_conversations: number
          max_monte_carlo_sims: number
          tier: Database["public"]["Enums"]["plan_tier"]
        }
        Insert: {
          can_export_csv?: boolean
          can_invite_members?: boolean
          can_use_ai?: boolean
          max_analyses: number
          max_backtest_draws: number
          max_conversations: number
          max_monte_carlo_sims: number
          tier: Database["public"]["Enums"]["plan_tier"]
        }
        Update: {
          can_export_csv?: boolean
          can_invite_members?: boolean
          can_use_ai?: boolean
          max_analyses?: number
          max_backtest_draws?: number
          max_conversations?: number
          max_monte_carlo_sims?: number
          tier?: Database["public"]["Enums"]["plan_tier"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          onboarded_at: string | null
          preferences: Json
          role: Database["public"]["Enums"]["member_role"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          onboarded_at?: string | null
          preferences?: Json
          role?: Database["public"]["Enums"]["member_role"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarded_at?: string | null
          preferences?: Json
          role?: Database["public"]["Enums"]["member_role"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "neo_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_analysis_quota: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_my_plan_limits: {
        Args: Record<PropertyKey, never>
        Returns: {
          can_export_csv: boolean
          can_invite_members: boolean
          can_use_ai: boolean
          max_analyses: number
          max_backtest_draws: number
          max_conversations: number
          max_monte_carlo_sims: number
          tier: Database["public"]["Enums"]["plan_tier"]
        }
      }
      get_my_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          profile_id: string
          tenant_id: string
          tenant_name: string
          tenant_slug: string
          plan: Database["public"]["Enums"]["plan_tier"]
          plan_expires_at: string | null
          role: Database["public"]["Enums"]["member_role"]
          display_name: string | null
          avatar_url: string | null
          preferences: Json
          onboarded_at: string | null
        }[]
      }
      mark_onboarded: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      my_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: Database["public"]["Enums"]["plan_tier"]
          plan_expires_at: string | null
          seats_limit: number
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          plan_expires_at?: string | null
          seats_limit?: number
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          plan_expires_at?: string | null
          seats_limit?: number
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
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
      member_role: "owner" | "admin" | "member"
      plan_tier: "free" | "starter" | "pro" | "elite"
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

export const Constants = {
  public: {
    Enums: {
      member_role: ["owner", "admin", "member"] as const,
      plan_tier: ["free", "starter", "pro", "elite"] as const,
    },
  },
} as const
