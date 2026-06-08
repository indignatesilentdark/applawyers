import { NextResponse } from "next/server";
import { getValidatedLeadTransfer } from "@/lib/leads";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      country?: string;
      firstName?: string;
      lastName?: string;
      leadId?: string;
      phone?: string;
      phoneCountry?: string;
      source?: string;
      token?: string;
    };

    if (
      !body.leadId ||
      !body.token ||
      !body.firstName ||
      !body.lastName ||
      !body.country ||
      !body.phone
    ) {
      return NextResponse.json(
        { error: "Completa todos los datos requeridos para continuar." },
        { status: 400 },
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id || !user.email) {
      return NextResponse.json(
        { error: "No pudimos validar tu código de verificación." },
        { status: 401 },
      );
    }

    const admin = createAdminSupabaseClient();
    const lead = await getValidatedLeadTransfer(body.leadId, body.token, admin);

    if (lead.email.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
      return NextResponse.json(
        { error: "El correo del código no coincide con el lead transferido." },
        { status: 400 },
      );
    }

    const fullName = [body.firstName.trim(), body.lastName.trim()]
      .filter(Boolean)
      .join(" ");

    const [{ error: userUpsertError }, { error: profileUpsertError }, { error: tokenUpdateError }] =
      await Promise.all([
        admin.from("portal_users").upsert({
          created_at: user.created_at ?? new Date().toISOString(),
          email: user.email,
          id: user.id,
        }),
        admin.from("profiles").upsert({
          country: body.country.trim(),
          email: user.email,
          first_name: body.firstName.trim(),
          full_name: fullName,
          id: user.id,
          last_name: body.lastName.trim(),
          lead_id: lead.leadId,
          phone: body.phone.trim(),
          phone_country: body.phoneCountry?.trim() || lead.phoneCountry,
          source: body.source?.trim() || lead.source,
        }),
        admin
          .from("lead_transfer_tokens")
          .update({
            used_at: new Date().toISOString(),
            used_by_user_id: user.id,
          })
          .eq("token", body.token.trim())
          .eq("lead_id", body.leadId.trim()),
      ]);

    if (userUpsertError || profileUpsertError || tokenUpdateError) {
      throw userUpsertError ?? profileUpsertError ?? tokenUpdateError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No pudimos completar tu registro.",
      },
      { status: 500 },
    );
  }
}
