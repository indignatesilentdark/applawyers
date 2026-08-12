import Link from "next/link";
import { FileText, FolderOpen, UserRound } from "lucide-react";
import { CaseWorkspaceShell } from "@/components/case-workspace-shell";
import { requireAdminUser } from "@/lib/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCasesPage() {
  const { admin, user } = await requireAdminUser();

  const [{ data: adminProfile }, { data: cases }, { data: profiles }, { data: users }, { data: reports }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("email, first_name, last_name")
        .eq("id", user.id)
        .maybeSingle(),
      admin
        .from("cases")
        .select("id, user_id, company_name, fraud_type, country, lost_amount, currency, status, created_at")
        .order("created_at", { ascending: false }),
      admin
        .from("profiles")
        .select("id, first_name, last_name, email"),
      admin.from("portal_users").select("id, email"),
      admin.from("case_reports").select("case_id"),
    ]);

  const profileById = new Map((profiles ?? []).map((item) => [item.id, item]));
  const userById = new Map((users ?? []).map((item) => [item.id, item]));
  const reportCaseIds = new Set((reports ?? []).map((item) => item.case_id));

  return (
    <CaseWorkspaceShell
      profile={adminProfile}
      title="Casos"
      eyebrow="Panel interno"
      activeItem="Casos"
      isAdmin
    >
      <div className="space-y-6 lg:space-y-7">
        <section className="glass-panel rounded-[1.9rem] p-5 lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Expedientes registrados
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
                Lista completa de casos
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-sky-100/72">
                Revisa cada caso por usuario, confirma el estado del expediente y
                entra al dossier para ver el informe consolidado.
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-accent/20 bg-accent/8 px-4 py-3 text-sm text-white">
              {cases?.length ?? 0} caso{(cases?.length ?? 0) === 1 ? "" : "s"} en total
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {cases?.length ? (
            cases.map((item) => {
              const ownerProfile = profileById.get(item.user_id);
              const ownerUser = userById.get(item.user_id);
              const ownerName = [ownerProfile?.first_name, ownerProfile?.last_name]
                .filter(Boolean)
                .join(" ");
              const dossierReady = reportCaseIds.has(item.id);

              return (
                <article
                  key={item.id}
                  className="glass-panel rounded-[1.75rem] p-5 lg:p-6"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[0.72rem] uppercase tracking-[0.2em] text-muted-foreground">
                          Caso
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                          {item.company_name || "Caso sin empresa"}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-sky-100/72">
                          {item.fraud_type || "Tipo no especificado"} ·{" "}
                          {item.country || "País no especificado"} · creado el{" "}
                          {formatDate(item.created_at)}
                        </p>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-3">
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
                                {ownerName || ownerUser?.email || item.user_id}
                              </p>
                              <p className="mt-1 text-sm text-sky-100/68">
                                {ownerProfile?.email || ownerUser?.email || "Correo no disponible"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[1.25rem] border border-border/70 bg-background/25 p-4">
                          <div className="flex items-center gap-3">
                            <div className="inline-flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-sky-100/84">
                              <FolderOpen className="size-4" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                Estado
                              </p>
                              <p className="mt-1 text-sm font-semibold text-white">
                                {item.status}
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
                                Monto reportado
                              </p>
                              <p className="mt-1 text-sm font-semibold text-white">
                                {formatCurrency(item.lost_amount, item.currency ?? "USD")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 xl:min-w-[15rem]">
                      <div className="rounded-full border border-border/70 bg-background/25 px-4 py-2 text-center text-sm text-white/88">
                        {dossierReady ? "Dossier disponible" : "Informe en preparación"}
                      </div>
                      <Link
                        href={`/admin/cases/${item.id}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-accent px-5 py-4 text-sm font-semibold text-accent-foreground transition hover:brightness-105"
                      >
                        Ver dossier
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="glass-panel rounded-[1.75rem] px-5 py-8 text-sm text-muted-foreground">
              Aún no hay casos creados en la plataforma.
            </div>
          )}
        </section>
      </div>
    </CaseWorkspaceShell>
  );
}
