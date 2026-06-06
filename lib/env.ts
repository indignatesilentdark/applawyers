export const env = {
  openAIKey: process.env.OPENAI_API_KEY,
  openAIModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
};

export const hasPublicSupabaseEnv = Boolean(
  env.supabaseUrl && env.supabaseAnonKey,
);

export const hasServiceRoleEnv = Boolean(
  env.supabaseUrl && env.supabaseServiceRoleKey,
);

export const hasOpenAIEnv = Boolean(env.openAIKey);
