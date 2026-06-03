/**
 * useAnalyses — TanStack Query hooks for saved analyses
 * All operations are tenant-scoped via RLS (no manual filtering needed).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import type { Analysis, AnalysisFilters, AnalysisResults } from "@/types/database";

const QUERY_KEY = "neo-analyses";

// ─── List analyses ─────────────────────────────────────────────────────────

export function useAnalyses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("neo")
        .from("analyses")
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
  filters: AnalysisFilters;
  results: AnalysisResults;
  draws_count?: number;
  audit_score?: number;
  tags?: string[];
}

export function useSaveAnalysis() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveAnalysisInput) => {
      if (!user || !profile) throw new Error("Usuário não autenticado");

      // Check quota before inserting
      const { data: hasQuota } = await supabase
        .schema("neo")
        .rpc("check_analysis_quota");

      if (hasQuota === false) {
        throw new Error(
          "Limite de análises do plano atingido. Faça upgrade para salvar mais.",
        );
      }

      const { data, error } = await supabase
        .schema("neo")
        .from("analyses")
        .insert({
          tenant_id: profile.tenant_id,
          user_id: user.id,
          title: input.title,
          filters: input.filters as unknown as Record<string, unknown>,
          results: input.results as unknown as Record<string, unknown>,
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
        .schema("neo")
        .from("analyses")
        .update({ is_pinned })
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ─── Delete analysis ────────────────────────────────────────────────────────

export function useDeleteAnalysis() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .schema("neo")
        .from("analyses")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
