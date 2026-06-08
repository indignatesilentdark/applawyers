import { createAdminSupabaseClient } from "@/lib/supabase/admin";
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

function buildLeadTransferPayload(
  lead: LeadRow,
  transferToken: LeadTransferTokenRow,
): LeadTransferPayload {
  const firstName = lead.first_name?.trim() ?? "";
  const lastName = lead.last_name?.trim() ?? "";
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
    source: lead.source,
    timeframe: lead.timeframe,
    token: transferToken.token,
  };
}

export async function getValidatedLeadTransfer(
  leadId: string,
  token: string,
  admin = createAdminSupabaseClient(),
) {
  const normalizedLeadId = leadId.trim();
  const normalizedToken = token.trim();

  if (!normalizedLeadId || !normalizedToken) {
    throw new Error("No pudimos validar tu solicitud.");
  }

  const [{ data: lead, error: leadError }, { data: transferToken, error: tokenError }] =
    await Promise.all([
      admin.from("leads").select("*").eq("id", normalizedLeadId).maybeSingle<LeadRow>(),
      admin
        .from("lead_transfer_tokens")
        .select("*")
        .eq("token", normalizedToken)
        .eq("lead_id", normalizedLeadId)
        .maybeSingle<LeadTransferTokenRow>(),
    ]);

  if (leadError || tokenError || !lead || !transferToken) {
    throw new Error("No pudimos validar tu solicitud.");
  }

  if (transferToken.used_at) {
    throw new Error("Este enlace de registro ya fue utilizado.");
  }

  if (new Date(transferToken.expires_at).getTime() <= Date.now()) {
    throw new Error("Este enlace de registro ya expiró.");
  }

  return buildLeadTransferPayload(lead, transferToken);
}
