import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  if (!hasPublicSupabaseEnv) {
    return NextResponse.redirect(
      new URL(
        "/?message=Configura%20Supabase%20para%20habilitar%20el%20callback.",
        requestUrl.origin,
      ),
    );
  }

  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const nextPath = requestUrl.searchParams.get("next") ?? "/dashboard";

  const supabase = await createServerSupabaseClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (tokenHash && type) {
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(
        "/?error=callback&message=No%20pudimos%20validar%20el%20enlace%20seguro.",
        requestUrl.origin,
      ),
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.redirect(
    new URL(profile ? nextPath : "/onboarding", requestUrl.origin),
  );
}
