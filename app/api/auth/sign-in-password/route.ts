import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  getSessionExpiryDate,
  PORTAL_SESSION_COOKIE,
} from "@/lib/portal-auth";
import {
  generateSessionToken,
  hashSessionToken,
  normalizeEmail,
  verifyPasswordHash,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const normalizedEmail = normalizeEmail(email ?? "");
    const normalizedPassword = `${password ?? ""}`;

    if (!normalizedEmail || !normalizedPassword) {
      return NextResponse.json(
        { error: "Ingresa correo y contraseña." },
        { status: 400 },
      );
    }

    const admin = createAdminSupabaseClient();
    const { data: user } = await admin
      .from("portal_users")
      .select("id, email, password_hash")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (!user?.password_hash || !verifyPasswordHash(normalizedPassword, user.password_hash)) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos." },
        { status: 401 },
      );
    }

    const sessionToken = generateSessionToken();
    const expiryDate = getSessionExpiryDate();

    const { error: sessionError } = await admin.from("private_sessions").insert({
      expires_at: expiryDate.toISOString(),
      token_hash: hashSessionToken(sessionToken),
      user_id: user.id,
    });

    if (sessionError) {
      throw sessionError;
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    const response = NextResponse.json({
      ok: true,
      nextPath: profile ? "/dashboard" : "/onboarding",
    });

    response.cookies.set(PORTAL_SESSION_COOKIE, sessionToken, {
      expires: expiryDate,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No pudimos iniciar sesión." },
      { status: 500 },
    );
  }
}
