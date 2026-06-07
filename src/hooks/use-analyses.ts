/**
 * useAnalyses — TanStack Query hooks for saved analyses
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { neoDb as supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { PLAN_LIMITS } from "@/hooks/use-plan-limits";

const QUERY_KEY = "neo-analyses";

export interface Analysis {
  id: string;
  user_id: string;
  title: string;
  filters: Record<string, unknown>;
  results: Record<string, unknown>;
  draws_count: number | null;
  audit_score: number | null;
  is_pinned: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ─── List analyses ─────────────────────────────────────────────────────────

export function useAnalyses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neo_analyses")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as Analysis[];
    },
    staleTime: 30_000,
  });
}

// ─── Save analysis ─────────────────────────────────────────────────────────

interface SaveAnalysisInput {
  title: string;
  filters: Record<string, unknown>;
  results: Record<string, unknown>;
  draws_count?: number;
  audit_score?: number;
  tags?: string[];
}

export function useSaveAnalysis() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveAnalysisInput) => {
      if (!user) throw new Error("Usuário não autenticado");

      // N-02: enforce max_analyses before INSERT — frontend-only checks can be bypassed.
      const limits = PLAN_LIMITS[(profile?.plan ?? "free") as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;
      if (limits.max_analyses >= 0) {
        const { count } = await supabase
          .from("neo_analyses")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if ((count ?? 0) >= limits.max_analyses) {
          throw new Error(`Limite de ${limits.max_analyses} análises do plano ${profile?.plan ?? "free"} atingido. Faça upgrade para salvar mais.`);
        }
      }

      const { data, error } = await supabase
        .from("neo_analyses")
        .insert({
          user_id: user.id,
          title: input.title,
          filters: input.filters,
          results: input.results,
          draws_count: input.draws_count ?? null,
          audit_score: input.audit_score ?? null,
          tags: input.tags ?? [],
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Analysis;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ─── Toggle pin ────────────────────────────────────────────────────────────

export function usePinAnalysis() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_pinned }: { id: string; is_pinned: boolean }) => {
      const { error } = await supabase
        .from("neo_analyses")
        .update({ is_pinned })
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ─── Delete analysis ───────────────────────────────────────────────────────

export function useDeleteAnalysis() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("neo_analyses")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
