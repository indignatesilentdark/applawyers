import { notFound, redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { ReportSection } from "@/components/report-section";
import { StatusBadge } from "@/components/status-badge";
import { requireAuthenticatedUser } from "@/lib/auth";
import type { StructuredReport } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const { supabase, user } = await requireAuthenticatedUser();

  const [{ data: profile }, { data: caseRow }, { data: reportRow }, { data: evidenceRows }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("email, first_name, last_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.from("cases").select("*").eq("id", id).single(),
      supabase.from("case_reports").select("*").eq("case_id", id).maybeSingle(),
      supabase
        .from("case_evidence")
        .select("id, file_name, file_path, file_type, file_size, created_at, case_id, user_id")
        .eq("case_id", id)
        .order("created_at", { ascending: true }),
    ]);

  if (!profile) {
    redirect("/onboarding");
  }

  if (!caseRow) {
    notFound();
  }

  const report = reportRow?.report_json as StructuredReport | undefined;

  return (
    <DashboardShell
      title="Dossier privado"
      eyebrow="Informe preliminar"
      profile={profile}
    >
      <section className="glass-panel rounded-[1.75rem] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Caso creado el {formatDate(caseRow.created_at)}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
              {caseRow.company_name || "Caso en análisis"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {caseRow.fraud_type || "Tipo de fraude no especificado"} ·{" "}
              {formatCurrency(caseRow.lost_amount, caseRow.currency ?? "USD")}
            </p>
          </div>
          <StatusBadge status={caseRow.status} />
        </div>
      </section>

      {report ? (
        <>
          <ReportSection title="Resumen ejecutivo">
            <p className="text-white">{report.executiveSummary}</p>
          </ReportSection>

          <ReportSection title="Cronología preliminar">
            <ul className="space-y-3">
              {report.chronology.map((item) => (
                <li key={item} className="rounded-2xl border border-border/70 bg-background-elevated/60 p-3 text-white">
                  {item}
                </li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection title="Alertas detectadas">
            <ul className="space-y-3">
              {report.redFlags.map((item) => (
                <li key={item} className="rounded-2xl border border-border/70 bg-background-elevated/60 p-3 text-white">
                  {item}
                </li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection title="Evidencias">
            <div className="space-y-3">
              {evidenceRows?.length ? (
                evidenceRows.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border/70 bg-background-elevated/60 p-3"
                  >
                    <p className="text-white">{item.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.file_type || "Archivo"} · {item.file_size ?? "n/d"} bytes
                    </p>
                  </div>
                ))
              ) : (
                <p>No se adjuntaron archivos en este caso.</p>
              )}
            </div>
          </ReportSection>

          <ReportSection title="Análisis de evidencia aportada">
            <ul className="space-y-3">
              {report.evidenceAnalysis.map((item) => (
                <li key={item} className="rounded-2xl border border-border/70 bg-background-elevated/60 p-3 text-white">
                  {item}
                </li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection title="Posibles rutas de trazabilidad">
            <ul className="space-y-3">
              {report.traceabilityRoutes.map((item) => (
                <li key={item} className="rounded-2xl border border-border/70 bg-background-elevated/60 p-3 text-white">
                  {item}
                </li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection title="Información faltante">
            <ul className="space-y-3">
              {report.missingInformation.map((item) => (
                <li key={item} className="rounded-2xl border border-border/70 bg-background-elevated/60 p-3 text-white">
                  {item}
                </li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection title="Próximos pasos sugeridos">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-background-elevated/60 p-4">
                <p className="mb-2 text-sm text-muted-foreground">
                  Nivel de complejidad estimado
                </p>
                <p className="text-lg font-semibold text-white">
                  {report.complexity}
                </p>
              </div>

              <ul className="space-y-3">
                {report.nextSteps.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-border/70 bg-background-elevated/60 p-3 text-white"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ReportSection>

          <ReportSection title="Observación legal">
            <p className="text-white">{report.disclaimer}</p>
          </ReportSection>
        </>
      ) : (
        <ReportSection title="Informe en preparación">
          <p className="text-white">
            Este caso todavía no tiene un informe consolidado. Intenta de nuevo
            en unos minutos.
          </p>
        </ReportSection>
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="rounded-2xl border border-border/80 bg-background-elevated/60 px-4 py-4 text-sm font-semibold text-white"
        >
          Solicitar revisión humana
        </button>
        <button
          type="button"
          className="rounded-2xl border border-border/80 bg-background-elevated/60 px-4 py-4 text-sm font-semibold text-white"
        >
          Descargar PDF
        </button>
      </section>
    </DashboardShell>
  );
}
