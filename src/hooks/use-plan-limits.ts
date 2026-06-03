import { useAuth } from "@/contexts/auth-context";

// Default plan limits by tier
const PLAN_LIMITS = {
  free:    { tier: "free",    max_analyses: 5,   max_conversations: 5,   can_export_csv: false, can_use_ai: false },
  starter: { tier: "starter", max_analyses: 50,  max_conversations: 50,  can_export_csv: true,  can_use_ai: true },
  pro:     { tier: "pro",     max_analyses: 500, max_conversations: 200, can_export_csv: true,  can_use_ai: true },
  elite:   { tier: "elite",   max_analyses: -1,  max_conversations: -1,  can_export_csv: true,  can_use_ai: true },
} as const;

export function usePlanLimits() {
  const { profile } = useAuth();
  const plan = (profile?.plan ?? "free") as keyof typeof PLAN_LIMITS;
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}
