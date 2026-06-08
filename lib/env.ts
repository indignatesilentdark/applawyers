export const env = {
  adminEmails: process.env.ADMIN_EMAILS,
  appUrl:
    process.env.APP_URL ??
    process.env.APP_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL,
  appBaseUrl:
    process.env.APP_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL,
  authOtpSecret: process.env.AUTH_OTP_SECRET,
  bscScanApiKey: process.env.BSCSCAN_API_KEY,
  emailFrom:
    process.env.EMAIL_FROM ??
    "ApproveLawyers <no-reply@approvelawyers.com>",
  etherscanApiKey: process.env.ETHERSCAN_API_KEY,
  funnelUrl: process.env.FUNNEL_URL,
  humanReviewEmail: process.env.HUMAN_REVIEW_EMAIL,
  openAIKey: process.env.OPENAI_API_KEY,
  openAIModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  polygonScanApiKey: process.env.POLYGONSCAN_API_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  resendTemplateId: process.env.RESEND_TEMPLATE_ID,
  searchApiKey: process.env.SEARCH_API_KEY,
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  whoisXmlApiKey: process.env.WHOISXML_API_KEY,
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
