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
