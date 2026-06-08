import { NextResponse } from "next/server";
import { sendHumanReviewRequestEmail } from "@/lib/report-delivery";
import { requirePortalUser } from "@/lib/portal-auth";
import type { StructuredReport } from "@/lib/types";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const { admin, user } = await requirePortalUser();

    const [{ data: profile }, { data: caseRow }, { data: reportRow }, { data: evidenceRows }] =
      await Promise.all([
        admin
          .from("profiles")
          .select("email, first_name, last_name, phone")
          .eq("id", user.id)
          .maybeSingle(),
        admin.from("cases").select("*").eq("id", id).eq("user_id", user.id).maybeSingle(),
        admin.from("case_reports").select("*").eq("case_id", id).eq("user_id", user.id).maybeSingle(),
        admin
          .from("case_evidence")
          .select("*")
          .eq("case_id", id)
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
      ]);

    if (!caseRow || !reportRow) {
      return NextResponse.json(
        { error: "No encontramos el dossier solicitado." },
        { status: 404 },
      );
    }

    const { error: updateError } = await admin
      .from("cases")
      .update({ status: "Revisión humana solicitada" })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    let emailSent = false;

    try {
      const result = await sendHumanReviewRequestEmail({
        caseId: id,
        caseRow,
        evidence: evidenceRows ?? [],
        profile,
        report: reportRow.report_json as StructuredReport,
      });
      emailSent = result.sent;
    } catch (error) {
      console.error("Failed to send human review email", error);
    }

    return NextResponse.json({
      emailSent,
      ok: true,
      status: "Revisión humana solicitada",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No pudimos solicitar la revisión humana." },
      { status: 500 },
    );
  }
}
