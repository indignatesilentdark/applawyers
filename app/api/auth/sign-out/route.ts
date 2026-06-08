import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  PORTAL_SESSION_COOKIE,
} from "@/lib/portal-auth";
import { hashSessionToken } from "@/lib/security";

export async function POST(request: Request) {
  const admin = createAdminSupabaseClient();
  const sessionToken =
    request.headers
      .get("cookie")
      ?.split("; ")
      .find((item) => item.startsWith(`${PORTAL_SESSION_COOKIE}=`))
      ?.split("=")[1] ?? null;

  if (sessionToken) {
    await admin
      .from("private_sessions")
      .delete()
      .eq("token_hash", hashSessionToken(sessionToken));
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PORTAL_SESSION_COOKIE, "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
  return response;
}
