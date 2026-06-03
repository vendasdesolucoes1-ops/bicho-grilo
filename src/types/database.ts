/**
 * NEO Quant Lab — Clean TypeScript interfaces
 * Derived from the Supabase `neo` schema + public.tenants
 * Use these in components — avoid importing raw Supabase types directly.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type PlanTier = "free" | "starter" | "pro" | "elite";
export type MemberRole = "owner" | "admin" | "member";

// ─── Tenant ───────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  plan: PlanTier;
  plan_expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  seats_limit: number;
  created_at: string;
  updated_at: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface Profile {
  id: string; // == auth.users.id
  tenant_id: string;
  role: MemberRole;
  display_name: string | null;
  avatar_url: string | null;
  preferences: UserPreferences;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme?: "dark" | "light";
  default_lottery?: string;
  default_state?: string;
  default_period?: string;
  notifications?: boolean;
}

// ─── Full profile (from RPC neo.get_my_profile) ───────────────────────────────

export interface MyProfile {
  profile_id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  plan: PlanTier;
  plan_expires_at: string | null;
  role: MemberRole;
  display_name: string | null;
  avatar_url: string | null;
  preferences: UserPreferences;
  onboarded_at: string | null;
}

// ─── Plan Limits ──────────────────────────────────────────────────────────────

export interface PlanLimits {
  tier: PlanTier;
  max_analyses: number;
  max_conversations: number;
  max_monte_carlo_sims: number;
  max_backtest_draws: number;
  can_export_csv: boolean;
  can_use_ai: boolean;
  can_invite_members: boolean;
}

// Plan labels for display
export const PLAN_LABELS: Record<PlanTier, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  elite: "Elite",
};

export const PLAN_COLORS: Record<PlanTier, string> = {
  free: "text-muted-foreground",
  starter: "text-electric",
  pro: "text-neon",
  elite: "text-warning",
};

// ─── Analysis ─────────────────────────────────────────────────────────────────

export interface AnalysisFilters {
  lottery: string;
  state: string;
  period: string;
  extraction: string;
}

export interface AnalysisResults {
  draws_count: number;
  audit_score: number;
  classification: "Normal" | "Atenção" | "Anômalo";
  chi: { value: number; df: number; pApprox: number };
  entropy: number;
  max_entropy: number;
  runs: { runs: number; expected: number; z: number };
  dispersion: number;
  top_groups: Array<{ group: number; animal: string; frequency: number; z_score: number }>;
}

export interface Analysis {
  id: string;
  tenant_id: string;
  user_id: string;
  title: string;
  filters: AnalysisFilters;
  results: AnalysisResults;
  draws_count: number | null;
  audit_score: number | null;
  is_pinned: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type AnalysisInsert = Omit<Analysis, "id" | "created_at" | "updated_at">;

// ─── Conversations ────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  tenant_id: string;
  user_id: string;
  analysis_id: string | null;
  title: string | null;
  context_snapshot: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// ─── Auth helpers ──────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string | undefined;
}
