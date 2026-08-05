import Link from "next/link";
import { AdminEntitiesPanel } from "@/components/admin-entities-panel";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdminUser } from "@/lib/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

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

export default async function AdminPage() {
  const { admin, user } = await requireAdminUser();

  const [
    { data: adminProfile },
    { data: users },
    { data: profiles },
    { data: cases },
    { data: entities },
    { count: externalFeedCount },
  ] =
    await Promise.all([
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

  return (
    <DashboardShell
      title="Admin"
      eyebrow="Panel interno"
      isAdmin
      profile={adminProfile}
      summaryText="Supervisa usuarios, casos e informes listos desde el panel interno con una lectura rápida de la operación."
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface-contrast rounded-[1.5rem] p-5">
          <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
            Usuarios
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
            {totalUsers}
          </p>
        </div>
        <div className="surface-muted rounded-[1.5rem] p-5">
          <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
            Casos
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
            {totalCases}
          </p>
        </div>
        <div className="surface-accent rounded-[1.5rem] p-5">
          <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
            Informes listos
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
            {readyReports}
          </p>
        </div>
        <div className="surface-muted rounded-[1.5rem] p-5">
          <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
            Revisión humana
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
            {humanReview}
          </p>
        </div>
      </section>

      <AdminEntitiesPanel
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
      />

      <section className="glass-panel rounded-[1.75rem] p-5 lg:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Usuarios registrados
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
              Lista de usuarios
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {totalUsers} registro{totalUsers === 1 ? "" : "s"}
          </span>
        </div>

        <div className="space-y-3">
          {users?.length ? (
            users.map((item) => {
              const profile = profileById.get(item.id);
              const fullName = [profile?.first_name, profile?.last_name]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  key={item.id}
                  className="surface-contrast rounded-[1.35rem] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {fullName || item.email}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.email}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Alta: {formatDate(item.created_at)}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-sky-300/10 bg-sky-300/5 px-4 py-3 text-sm text-white/90">
                      País: {profile?.country || "No registrado"}
                    </div>
                    <div className="rounded-2xl border border-accent/15 bg-accent/5 px-4 py-3 text-sm text-white/90">
                      Teléfono: {profile?.phone || "No registrado"}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no hay usuarios registrados.
            </p>
          )}
        </div>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-5 lg:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Casos creados
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
              Lista de casos
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {totalCases} registro{totalCases === 1 ? "" : "s"}
          </span>
        </div>

        <div className="space-y-3">
          {cases?.length ? (
            cases.map((item) => {
              const owner = profileById.get(item.user_id);
              const ownerUser = userById.get(item.user_id);
              const ownerName = [owner?.first_name, owner?.last_name]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  key={item.id}
                  className="surface-contrast rounded-[1.35rem] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {item.company_name || "Caso sin empresa"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.fraud_type || "Tipo no especificado"} ·{" "}
                        {item.country || "País no especificado"}
                      </p>
                    </div>
                    <div className="rounded-full border border-accent/20 bg-accent/8 px-3 py-1 text-xs font-medium text-white">
                      {item.status}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-sky-300/10 bg-sky-300/5 px-4 py-3 text-sm text-white/90">
                      Cliente: {ownerName || ownerUser?.email || item.user_id}
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/25 px-4 py-3 text-sm text-white/90">
                      Fecha: {formatDate(item.created_at)}
                    </div>
                    <div className="rounded-2xl border border-accent/15 bg-accent/5 px-4 py-3 text-sm text-white/90">
                      Monto: {formatCurrency(item.lost_amount, item.currency ?? "USD")}
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/25 px-4 py-3 text-sm text-white/90">
                      <Link
                        href={`/cases/${item.id}/report`}
                        className="font-medium text-accent"
                      >
                        Abrir dossier
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no hay casos creados.
            </p>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
