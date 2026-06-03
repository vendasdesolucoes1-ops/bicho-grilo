import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { PlanLimits } from "@/types/database";

export function usePlanLimits() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["neo-plan-limits", profile?.tenant_id],
    enabled: !!profile?.tenant_id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_my_plan_limits");
      
      if (error) {
        console.error("Error fetching plan limits:", error);
        throw new Error(error.message);
      }
      
      return data[0] as PlanLimits;
    },
    staleTime: 60_000,
  });
}
