
-- 1) Restrict tenants_select to the user's own tenant
DROP POLICY IF EXISTS tenants_select ON public.tenants;
CREATE POLICY tenants_select ON public.tenants
  FOR SELECT TO authenticated
  USING (id = neo.my_tenant_id());

-- 2) Convert public views to security_invoker so RLS of querying user applies
ALTER VIEW public.neo_profiles SET (security_invoker = true);
ALTER VIEW public.neo_analyses SET (security_invoker = true);
ALTER VIEW public.neo_conversations SET (security_invoker = true);
ALTER VIEW public.neo_conversation_messages SET (security_invoker = true);
ALTER VIEW public.neo_plan_limits SET (security_invoker = true);

-- 3) Pin search_path on remaining functions
ALTER FUNCTION neo.set_updated_at() SET search_path = neo, public;
ALTER FUNCTION neo.increment_message_count() SET search_path = neo, public;
