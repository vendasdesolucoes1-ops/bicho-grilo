// NEO Quant Lab — Supabase client
// Project: gseindfuqkumktbobyny (maversclaudio@gmail.com's Project)
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://qfzgjgkdbblysdslensu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmemdqZ2tkYmJseXNkc2xlbnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0Nzg5NDEsImV4cCI6MjA5NjA1NDk0MX0.hFxKypGu_6fSg-UcljCMu6gST1dFi1Z2ttDxLp_Lans";

const CLIENT_OPTIONS = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "neo_quant_lab_auth",
  },
  db: {
    schema: "public",
  },
  global: {
    headers: { "x-application": "neo-quant-lab" },
  },
} as const;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
// For neo_* tables use: import { neoDb } from "@/integrations/supabase/client";

// Typed client for existing CRM tables
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, CLIENT_OPTIONS);

// Untyped alias for neo_* tables (types not yet in generated schema).
// Keep a single GoTrue client instance so auth/session events remain consistent.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const neoDb = supabase as unknown as ReturnType<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof createClient<any>
>;