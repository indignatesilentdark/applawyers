import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { isAdminEmail } from "@/lib/admin";
import { requirePortalUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { admin, user } = await requirePortalUser();

  const { data: profile } = await admin
    .from("profiles")
    .select("email, first_name, last_name, country, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");

  return (
    <DashboardShell
      title="Perfil"
      eyebrow="Datos del titular"
      isAdmin={isAdminEmail(user.email)}
      profile={profile}
    >
      <section className="glass-panel rounded-[1.75rem] p-5">
        <p className="text-sm leading-7 text-muted-foreground">
          Revisa la información asociada al titular del dossier privado.
        </p>

        <div className="mt-5 grid gap-3">
          <div className="rounded-[1.35rem] border border-border/70 bg-background-elevated/60 p-4">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Nombre completo
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {fullName || "No registrado"}
            </p>
          </div>

          <div className="rounded-[1.35rem] border border-border/70 bg-background-elevated/60 p-4">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Correo
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {profile.email || "No registrado"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.35rem] border border-border/70 bg-background-elevated/60 p-4">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                País
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {profile.country || "No registrado"}
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-border/70 bg-background-elevated/60 p-4">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Teléfono
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {profile.phone || "No registrado"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
