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
import type { MyProfile, PlanLimits } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Supabase Auth user object — null when logged out */
  user: User | null;
  /** Full profile + tenant data from RPC neo.get_my_profile() */
  profile: MyProfile | null;
  /** Flattened plan limits from RPC neo.get_my_plan_limits() */
  planLimits: PlanLimits | null;
  /** True while session is being initialised or profile is loading */
  isLoading: boolean;
  /** True once the initial auth check is complete (regardless of logged-in state) */
  isReady: boolean;
  /** Sign in with email + password */
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Register new account — auto-creates tenant + profile via DB trigger */
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ error: string | null }>;
  /** Sign out and clear all local state */
  signOut: () => Promise<void>;
  /** Force refresh profile (e.g. after plan upgrade) */
  refreshProfile: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // ── Load profile + plan limits ─────────────────────────────────────────────
  const loadProfile = useCallback(async (userId: string) => {
    try {
      // Parallel fetch: profile + plan limits
      const [profileRes, limitsRes] = await Promise.all([
        supabase.schema("neo").rpc("get_my_profile"),
        supabase.schema("neo").rpc("get_my_plan_limits"),
      ]);

      if (profileRes.data && profileRes.data.length > 0) {
        setProfile(profileRes.data[0] as MyProfile);
      } else {
        // Profile not yet created (trigger may still be running) — retry once
        await new Promise((r) => setTimeout(r, 800));
        const retry = await supabase.schema("neo").rpc("get_my_profile");
        if (retry.data && retry.data.length > 0) {
          setProfile(retry.data[0] as MyProfile);
        }
      }

      if (limitsRes.data) {
        setPlanLimits(limitsRes.data as unknown as PlanLimits);
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

    // Get current session synchronously (avoids flash)
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

    // Subscribe to subsequent auth changes (login, logout, token refresh)
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
          setPlanLimits(null);
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
      const { error } = await supabase.auth.signUp({
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
      return { error: null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPlanLimits(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    await loadProfile(user.id);
  }, [user, loadProfile]);

  // ── Value ──────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        planLimits,
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
