"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env, hasPublicSupabaseEnv } from "@/lib/env";

let browserClient: SupabaseClient | null = null;

export function createBrowserSupabaseClient() {
  if (!hasPublicSupabaseEnv) {
    throw new Error("Missing Supabase public environment variables.");
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      env.supabaseUrl!,
      env.supabaseAnonKey!,
    );
  }

  return browserClient;
}
