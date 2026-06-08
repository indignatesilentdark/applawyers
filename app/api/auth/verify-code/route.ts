import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  getSessionExpiryDate,
  PORTAL_SESSION_COOKIE,
} from "@/lib/portal-auth";
import {
  generateSessionToken,
  hashOtpCode,
  hashSessionToken,
  normalizeEmail,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    const { code, email } = (await request.json()) as {
      code?: string;
      email?: string;
    };

    const normalizedEmail = normalizeEmail(email ?? "");
    const normalizedCode = `${code ?? ""}`.replace(/\D/g, "").slice(0, 6);

    if (!normalizedEmail || normalizedCode.length !== 6) {
      return NextResponse.json(
        { error: "Debes ingresar un correo y un código válidos." },
        { status: 400 },
      );
    }

    const admin = createAdminSupabaseClient();
    const { data: accessCode } = await admin
      .from("access_codes")
      .select("id, code_hash, expires_at")
      .eq("email", normalizedEmail)
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!accessCode) {
      return NextResponse.json(
        {
          error:
            "El código ya no es válido o expiró. Solicita uno nuevo e intenta de nuevo.",
        },
        { status: 400 },
      );
    }

    if (accessCode.code_hash !== hashOtpCode(normalizedEmail, normalizedCode)) {
      return NextResponse.json(
        { error: "El código ingresado no coincide. Revisa el correo e intenta otra vez." },
        { status: 400 },
      );
    }

    await admin
      .from("access_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", accessCode.id);

    let { data: user } = await admin
      .from("portal_users")
      .select("id, email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (!user) {
      const { data: createdUser, error: createUserError } = await admin
        .from("portal_users")
        .insert({ email: normalizedEmail })
        .select("id, email")
        .single();

      if (createUserError || !createdUser) {
        throw createUserError ?? new Error("No pudimos crear el usuario.");
      }

      user = createdUser;
    }

    const sessionToken = generateSessionToken();
    const tokenHash = hashSessionToken(sessionToken);
    const expiryDate = getSessionExpiryDate();

    const { error: sessionError } = await admin.from("private_sessions").insert({
      expires_at: expiryDate.toISOString(),
      token_hash: tokenHash,
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
      { error: "No pudimos validar el código." },
      { status: 500 },
    );
  }
}
