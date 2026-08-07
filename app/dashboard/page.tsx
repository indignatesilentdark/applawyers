import { redirect } from "next/navigation";
import { FolderSearch, LockKeyhole } from "lucide-react";
import { CaseBenefitsGrid } from "@/components/case-benefits-grid";
import { CaseCard } from "@/components/case-card";
import { CaseStatusCard } from "@/components/case-status-card";
import { CaseWorkspaceShell } from "@/components/case-workspace-shell";
import { HeroCaseAnalysis } from "@/components/hero-case-analysis";
import { InvestigationTimeline } from "@/components/investigation-timeline";
import { isAdminEmail } from "@/lib/admin";
import { requirePortalUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { admin, user } = await requirePortalUser();

  const [{ data: profile }, { data: cases }] = await Promise.all([
    admin
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", user.id)
      .maybeSingle(),
    admin
      .from("cases")
      .select("id, company_name, created_at, currency, fraud_type, lost_amount, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) {
    redirect("/onboarding");
  }

  const caseIds = cases?.map((item) => item.id) ?? [];
  const { data: reports } = caseIds.length
    ? await admin.from("case_reports").select("case_id").in("case_id", caseIds)
    : { data: [] as Array<{ case_id: string }> };

  const reportCaseIds = new Set((reports ?? []).map((item) => item.case_id));
  const hasCases = Boolean(cases?.length);
  const isAdmin = isAdminEmail(user.email);

  return (
    <CaseWorkspaceShell
      profile={profile}
      title="Dossier privado"
      eyebrow="Centro de investigación"
      activeItem="Dashboard"
      isAdmin={isAdmin}
    >
      <div className="space-y-7 lg:space-y-8">
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.22fr)_minmax(21rem,0.48fr)]">
          <HeroCaseAnalysis ctaHref="/cases/new" />

          <aside className="space-y-4">
            <section className="glass-panel rounded-[1.75rem] p-5 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-sky-100/84">
                  <FolderSearch className="size-5" />
                </div>
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
                    Estado de tu expediente
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    Centro de investigación
                  </h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <CaseStatusCard
                  description="El caso todavía no ha iniciado el flujo profundo."
                  icon="file"
                  label="Expediente"
                  tone="amber"
                  value={hasCases ? "En curso" : "No iniciado"}
                />
                <CaseStatusCard
                  description="La IA está lista para revisar tus evidencias y contexto."
                  icon="analysis"
                  label="Análisis"
                  tone="emerald"
                  value="Pendiente"
                />
                <CaseStatusCard
                  description="El informe aparecerá aquí cuando completes el análisis."
                  icon="report"
                  label="Informe"
                  tone="slate"
                  value={reportCaseIds.size ? "Disponible" : "No disponible"}
                />
              </div>

              <div className="surface-muted mt-5 rounded-[1.35rem] p-4">
                <div className="flex items-start gap-3">
                  <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-accent">
                    <LockKeyhole className="size-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">
                      Privacidad garantizada
                    </p>
                    <p className="mt-2 text-sm leading-7 text-sky-100/72">
                      Este es un espacio 100% confidencial. Solo tú tienes acceso.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)]">
          <InvestigationTimeline currentStep={1} />
          <CaseBenefitsGrid />
        </div>

        <section className="glass-panel rounded-[1.75rem] p-5 lg:p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/8 text-accent">
                <LockKeyhole className="size-6" />
              </div>
              <div>
                <p className="text-xl font-semibold tracking-[-0.03em] text-white">
                  Estás en buenas manos
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-sky-100/72">
                  Abogados especializados en fraudes financieros, criptoactivos y
                  delitos tecnológicos respaldan este proceso preliminar.
                </p>
              </div>
            </div>

            <div className="surface-muted rounded-[1.35rem] px-5 py-4 text-sm leading-7 text-sky-100/76">
              Más de 150 análisis preliminares procesados en flujos privados.
            </div>
          </div>
        </section>

        {hasCases ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
                  Expedientes previos
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Investigaciones en seguimiento
                </h2>
              </div>
              <span className="text-sm text-sky-100/68">
                {cases?.length ?? 0} registro{(cases?.length ?? 0) === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid gap-5 2xl:grid-cols-2">
              {cases?.map((caseItem) => (
                <CaseCard
                  key={caseItem.id}
                  caseItem={caseItem}
                  hasReport={reportCaseIds.has(caseItem.id)}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </CaseWorkspaceShell>
  );
}
