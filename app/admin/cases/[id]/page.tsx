import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, UserRound } from "lucide-react";
import { CaseWorkspaceShell } from "@/components/case-workspace-shell";
import { ReportView } from "@/components/report-view";
import { requireAdminUser } from "@/lib/admin";
import type { StructuredReport } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AdminCaseReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCaseReportPage({
  params,
}: AdminCaseReportPageProps) {
  const { id } = await params;
  const { admin, user } = await requireAdminUser();

  const [{ data: adminProfile }, { data: caseRow }] = await Promise.all([
    admin
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", user.id)
      .maybeSingle(),
    admin.from("cases").select("*").eq("id", id).maybeSingle(),
  ]);

  if (!caseRow) {
    notFound();
  }

  const [{ data: ownerProfile }, { data: ownerUser }, { data: reportRow }, { data: evidenceRows }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("email, first_name, last_name")
        .eq("id", caseRow.user_id)
        .maybeSingle(),
      admin
        .from("portal_users")
        .select("email")
        .eq("id", caseRow.user_id)
        .maybeSingle(),
      admin.from("case_reports").select("*").eq("case_id", id).maybeSingle(),
      admin
        .from("case_evidence")
        .select("id, file_name, file_path, file_type, file_size, created_at, case_id, user_id")
        .eq("case_id", id)
        .order("created_at", { ascending: true }),
    ]);

  const ownerName = [ownerProfile?.first_name, ownerProfile?.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <CaseWorkspaceShell
      profile={adminProfile}
      title="Dossier del caso"
      eyebrow="Panel interno"
      activeItem="Casos"
      isAdmin
    >
      <div className="space-y-6 lg:space-y-7">
        <section className="glass-panel rounded-[1.75rem] p-5 lg:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Link
                href="/admin/cases"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/25 px-4 py-2 text-sm text-sky-100/82 transition hover:border-accent/25 hover:text-white"
              >
                <ArrowLeft className="size-4" />
                Volver a casos
              </Link>

              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Dossier administrativo
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
                  {caseRow.company_name || "Caso en revisión"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-sky-100/72">
                  Expediente creado el {formatDate(caseRow.created_at)} · estado actual:{" "}
                  {caseRow.status}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-border/70 bg-background/25 p-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-sky-100/84">
                    <UserRound className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Usuario
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {ownerName || ownerProfile?.email || ownerUser?.email || "No disponible"}
                    </p>
                    <p className="mt-1 text-sm text-sky-100/68">
                      {ownerProfile?.email || ownerUser?.email || "Correo no disponible"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-accent/20 bg-accent/8 p-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-10 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Informe
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {reportRow ? "Disponible para revisión" : "En preparación"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ReportView
          caseRow={caseRow}
          evidenceRows={evidenceRows ?? []}
          profile={ownerProfile ?? null}
          report={reportRow?.report_json as StructuredReport | undefined}
          showActions={false}
        />
      </div>
    </CaseWorkspaceShell>
  );
}
