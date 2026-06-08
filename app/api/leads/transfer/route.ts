import { NextResponse } from "next/server";
import { getValidatedLeadTransfer } from "@/lib/leads";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("lead_id") ?? "";
    const token = searchParams.get("token") ?? "";
    const lead = await getValidatedLeadTransfer(leadId, token);

    return NextResponse.json({
      amount: lead.amount,
      country: lead.country,
      email: lead.email,
      evidence: lead.evidence,
      first_name: lead.firstName,
      full_name: lead.fullName,
      last_name: lead.lastName,
      lead_id: lead.leadId,
      phone: lead.phone,
      phone_country: lead.phoneCountry,
      situation: lead.situation,
      source: lead.source,
      timeframe: lead.timeframe,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No pudimos validar tu solicitud.",
      },
      { status: 400 },
    );
  }
}
