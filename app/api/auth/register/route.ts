import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  getSessionExpiryDate,
  PORTAL_SESSION_COOKIE,
} from "@/lib/portal-auth";
import {
  generateSessionToken,
  hashPassword,
  hashSessionToken,
  normalizeEmail,
} from "@/lib/security";

function getPasswordError(password: string, confirmPassword: string) {
  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "La contraseña debe incluir letras y números.";
  }

  if (password !== confirmPassword) {
    return "La confirmación de contraseña no coincide.";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      country?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      phone?: string;
      phoneCountry?: string;
    };

    const email = normalizeEmail(body.email ?? "");
    const password = `${body.password ?? ""}`;
    const confirmPassword = `${body.confirmPassword ?? ""}`;
    const country = `${body.country ?? ""}`.trim();
    const phone = `${body.phone ?? ""}`.trim();
    const phoneCountry = `${body.phoneCountry ?? ""}`.trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Ingresa un correo válido." }, { status: 400 });
    }

    if (!country || !phone) {
      return NextResponse.json(
        { error: "Completa país y teléfono para crear tu cuenta." },
        { status: 400 },
      );
    }

    const passwordError = getPasswordError(password, confirmPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();
    const { data: existingUser } = await admin
      .from("portal_users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Ese correo ya tiene acceso registrado. Ingresa desde /login o usa el código seguro.",
        },
        { status: 409 },
      );
    }

    const { data: createdUser, error: userError } = await admin
      .from("portal_users")
      .insert({
        email,
        password_hash: hashPassword(password),
      })
      .select("id, email, created_at")
      .single();

    if (userError || !createdUser) {
      throw userError ?? new Error("No pudimos crear la cuenta.");
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: createdUser.id,
      email,
      country,
      phone,
      phone_country: phoneCountry || phone.split(/\s+/)[0] || null,
      first_name: null,
      last_name: null,
      full_name: null,
    });

    if (profileError) {
      throw profileError;
    }

    const sessionToken = generateSessionToken();
    const expiryDate = getSessionExpiryDate();

    const { error: sessionError } = await admin.from("private_sessions").insert({
      expires_at: expiryDate.toISOString(),
      token_hash: hashSessionToken(sessionToken),
      user_id: createdUser.id,
    });

    if (sessionError) {
      throw sessionError;
    }

    const response = NextResponse.json({ ok: true, nextPath: "/dashboard" });
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
      { error: "No pudimos completar tu registro." },
      { status: 500 },
    );
  }
}
