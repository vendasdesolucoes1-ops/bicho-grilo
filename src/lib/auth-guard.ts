/**
 * Auth guard helpers for TanStack Router
 *
 * Usage in route definitions:
 *   export const Route = createFileRoute('/terminal')({
 *     beforeLoad: requireAuth,
 *     component: Terminal,
 *   });
 */
import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Requires the user to be authenticated.
 * Validates the session against Supabase (not just a local token check),
 * so revoked/expired sessions are rejected immediately.
 * If not authenticated, redirects to /auth preserving the intended destination.
 */
export async function requireAuth({ location }: { location: { href: string } }) {
  // SSR fallback
  if (typeof window === "undefined") {
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw redirect({
      to: "/auth",
      search: { redirect: location.href },
    });
  }
}

/**
 * Prevents authenticated users from seeing the auth page.
 * If already logged in, redirects to /terminal.
 */
export async function redirectIfAuthenticated() {
  // SSR fallback
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }

  const raw = localStorage.getItem("neo_quant_lab_auth");
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    const hasSession =
      parsed?.access_token &&
      parsed?.expires_at &&
      Date.now() / 1000 < parsed.expires_at;

    if (hasSession) {
      throw redirect({ to: "/terminal" });
    }
  } catch (e) {
    // If it's a redirect error, rethrow
    if (e && typeof e === "object" && "to" in e) throw e;
  }
}
