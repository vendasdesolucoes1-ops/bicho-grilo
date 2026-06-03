import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NeoProfile {
  id: string;
  tenant_id: string | null;
  role: "owner" | "admin" | "member";
  display_name: string | null;
  avatar_url: string | null;
  plan: "free" | "starter" | "pro" | "elite";
  tenant_name: string;
  tenant_slug: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextValue {
  /** Supabase Auth user object — null when logged out */
  user: User | null;
  /** Full profile from neo_profiles */
  profile: NeoProfile | null;
  /** True while session is being initialised or profile is loading */
  isLoading: boolean;
  /** True once the initial auth check is complete (regardless of logged-in state) */
  isReady: boolean;
  /** Sign in with email + password */
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Register new account */
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ error: string | null }>;
  /** Sign out and clear all local state */
  signOut: () => Promise<void>;
  /** Force refresh profile */
  refreshProfile: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helper: ensure neo_profile exists after sign up ─────────────────────────

async function ensureNeoProfile(userId: string, displayName?: string | null) {
  // First check if profile exists
  const { data: existing } = await supabase
    .from("neo_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!existing) {
    // Get or create a default tenant for this user
    const email = (await supabase.auth.getUser()).data.user?.email ?? "user";
    const slug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + userId.slice(0, 6);

    const { data: tenant } = await supabase
      .from("neo_tenants")
      .insert({ slug, name: displayName ?? email, plan: "free" })
      .select("id")
      .single();

    if (tenant) {
      await supabase
        .from("neo_profiles")
        .insert({
          id: userId,
          tenant_id: tenant.id,
          role: "owner",
          display_name: displayName ?? null,
        })
        .single();
    }
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<NeoProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // ── Load profile ────────────────────────────────────────────────────────────
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("neo_profiles")
        .select(`
          id, tenant_id, role, display_name, avatar_url, created_at, updated_at,
          neo_tenants ( name, slug, plan )
        `)
        .eq("id", userId)
        .maybeSingle();

      if (data) {
        const tenant = data.neo_tenants as { name: string; slug: string; plan: string } | null;
        setProfile({
          id: data.id,
          tenant_id: data.tenant_id,
          role: data.role as NeoProfile["role"],
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          plan: (tenant?.plan ?? "free") as NeoProfile["plan"],
          tenant_name: tenant?.name ?? "NEO Quant Lab",
          tenant_slug: tenant?.slug ?? "",
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      } else {
        // Profile doesn't exist yet — try to create it (may be new user)
        await ensureNeoProfile(userId);
        // Try loading once more
        const { data: retry } = await supabase
          .from("neo_profiles")
          .select(`
            id, tenant_id, role, display_name, avatar_url, created_at, updated_at,
            neo_tenants ( name, slug, plan )
          `)
          .eq("id", userId)
          .maybeSingle();

        if (retry) {
          const tenant = retry.neo_tenants as { name: string; slug: string; plan: string } | null;
          setProfile({
            id: retry.id,
            tenant_id: retry.tenant_id,
            role: retry.role as NeoProfile["role"],
            display_name: retry.display_name,
            avatar_url: retry.avatar_url,
            plan: (tenant?.plan ?? "free") as NeoProfile["plan"],
            tenant_name: tenant?.name ?? "NEO Quant Lab",
            tenant_slug: tenant?.slug ?? "",
            created_at: retry.created_at,
            updated_at: retry.updated_at,
          });
        }
      }
    } catch (err) {
      console.error("[AuthContext] loadProfile error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Bootstrap: subscribe to auth state changes ─────────────────────────────
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadProfile(u.id).finally(() => {
          if (mounted) setIsReady(true);
        });
      } else {
        setIsLoading(false);
        setIsReady(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        const u = session?.user ?? null;
        setUser(u);

        if (u && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
          setIsLoading(true);
          await loadProfile(u.id);
        } else if (event === "SIGNED_OUT") {
          setProfile(null);
          setIsLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }
      return { error: null };
    },
    [],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
    ): Promise<{ error: string | null }> => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });
      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }
      // If email confirmation is disabled, create profile immediately
      if (data.user) {
        await ensureNeoProfile(data.user.id, displayName);
      }
      return { error: null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    await loadProfile(user.id);
  }, [user, loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isReady,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
