import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  generateStructuredReport,
  renderReportAsText,
} from "@/lib/reporting";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { caseId?: string };
    if (!body.caseId) {
      return NextResponse.json(
        { error: "caseId is required" },
        { status: 400 },
      );
    }

    const [{ data: caseRow }, { data: evidenceRows }] = await Promise.all([
      supabase
        .from("cases")
        .select("*")
        .eq("id", body.caseId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("case_evidence")
        .select("*")
        .eq("case_id", body.caseId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

    if (!caseRow) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    await supabase
      .from("cases")
      .update({ status: "Analizando" })
      .eq("id", body.caseId)
      .eq("user_id", user.id);

    const report = await generateStructuredReport(caseRow, evidenceRows ?? []);
    const reportText = renderReportAsText(report);

    const admin = createAdminSupabaseClient();
    const { error: reportError } = await admin.from("case_reports").upsert(
      {
        case_id: body.caseId,
        report_json: report,
        report_text: reportText,
        user_id: user.id,
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
      .eq("id", body.caseId)
      .eq("user_id", user.id);

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to analyze case" },
      { status: 500 },
    );
  }
}
