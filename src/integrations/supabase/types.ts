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
  public: {
    Tables: {
      tenants: {
        Row: {
          created_at: string | null
          id: string
          name: string
          plan: Database["public"]["Enums"]["plan_tier"] | null
          plan_expires_at: string | null
          seats_limit: number | null
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          plan?: Database["public"]["Enums"]["plan_tier"] | null
          plan_expires_at?: string | null
          seats_limit?: number | null
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          plan?: Database["public"]["Enums"]["plan_tier"] | null
          plan_expires_at?: string | null
          seats_limit?: number | null
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      neo_analyses: {
        Row: {
          audit_score: number | null
          created_at: string | null
          draws_count: number | null
          filters: Json | null
          id: string | null
          is_pinned: boolean | null
          results: Json | null
          tags: string[] | null
          tenant_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audit_score?: number | null
          created_at?: string | null
          draws_count?: number | null
          filters?: Json | null
          id?: string | null
          is_pinned?: boolean | null
          results?: Json | null
          tags?: string[] | null
          tenant_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audit_score?: number | null
          created_at?: string | null
          draws_count?: number | null
          filters?: Json | null
          id?: string | null
          is_pinned?: boolean | null
          results?: Json | null
          tags?: string[] | null
          tenant_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      neo_conversation_messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string | null
          id: string | null
          role: string | null
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string | null
          role?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string | null
          role?: string | null
        }
        Relationships: []
      }
      neo_conversations: {
        Row: {
          analysis_id: string | null
          context_snapshot: string | null
          created_at: string | null
          id: string | null
          message_count: number | null
          tenant_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analysis_id?: string | null
          context_snapshot?: string | null
          created_at?: string | null
          id?: string | null
          message_count?: number | null
          tenant_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_id?: string | null
          context_snapshot?: string | null
          created_at?: string | null
          id?: string | null
          message_count?: number | null
          tenant_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      neo_plan_limits: {
        Row: {
          can_export_csv: boolean | null
          can_invite_members: boolean | null
          can_use_ai: boolean | null
          max_analyses: number | null
          max_backtest_draws: number | null
          max_conversations: number | null
          max_monte_carlo_sims: number | null
          tier: Database["public"]["Enums"]["plan_tier"] | null
        }
        Insert: {
          can_export_csv?: boolean | null
          can_invite_members?: boolean | null
          can_use_ai?: boolean | null
          max_analyses?: number | null
          max_backtest_draws?: number | null
          max_conversations?: number | null
          max_monte_carlo_sims?: number | null
          tier?: Database["public"]["Enums"]["plan_tier"] | null
        }
        Update: {
          can_export_csv?: boolean | null
          can_invite_members?: boolean | null
          can_use_ai?: boolean | null
          max_analyses?: number | null
          max_backtest_draws?: number | null
          max_conversations?: number | null
          max_monte_carlo_sims?: number | null
          tier?: Database["public"]["Enums"]["plan_tier"] | null
        }
        Relationships: []
      }
      neo_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          onboarded_at: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["member_role"] | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          onboarded_at?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["member_role"] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          onboarded_at?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["member_role"] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "owner" | "admin" | "member"
      member_role: "owner" | "admin" | "member"
      plan_tier: "free" | "pro" | "enterprise"
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
      app_role: ["owner", "admin", "member"],
      member_role: ["owner", "admin", "member"],
      plan_tier: ["free", "pro", "enterprise"],
    },
  },
} as const
