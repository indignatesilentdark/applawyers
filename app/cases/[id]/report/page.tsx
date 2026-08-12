import { notFound, redirect } from "next/navigation";
import { DossierPrivateHeader } from "@/components/dossier-private-header";
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
  const isAdmin = isAdminEmail(user.email);

  if (isAdmin) {
    redirect(`/admin/cases/${id}`);
  }

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

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");

  return (
    <main className="page-shell space-y-6 py-5 lg:space-y-7 lg:py-8">
      <DossierPrivateHeader
        isAdmin={isAdmin}
        userEmail={profile.email}
        userName={fullName}
      />

      <ReportView
        caseRow={caseRow}
        evidenceRows={evidenceRows ?? []}
        profile={profile}
        report={reportRow?.report_json as StructuredReport | undefined}
      />
    </main>
  );
}
