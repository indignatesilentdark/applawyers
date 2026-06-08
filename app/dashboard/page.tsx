import { redirect } from "next/navigation";
import Link from "next/link";
import { CaseCard } from "@/components/case-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { requirePortalUser } from "@/lib/auth";

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
      profile={profile}
    >
      <section className="glass-panel rounded-[1.75rem] p-5">
        <p className="text-sm text-muted-foreground">
          Hola{profile.first_name ? `, ${profile.first_name}` : ""}.
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
          Análisis profundo de tu caso
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Completa la información necesaria para que el sistema prepare un
          informe preliminar detallado con apoyo de IA.
        </p>
        <Link
          href="/cases/new"
          className="mt-5 inline-flex rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
        >
          Analizar mi caso a fondo
        </Link>
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
          cases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              caseItem={caseItem}
              hasReport={reportCaseIds.has(caseItem.id)}
            />
          ))
        ) : (
          <div className="glass-panel rounded-[1.5rem] p-5 text-sm leading-7 text-muted-foreground">
            Todavía no has creado casos. Cuando completes el formulario de
            análisis, aquí verás el estado del proceso y el acceso al informe.
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
