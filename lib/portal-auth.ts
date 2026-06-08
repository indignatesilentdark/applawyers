import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PortalUserRow, PrivateSessionRow } from "@/lib/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hashSessionToken } from "@/lib/security";

export const PORTAL_SESSION_COOKIE = "approvedlawyer_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

export async function getPortalSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(PORTAL_SESSION_COOKIE)?.value;

  if (!rawToken) {
    return null;
  }

  const admin = createAdminSupabaseClient();
  const tokenHash = hashSessionToken(rawToken);
  const { data: session } = await admin
    .from("private_sessions")
    .select("id, user_id, expires_at, created_at, last_seen_at, token_hash")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle<PrivateSessionRow>();

  if (!session) {
    return null;
  }

  const { data: user } = await admin
    .from("portal_users")
    .select("id, email, created_at")
    .eq("id", session.user_id)
    .maybeSingle<PortalUserRow>();

  if (!user) {
    return null;
  }

  void admin
    .from("private_sessions")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", session.id);

  return {
    admin,
    session,
    token: rawToken,
    user,
  };
}

export async function requirePortalUser() {
  const context = await getPortalSession();

  if (!context) {
    redirect("/?error=auth&message=Ingresa%20tu%20codigo%20seguro%20para%20continuar.");
  }

  return context;
}
