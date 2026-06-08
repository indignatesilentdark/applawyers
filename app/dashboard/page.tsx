import { redirect } from "next/navigation";
import Link from "next/link";
import { CaseCard } from "@/components/case-card";
import { DashboardShell } from "@/components/dashboard-shell";
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

  return (
    <DashboardShell
      title="Dossier privado"
      eyebrow="Panel seguro"
      isAdmin={isAdminEmail(user.email)}
      profile={profile}
    >
      <div className="dashboard-grid">
        <div className="space-y-5">
          <section className="glass-panel desktop-hero-panel rounded-[1.75rem] p-5 lg:p-6">
            <div className="relative">
              <p className="text-sm text-muted-foreground">
                Hola{profile.first_name ? `, ${profile.first_name}` : ""}.
              </p>
              <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-white lg:text-[3.2rem]">
                Análisis profundo de tu caso
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground lg:text-base lg:leading-8">
                Completa la información necesaria para que el sistema prepare un
                informe preliminar detallado con apoyo de IA.
              </p>
              <Link
                href="/cases/new"
                className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground"
              >
                Analizar mi caso a fondo
              </Link>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                Casos creados
              </h3>
              <span className="text-sm text-muted-foreground">
                {cases?.length ?? 0} registro{(cases?.length ?? 0) === 1 ? "" : "s"}
              </span>
            </div>

            {cases?.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {cases.map((caseItem) => (
                  <CaseCard
                    key={caseItem.id}
                    caseItem={caseItem}
                    hasReport={reportCaseIds.has(caseItem.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-[1.5rem] p-5 text-sm leading-7 text-muted-foreground">
                Todavía no has creado casos. Cuando completes el formulario de
                análisis, aquí verás el estado del proceso y el acceso al informe.
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="glass-panel rounded-[1.5rem] p-5">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Resumen del panel
            </p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[1.25rem] border border-border/80 bg-background-elevated/60 p-4">
                <p className="text-sm text-muted-foreground">Casos creados</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {cases?.length ?? 0}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-border/80 bg-background-elevated/60 p-4">
                <p className="text-sm text-muted-foreground">Informes listos</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {reportCaseIds.size}
                </p>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[1.5rem] p-5">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Siguiente movimiento
            </p>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">
              Continúa con tu análisis
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Reúne evidencia, completa el flujo profundo y descarga el dossier
              cuando el informe esté listo.
            </p>
          </section>
        </aside>
      </div>
    </DashboardShell>
  );
}
