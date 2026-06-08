import { notFound, redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { ReportView } from "@/components/report-view";
import { isAdminEmail } from "@/lib/admin";
import { requirePortalUser } from "@/lib/auth";
import type { StructuredReport } from "@/lib/types";

export const dynamic = "force-dynamic";

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const { admin, user } = await requirePortalUser();

  const [{ data: profile }, { data: caseRow }, { data: reportRow }, { data: evidenceRows }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("email, first_name, last_name")
        .eq("id", user.id)
        .maybeSingle(),
      admin.from("cases").select("*").eq("id", id).eq("user_id", user.id).maybeSingle(),
      admin.from("case_reports").select("*").eq("case_id", id).eq("user_id", user.id).maybeSingle(),
      admin
        .from("case_evidence")
        .select("id, file_name, file_path, file_type, file_size, created_at, case_id, user_id")
        .eq("case_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

  if (!profile) {
    redirect("/onboarding");
  }

  if (!caseRow) {
    notFound();
  }

  return (
    <DashboardShell
      title="Dossier privado"
      eyebrow="Informe preliminar"
      isAdmin={isAdminEmail(user.email)}
      profile={profile}
    >
      <ReportView
        caseRow={caseRow}
        evidenceRows={evidenceRows ?? []}
        profile={profile}
        report={reportRow?.report_json as StructuredReport | undefined}
      />
    </DashboardShell>
  );
}
