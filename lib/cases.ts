import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendCaseReportEmail } from "@/lib/report-delivery";
import {
  generateStructuredReport,
  renderReportAsText,
} from "@/lib/reporting";

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
    .update({ status: "Analizando" })
    .eq("id", caseId)
    .eq("user_id", userId);

  const report = await generateStructuredReport(caseRow, evidenceRows ?? []);
  const reportText = renderReportAsText(report);

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
    .update({ status: "Informe listo" })
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
