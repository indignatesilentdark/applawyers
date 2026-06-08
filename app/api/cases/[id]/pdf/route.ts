import { NextResponse } from "next/server";
import { generateReportPdfBuffer } from "@/lib/report-pdf";
import { requirePortalUser } from "@/lib/portal-auth";
import type { StructuredReport } from "@/lib/types";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
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

  const pdfBuffer = await generateReportPdfBuffer({
    caseRow,
    evidence: evidenceRows ?? [],
    profile,
    report: reportRow.report_json as StructuredReport,
  });

  return new Response(pdfBuffer, {
    headers: {
      "Content-Disposition": `attachment; filename="dossier-${id}.pdf"`,
      "Content-Type": "application/pdf",
    },
  });
}
