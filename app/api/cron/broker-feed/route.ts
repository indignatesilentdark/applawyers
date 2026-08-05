import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { syncWikiFxFeed } from "@/lib/broker-feed";
import { env } from "@/lib/env";
import { getPortalSession } from "@/lib/portal-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

async function runSync() {
  const admin = createAdminSupabaseClient();
  const result = await syncWikiFxFeed(admin);
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!env.cronSecret || authHeader !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await runSync();
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No pudimos sincronizar el feed externo." },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const context = await getPortalSession();
    if (!context || !isAdminEmail(context.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return await runSync();
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No pudimos sincronizar el feed externo." },
      { status: 500 },
    );
  }
}
