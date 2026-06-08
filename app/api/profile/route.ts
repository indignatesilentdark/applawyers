import { NextResponse } from "next/server";
import { requirePortalUser } from "@/lib/portal-auth";

export async function POST(request: Request) {
  try {
    const { admin, user } = await requirePortalUser();
    const body = (await request.json()) as {
      country?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    };

    if (!body.firstName || !body.lastName || !body.country || !body.phone) {
      return NextResponse.json(
        { error: "Completa todos los campos para crear tu perfil." },
        { status: 400 },
      );
    }

    const { error } = await admin.from("profiles").upsert({
      country: body.country,
      email: user.email,
      first_name: body.firstName,
      id: user.id,
      last_name: body.lastName,
      phone: body.phone,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No pudimos guardar el perfil." },
      { status: 500 },
    );
  }
}
