import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, hasPublicSupabaseEnv } from "@/lib/env";

export async function createServerSupabaseClient() {
  if (!hasPublicSupabaseEnv) {
    throw new Error("Missing Supabase public environment variables.");
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Route handlers and proxy own cookie writes when needed.
        }
      },
    },
  });
}
