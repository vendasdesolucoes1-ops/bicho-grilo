// NEO Quant Lab — Supabase client
// Project: gseindfuqkumktbobyny (maversclaudio@gmail.com's Project)
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://gseindfuqkumktbobyny.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzZWluZGZ1cWt1bWt0Ym9ieW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMjQ5NTQsImV4cCI6MjA5NTcwMDk1NH0.q02UR6_wl9dpPa2FL4q-vVgBzhrrrbt0iJ2HcdI1zlI";

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

// Untyped client for neo_* tables (types not yet in generated schema)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const neoDb = createClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY, CLIENT_OPTIONS);