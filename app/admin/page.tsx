import { AdminRegistryPanel } from "@/components/admin-registry-panel";
import { CaseWorkspaceShell } from "@/components/case-workspace-shell";
import { requireAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

type FlaggedBrokerAdminRow = {
  id: string;
  name: string;
  risk_level: string | null;
  source_note: string | null;
  source_type: string | null;
  status: string | null;
  updated_at: string;
};

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { admin, user } = await requireAdminUser();
  const params = (await searchParams) ?? {};
  const requestedTab =
    typeof params.tab === "string" ? params.tab.toLowerCase() : "overview";
  const initialTab =
    requestedTab === "entities" || requestedTab === "users"
      ? requestedTab
      : "overview";

  const [
    { data: adminProfile },
    { data: users },
    { data: profiles },
    { data: cases },
    { data: entities },
    { count: externalFeedCount },
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", user.id)
      .maybeSingle(),
    admin
      .from("portal_users")
      .select("id, email, created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("profiles")
      .select("id, first_name, last_name, country, phone"),
    admin
      .from("cases")
      .select("id, user_id, company_name, fraud_type, country, lost_amount, currency, status, created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("flagged_brokers")
      .select("id, name, risk_level, source_note, source_type, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(120),
    admin
      .from("external_broker_feeds")
      .select("*", { count: "exact", head: true }),
  ]);

  const profileById = new Map((profiles ?? []).map((item) => [item.id, item]));
  const userById = new Map((users ?? []).map((item) => [item.id, item]));
  const totalUsers = users?.length ?? 0;
  const totalCases = cases?.length ?? 0;
  const readyReports =
    cases?.filter((item) => item.status === "Informe listo").length ?? 0;
  const humanReview =
    cases?.filter((item) => item.status === "Revisión humana solicitada").length ??
    0;
  const latestCases = cases?.slice(0, 4) ?? [];

  return (
    <CaseWorkspaceShell
      profile={adminProfile}
      title="Admin"
      eyebrow="Panel interno"
      activeItem={initialTab === "entities" ? "Entidades" : "Admin"}
      isAdmin
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <div className="relative overflow-hidden rounded-[1.9rem] border border-accent/15 bg-[radial-gradient(circle_at_top_left,rgba(36,222,170,0.16),transparent_38%),linear-gradient(180deg,rgba(12,24,44,0.96),rgba(8,15,31,0.92))] p-6 lg:p-7">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] text-accent">
              Centro de control
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white lg:text-[2.7rem]">
              Administra usuarios, casos y entidades sin perder foco.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-sky-100/72 lg:text-base">
              Esta portada concentra solo la lectura operativa principal:
              volumen activo, revisión pendiente y acceso inmediato al radar de
              entidades bajo observación.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="surface-contrast rounded-[1.35rem] p-4">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Usuarios
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                {totalUsers}
              </p>
            </div>
            <div className="surface-muted rounded-[1.35rem] p-4">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Casos
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                {totalCases}
              </p>
            </div>
            <div className="surface-accent rounded-[1.35rem] p-4">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Informes listos
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                {readyReports}
              </p>
            </div>
            <div className="surface-muted rounded-[1.35rem] p-4">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Revisión humana
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                {humanReview}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel flex flex-col justify-between rounded-[1.9rem] p-6">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
              Resumen operativo
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
              Qué requiere atención hoy
            </h3>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-[1.35rem] border border-border/70 bg-background/25 p-4">
              <p className="text-sm text-muted-foreground">Pendientes críticas</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {humanReview} caso{humanReview === 1 ? "" : "s"} esperando revisión humana
              </p>
            </div>
            <div className="rounded-[1.35rem] border border-border/70 bg-background/25 p-4">
              <p className="text-sm text-muted-foreground">Radar externo</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {externalFeedCount ?? 0} fuente
                {externalFeedCount === 1 ? "" : "s"} sincronizada
                {externalFeedCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-[1.35rem] border border-accent/20 bg-accent/8 p-4 text-sm leading-6 text-white/88">
              Usa el bloque de Entidades para validar nombres, revisar riesgo y
              disparar sincronización manual cuando quieras refrescar el radar.
            </div>
          </div>
        </div>
      </section>

      <AdminRegistryPanel
        entities={(entities ?? []).map((entity: FlaggedBrokerAdminRow) => ({
          id: entity.id,
          name: entity.name,
          riskLevel: entity.risk_level ?? "medio",
          sourceNote: entity.source_note,
          sourceType: entity.source_type ?? "internal",
          status: entity.status ?? "observacion",
          updatedAt: entity.updated_at,
        }))}
        externalFeedCount={externalFeedCount ?? 0}
        users={(users ?? []).map((item) => {
          const profile = profileById.get(item.id);
          const fullName = [profile?.first_name, profile?.last_name]
            .filter(Boolean)
            .join(" ");

          return {
            id: item.id,
            email: item.email,
            createdAt: item.created_at,
            fullName,
            country: profile?.country ?? null,
            phone: profile?.phone ?? null,
          };
        })}
        cases={latestCases.map((item) => {
          const owner = profileById.get(item.user_id);
          const ownerUser = userById.get(item.user_id);
          const ownerName = [owner?.first_name, owner?.last_name]
            .filter(Boolean)
            .join(" ");

          return {
            id: item.id,
            companyName: item.company_name,
            fraudType: item.fraud_type,
            country: item.country,
            lostAmount: item.lost_amount,
            currency: item.currency ?? "USD",
            status: item.status,
            createdAt: item.created_at,
            ownerLabel: ownerName || ownerUser?.email || item.user_id,
          };
        })}
        initialTab={initialTab}
        totalCases={totalCases}
      />

    </CaseWorkspaceShell>
  );
}
