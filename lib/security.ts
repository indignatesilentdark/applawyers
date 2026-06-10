import { createHash, createHmac, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

export function hashOtpCode(email: string, code: string) {
  return sha256(
    `${normalizeEmail(email)}:${code}:${env.authOtpSecret ?? env.supabaseServiceRoleKey ?? "fallback-secret"}`,
  );
}

export function generateSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return sha256(token);
}

export function hashLeadTransferToken(token: string) {
  const secret =
    env.leadTransferSecret ?? env.supabaseServiceRoleKey ?? "fallback-lead-transfer-secret";

  return createHmac("sha256", secret).update(token.trim()).digest("hex");
}

export function maskEmail(email: string) {
  const [localPart, domain] = normalizeEmail(email).split("@");
  if (!localPart || !domain) {
    return email;
  }

  const visible = localPart.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(localPart.length - 2, 2))}@${domain}`;
}
