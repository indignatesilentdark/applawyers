import { createClient } from "@supabase/supabase-js";
import { env, hasServiceRoleEnv } from "@/lib/env";

export function createAdminSupabaseClient() {
  if (!hasServiceRoleEnv) {
    throw new Error("Missing Supabase service role environment variables.");
  }

  return createClient(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
