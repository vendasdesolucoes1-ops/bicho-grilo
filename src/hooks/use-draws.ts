import { useQuery } from "@tanstack/react-query";
import { DrawsRepository, type DrawRecord } from "@/lib/repositories/draws.repository";
import { computeGroupStats, type GroupStat } from "@/lib/lottery-data";

export function useDraws(limit = 2000) {
  return useQuery({
    queryKey: ["neo-draws", limit],
    queryFn: () => DrawsRepository.getDraws(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * P-01: total draws available, so the UI can warn the user when the loaded
 * sample (capped at `limit`) is smaller than the full historical dataset.
 */
export function useDrawsCount() {
  return useQuery({
    queryKey: ["neo-draws-count"],
    queryFn: () => DrawsRepository.getDrawsCount(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

/**
 * Returns whether the loaded sample is truncated relative to the full dataset,
 * along with the loaded/total counts for a "Analisando X de Y draws" message.
 */
export function useDrawsCompleteness(limit = 2000) {
  const { data: draws } = useDraws(limit);
  const { data: total } = useDrawsCount();

  const loaded = draws?.length ?? 0;
  const isTruncated = total !== undefined && loaded >= limit && total > loaded;

  return { loaded, total: total ?? loaded, isTruncated };
}

/**
 * Hook to get group stats derived from the current historical draws.
 */
export function useStatistics(limit = 2000) {
  const { data: draws, isLoading, error } = useDraws(limit);

  // Derive stats if data is loaded
  const stats: GroupStat[] = draws ? computeGroupStats(draws.map(d => ({
    id: d.id,
    date: d.draw_date,
    group: d.group,
    state: d.state,
    lottery: d.lottery,
    extraction: d.extraction,
  }))) : [];

  return {
    stats,
    isLoading,
    error,
  };
}
