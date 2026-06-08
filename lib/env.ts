export const env = {
  authOtpSecret: process.env.AUTH_OTP_SECRET,
  emailFrom:
    process.env.EMAIL_FROM ??
    "ApproveLawyers <no-reply@approvelawyers.com>",
  openAIKey: process.env.OPENAI_API_KEY,
  openAIModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  resendApiKey: process.env.RESEND_API_KEY,
  resendTemplateId: process.env.RESEND_TEMPLATE_ID,
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

export const hasResendEnv = Boolean(env.resendApiKey);

export const hasPortalAuthEnv = Boolean(
  env.supabaseUrl &&
    env.supabaseServiceRoleKey &&
    env.resendApiKey &&
    env.authOtpSecret,
);
