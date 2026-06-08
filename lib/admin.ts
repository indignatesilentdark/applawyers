import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { requirePortalUser } from "@/lib/portal-auth";

function getAdminEmailSet() {
  return new Set(
    (env.adminEmails ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return getAdminEmailSet().has(email.trim().toLowerCase());
}

export async function requireAdminUser() {
  const context = await requirePortalUser();

  if (!isAdminEmail(context.user.email)) {
    redirect("/dashboard");
  }

  return context;
}
