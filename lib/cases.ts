import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendCaseReportEmail } from "@/lib/report-delivery";
import { runCaseInvestigation } from "@/lib/investigation";
import { renderReportAsText } from "@/lib/reporting";

export async function analyzeAndPersistCase(
  caseId: string,
  userId: string,
  admin = createAdminSupabaseClient(),
) {
  const [{ data: caseRow }, { data: evidenceRows }] = await Promise.all([
    admin.from("cases").select("*").eq("id", caseId).eq("user_id", userId).single(),
    admin
      .from("case_evidence")
      .select("*")
      .eq("case_id", caseId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  if (!caseRow) {
    throw new Error("Case not found.");
  }

  await admin
    .from("cases")
    .update({ status: "Analizando", updated_at: new Date().toISOString() })
    .eq("id", caseId)
    .eq("user_id", userId);

  await admin.from("investigation_results").upsert(
    {
      case_id: caseId,
      status: "running",
      timeline: [
        {
          code: "case_created",
          label: "Caso creado",
          message: "El expediente fue creado y la investigación inició.",
          status: "completed",
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    { onConflict: "case_id" },
  );

  const { investigation, report } = await runCaseInvestigation(
    caseRow,
    evidenceRows ?? [],
  );
  const reportText = renderReportAsText(report);

  const { error: investigationError } = await admin
    .from("investigation_results")
    .upsert(
      {
        blockchain_result: investigation.blockchain_result,
        case_id: caseId,
        domain_result: investigation.domain_result,
        evidence_result: investigation.evidence_result,
        findings: investigation.findings,
        public_intel_result: investigation.public_intel_result,
        regulatory_result: investigation.regulatory_result,
        score_result: investigation.score_result,
        sources: investigation.sources,
        status: investigation.status,
        timeline: investigation.timeline,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "case_id",
      },
    );

  if (investigationError) {
    throw investigationError;
  }

  const { error: reportError } = await admin.from("case_reports").upsert(
    {
      case_id: caseId,
      report_json: report,
      report_text: reportText,
      user_id: userId,
    },
    {
      onConflict: "case_id",
    },
  );

  if (reportError) {
    throw reportError;
  }

  await admin
    .from("cases")
    .update({
      ai_report: report,
      status:
        investigation.status === "partial"
          ? "Requiere información"
          : "Informe listo",
      updated_at: new Date().toISOString(),
    })
    .eq("id", caseId)
    .eq("user_id", userId);

  const { data: profile } = await admin
    .from("profiles")
    .select("email, first_name, last_name, phone")
    .eq("id", userId)
    .maybeSingle();

  try {
    await sendCaseReportEmail({
      caseId,
      caseRow,
      evidence: evidenceRows ?? [],
      profile,
      report,
    });
  } catch (error) {
    console.error("Failed to send case report email", error);
  }

  return report;
}
