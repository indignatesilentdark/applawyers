"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import type { CaseEvidenceRow, CaseRow, ProfileRow, StructuredReport } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type ReportViewProps = {
  caseRow: CaseRow;
  evidenceRows: CaseEvidenceRow[];
  profile: Pick<ProfileRow, "email" | "first_name" | "last_name"> | null;
  report?: StructuredReport;
};

function IconSpark() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" className="fill-current" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3.75l8 14.5H4l8-14.5z" strokeLinejoin="round" />
      <path d="M12 9v3.75" strokeLinecap="round" />
      <circle cx="12" cy="16.25" r="0.75" className="fill-current stroke-none" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M8 3.75h5.5L19 9.25v10a1.75 1.75 0 0 1-1.75 1.75h-9.5A1.75 1.75 0 0 1 6 19.25v-13.75A1.75 1.75 0 0 1 7.75 3.75z" strokeLinejoin="round" />
      <path d="M13.5 3.75V9.5H19" strokeLinejoin="round" />
    </svg>
  );
}

function IconRoute() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="7" cy="6.5" r="2.25" />
      <circle cx="17" cy="17.5" r="2.25" />
      <path d="M9.5 6.5h3a4 4 0 0 1 4 4v4.75" strokeLinecap="round" />
      <path d="M14 17.5h-3a4 4 0 0 1-4-4V9.75" strokeLinecap="round" />
    </svg>
  );
}

function IconList() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M8 7h10M8 12h10M8 17h10" strokeLinecap="round" />
      <circle cx="5" cy="7" r="1" className="fill-current stroke-none" />
      <circle cx="5" cy="12" r="1" className="fill-current stroke-none" />
      <circle cx="5" cy="17" r="1" className="fill-current stroke-none" />
    </svg>
  );
}

function SectionCard({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <motion.section
      className="glass-panel overflow-hidden rounded-[1.75rem] border border-border/80"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-accent via-sky-400 to-transparent" />
      <div className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/12 text-accent">
            {icon}
          </div>
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-white">
            {title}
          </h2>
        </div>
        <div className="text-sm leading-7 text-muted-foreground">{children}</div>
      </div>
    </motion.section>
  );
}

export function ReportView({
  caseRow,
  evidenceRows,
  profile,
  report,
}: ReportViewProps) {
  const router = useRouter();
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isRequestingReview, setIsRequestingReview] = useState(false);

  async function handleReviewRequest() {
    setActionError(null);
    setActionMessage(null);
    setIsRequestingReview(true);

    try {
      const response = await fetch(`/api/cases/${caseRow.id}/review`, {
        method: "POST",
      });

      const payload = (await response.json()) as {
        emailSent?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ?? "No pudimos solicitar la revisión humana.",
        );
      }

      setActionMessage(
        payload.emailSent
          ? "Tu solicitud ya fue enviada al equipo de revisión humana."
          : "Tu solicitud quedó registrada y el caso fue marcado para revisión humana.",
      );
      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "No pudimos solicitar la revisión humana.",
      );
    } finally {
      setIsRequestingReview(false);
    }
  }

  const statCards = [
    {
      label: "Complejidad",
      value: report?.complexity ?? "En preparación",
    },
    {
      label: "País",
      value: caseRow.country ?? "No especificado",
    },
    {
      label: "Monto estimado",
      value: formatCurrency(caseRow.lost_amount, caseRow.currency ?? "USD"),
    },
    {
      label: "Evidencias",
      value: `${evidenceRows.length} archivo${evidenceRows.length === 1 ? "" : "s"}`,
    },
  ];

  return (
    <div className="space-y-5">
      <motion.section
        className="glass-panel overflow-hidden rounded-[1.9rem] border border-border/80"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(32,201,151,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(87,142,255,0.14),transparent_30%)]" />
          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[0.72rem] uppercase tracking-[0.24em] text-accent">
                  <span className="size-2 rounded-full bg-accent" />
                  Informe consolidado
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Caso creado el {formatDate(caseRow.created_at)}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-[2.35rem]">
                    {caseRow.company_name || "Caso en análisis"}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                    Dossier preliminar privado con señales detectadas, cronología
                    estimada, hipótesis de trazabilidad y próximos pasos
                    recomendados.
                  </p>
                </div>
              </div>
              <StatusBadge status={caseRow.status} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.35rem] border border-border/80 bg-background-elevated/70 p-4 shadow-[0_18px_50px_rgba(5,10,20,0.14)]"
                >
                  <p className="text-[0.72rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.4rem] border border-border/80 bg-background-elevated/65 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-accent/15 text-sm font-semibold text-accent">
                  {fullName ? fullName.slice(0, 1).toUpperCase() : "A"}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {fullName || "Usuario autenticado"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email ?? "Sesión protegida"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {report ? (
        <>
          <SectionCard icon={<IconSpark />} title="Resumen ejecutivo">
            <p className="text-[0.98rem] leading-8 text-white/95">
              {report.executiveSummary}
            </p>
          </SectionCard>

          <SectionCard icon={<IconClock />} title="Cronología preliminar">
            <div className="space-y-3">
              {report.chronology.map((item, index) => (
                <motion.div
                  key={item}
                  className="flex gap-3 rounded-[1.35rem] border border-border/70 bg-background-elevated/60 p-4"
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.24 }}
                  viewport={{ once: true, amount: 0.35 }}
                >
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                    {index + 1}
                  </div>
                  <p className="text-white">{item}</p>
                </motion.div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={<IconAlert />} title="Alertas detectadas">
            <div className="grid gap-3 sm:grid-cols-2">
              {report.redFlags.map((item, index) => (
                <motion.div
                  key={item}
                  className="rounded-[1.35rem] border border-rose-400/20 bg-rose-400/5 p-4 text-white"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.24 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={<IconFile />} title="Evidencias">
            <div className="space-y-3">
              {evidenceRows.length ? (
                evidenceRows.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-[1.35rem] border border-border/70 bg-background-elevated/60 p-4"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.24 }}
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-white">{item.file_name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.file_type || "Archivo"} · {item.file_size ?? "n/d"} bytes
                      </p>
                    </div>
                    <div className="rounded-full border border-border/70 px-3 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-muted-foreground">
                      Evidencia
                    </div>
                  </motion.div>
                ))
              ) : (
                <p>No se adjuntaron archivos en este caso.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard
            icon={<IconSpark />}
            title="Análisis de evidencia aportada"
          >
            <div className="space-y-3">
              {report.evidenceAnalysis.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.35rem] border border-border/70 bg-background-elevated/60 p-4 text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={<IconRoute />} title="Posibles rutas de trazabilidad">
            <div className="space-y-3">
              {report.traceabilityRoutes.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.35rem] border border-border/70 bg-background-elevated/60 p-4 text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={<IconList />} title="Información faltante">
            <div className="space-y-3">
              {report.missingInformation.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.35rem] border border-border/70 bg-background-elevated/60 p-4 text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={<IconSpark />} title="Próximos pasos sugeridos">
            <div className="space-y-4">
              <div className="rounded-[1.35rem] border border-accent/20 bg-accent/8 p-4">
                <p className="text-[0.72rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Nivel de complejidad estimado
                </p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-white">
                  {report.complexity}
                </p>
              </div>

              <div className="space-y-3">
                {report.nextSteps.map((item, index) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-[1.35rem] border border-border/70 bg-background-elevated/60 p-4 text-white"
                  >
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-400/15 text-xs font-semibold text-sky-200">
                      {index + 1}
                    </div>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={<IconAlert />} title="Observación legal">
            <p className="rounded-[1.35rem] border border-amber-300/20 bg-amber-300/5 p-4 text-white">
              {report.disclaimer}
            </p>
          </SectionCard>
        </>
      ) : (
        <SectionCard icon={<IconSpark />} title="Informe en preparación">
          <p className="text-white">
            Este caso todavía no tiene un informe consolidado. Intenta de nuevo
            en unos minutos.
          </p>
        </SectionCard>
      )}

      {(actionError || actionMessage) && (
        <motion.div
          className={`rounded-[1.4rem] border px-4 py-4 text-sm ${
            actionError
              ? "border-danger/30 bg-danger/10 text-white"
              : "border-accent/30 bg-accent/10 text-white"
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {actionError ?? actionMessage}
        </motion.div>
      )}

      <motion.section
        className="glass-panel rounded-[1.75rem] border border-border/80 p-5"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Acciones del dossier
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
              Exporta el informe o escala el caso
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              Puedes descargar el dossier en PDF o solicitar revisión humana
              para que el caso entre a una validación más profunda.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleReviewRequest}
              disabled={!report || isRequestingReview}
              className="rounded-2xl border border-border/80 bg-background-elevated/60 px-5 py-4 text-sm font-semibold text-white transition hover:border-accent/30 hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isRequestingReview
                ? "Solicitando revisión..."
                : "Solicitar revisión humana"}
            </button>
            <a
              href={`/api/cases/${caseRow.id}/pdf`}
              className={`rounded-2xl px-5 py-4 text-center text-sm font-semibold transition ${
                report
                  ? "bg-accent text-accent-foreground hover:brightness-105"
                  : "pointer-events-none bg-accent/45 text-accent-foreground/70"
              }`}
            >
              Descargar PDF
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
