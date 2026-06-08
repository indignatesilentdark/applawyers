import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { env, hasPortalAuthEnv } from "@/lib/env";
import { buildOtpEmailHtml, createResendClient } from "@/lib/resend";
import { generateOtpCode, hashOtpCode, maskEmail, normalizeEmail } from "@/lib/security";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "No pudimos enviar el codigo seguro.";
}

export async function POST(request: Request) {
  try {
    if (!hasPortalAuthEnv) {
      return NextResponse.json(
        { error: "Faltan variables de entorno para enviar códigos." },
        { status: 500 },
      );
    }

    const { email } = (await request.json()) as { email?: string };
    const normalizedEmail = normalizeEmail(email ?? "");

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json(
        { error: "Ingresa un correo válido." },
        { status: 400 },
      );
    }

    const admin = createAdminSupabaseClient();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    const [
      { data: recentCode, error: recentCodeError },
      { count: recentCount, error: recentCountError },
    ] = await Promise.all([
      admin
        .from("access_codes")
        .select("id, created_at")
        .eq("email", normalizedEmail)
        .gte("created_at", oneMinuteAgo)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("access_codes")
        .select("*", { count: "exact", head: true })
        .eq("email", normalizedEmail)
        .gte("created_at", tenMinutesAgo),
    ]);

    if (recentCodeError) {
      throw recentCodeError;
    }

    if (recentCountError) {
      throw recentCountError;
    }

    if (recentCode) {
      return NextResponse.json(
        {
          error:
            "Ya enviamos un código recientemente. Espera unos segundos antes de solicitar otro.",
        },
        { status: 429 },
      );
    }

    if ((recentCount ?? 0) >= 5) {
      return NextResponse.json(
        {
          error:
            "Has alcanzado el límite temporal de solicitudes. Intenta de nuevo en unos minutos.",
        },
        { status: 429 },
      );
    }

    const code = generateOtpCode();
    const codeHash = hashOtpCode(normalizedEmail, code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: consumeExistingCodesError } = await admin
      .from("access_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("email", normalizedEmail)
      .is("consumed_at", null);

    if (consumeExistingCodesError) {
      throw consumeExistingCodesError;
    }

    const resend = createResendClient();
    const sendResult = env.resendTemplateId
      ? await resend.emails.send({
          from: env.emailFrom,
          subject: "Tu código de acceso privado | ApproveLawyers",
          to: normalizedEmail,
          template: {
            id: env.resendTemplateId,
            variables: {
              CODE: code,
            },
          },
        })
      : await resend.emails.send({
          from: env.emailFrom,
          subject: "Tu código de acceso privado | ApproveLawyers",
          to: normalizedEmail,
          html: buildOtpEmailHtml(code),
        });

    if (sendResult.error) {
      throw new Error(sendResult.error.message);
    }

    const { error: insertError } = await admin.from("access_codes").insert({
      code_hash: codeHash,
      email: normalizedEmail,
      expires_at: expiresAt,
      resend_email_id: sendResult.data?.id ?? null,
    });

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      ok: true,
      message: `Te enviamos un código seguro a ${maskEmail(normalizedEmail)}.`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
