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

/**
 * Requires the user to be authenticated.
 * If not, redirects to /auth preserving the intended destination.
 */
export async function requireAuth({ location }: { location: { href: string } }) {
  // We read auth state from localStorage (supabase persists it there)
  const raw = localStorage.getItem("neo_quant_lab_auth");
  if (!raw) {
    throw redirect({
      to: "/auth",
      search: { redirect: location.href },
    });
  }

  try {
    const parsed = JSON.parse(raw);
    const hasSession =
      parsed?.access_token &&
      parsed?.expires_at &&
      Date.now() / 1000 < parsed.expires_at;

    if (!hasSession) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }
  } catch {
    // If parsing fails, redirect to login
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
