import { env } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hashLeadTransferToken } from "@/lib/security";
import type { LeadRow, LeadTransferTokenRow } from "@/lib/types";

export type LeadTransferPayload = {
  amount: number | null;
  country: string | null;
  email: string;
  evidence: string | null;
  firstName: string;
  fullName: string;
  lastName: string;
  leadId: string;
  phone: string | null;
  phoneCountry: string | null;
  situation: string | null;
  source: string | null;
  timeframe: string | null;
  token: string;
};

type FunnelLeadTransferResponse = {
  amount?: number | null;
  country?: string | null;
  email?: string;
  evidence?: string | null;
  first_name?: string | null;
  full_name?: string | null;
  last_name?: string | null;
  lead_id?: string;
  phone?: string | null;
  phone_country?: string | null;
  situation?: string | null;
  source?: string | null;
  timeframe?: string | null;
};

function buildLeadTransferPayload(
  lead: LeadRow,
  transferToken: LeadTransferTokenRow,
  rawToken: string,
): LeadTransferPayload {
  const normalizedFullName = lead.full_name?.trim() ?? "";
  const [derivedFirstName, ...derivedLastNameParts] = normalizedFullName.split(/\s+/).filter(Boolean);
  const firstName = lead.first_name?.trim() || derivedFirstName || "";
  const lastName = lead.last_name?.trim() || derivedLastNameParts.join(" ");
  const fullName =
    lead.full_name?.trim() || [firstName, lastName].filter(Boolean).join(" ");

  return {
    amount: lead.amount,
    country: lead.country,
    email: lead.email,
    evidence: lead.evidence,
    firstName,
    fullName,
    lastName,
    leadId: lead.id,
    phone: lead.phone,
    phoneCountry: lead.phone_country,
    situation: lead.situation,
    source: lead.source ?? transferToken.source,
    timeframe: lead.timeframe,
    token: rawToken,
  };
}

function buildLeadTransferPayloadFromFunnel(
  lead: FunnelLeadTransferResponse,
  rawToken: string,
): LeadTransferPayload {
  return {
    amount: lead.amount ?? null,
    country: lead.country ?? null,
    email: lead.email?.trim() ?? "",
    evidence: lead.evidence ?? null,
    firstName: lead.first_name?.trim() ?? "",
    fullName:
      lead.full_name?.trim() ||
      [lead.first_name?.trim(), lead.last_name?.trim()].filter(Boolean).join(" "),
    lastName: lead.last_name?.trim() ?? "",
    leadId: lead.lead_id?.trim() ?? "",
    phone: lead.phone ?? null,
    phoneCountry: lead.phone_country ?? null,
    situation: lead.situation ?? null,
    source: lead.source ?? null,
    timeframe: lead.timeframe ?? null,
    token: rawToken,
  };
}

async function fetchLeadTransferFromFunnel(leadId: string, token: string) {
  const baseUrl = env.funnelUrl?.trim().replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("No pudimos validar tu solicitud.");
  }

  const url = new URL("/api/leads/transfer", baseUrl);
  url.searchParams.set("lead_id", leadId);
  url.searchParams.set("token", token);

  const response = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const data = (await response.json().catch(() => null)) as
    | (FunnelLeadTransferResponse & { error?: string })
    | null;

  if (!response.ok || !data?.lead_id || !data?.email) {
    throw new Error(data?.error ?? "No pudimos validar tu solicitud.");
  }

  return buildLeadTransferPayloadFromFunnel(data, token);
}

export async function getValidatedLeadTransfer(
  leadId: string,
  token: string,
  admin = createAdminSupabaseClient(),
) {
  const normalizedLeadId = leadId.trim();
  const normalizedToken = token.trim();
  const tokenHash = hashLeadTransferToken(normalizedToken);

  if (!normalizedLeadId || !normalizedToken) {
    throw new Error("No pudimos validar tu solicitud.");
  }

  const [{ data: lead, error: leadError }, { data: transferToken, error: tokenError }] =
    await Promise.all([
      admin.from("leads").select("*").eq("id", normalizedLeadId).maybeSingle<LeadRow>(),
      admin
        .from("lead_transfer_tokens")
        .select("*")
        .or(
          env.leadTransferSecret
            ? `token_hash.eq.${tokenHash},token.eq.${normalizedToken}`
            : `token.eq.${normalizedToken}`,
        )
        .eq("lead_id", normalizedLeadId)
        .maybeSingle<LeadTransferTokenRow>(),
    ]);

  if (!leadError && !tokenError && lead && transferToken) {
    if (transferToken.used_at) {
      throw new Error("Este enlace de registro ya fue utilizado.");
    }

    if (new Date(transferToken.expires_at).getTime() <= Date.now()) {
      throw new Error("Este enlace de registro ya expiró.");
    }

    return buildLeadTransferPayload(lead, transferToken, normalizedToken);
  }

  if (!env.leadTransferSecret) {
    return fetchLeadTransferFromFunnel(normalizedLeadId, normalizedToken);
  }

  throw new Error("No pudimos validar tu solicitud.");
}
