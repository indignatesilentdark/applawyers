import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requirePortalUser } from "@/lib/auth";

export default async function SecurityPage() {
  const { admin, user } = await requirePortalUser();

  const { data: profile } = await admin
    .from("profiles")
    .select("email, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <DashboardShell
      title="Seguridad"
      eyebrow="Acceso protegido"
      profile={profile}
    >
      <section className="glass-panel rounded-[1.75rem] p-5">
        <p className="text-sm leading-7 text-muted-foreground">
          Este espacio resume cómo protegemos el acceso a tu dossier y qué hacer
          si notas actividad no reconocida.
        </p>

        <div className="mt-5 space-y-3">
          <div className="rounded-[1.35rem] border border-border/70 bg-background-elevated/60 p-4">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Método de acceso
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              Código seguro enviado por correo
            </p>
          </div>

          <div className="rounded-[1.35rem] border border-border/70 bg-background-elevated/60 p-4">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Sesión actual
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              Protegida y privada
            </p>
          </div>

          <div className="rounded-[1.35rem] border border-border/70 bg-background-elevated/60 p-4">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Recomendación
            </p>
            <p className="mt-2 text-base leading-7 text-white">
              Si pierdes acceso a tu correo o detectas algo inusual, cierra
              sesión y solicita un nuevo código antes de continuar.
            </p>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
