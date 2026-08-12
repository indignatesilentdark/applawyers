import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck, TriangleAlert } from "lucide-react";
import { CaseWorkspaceShell } from "@/components/case-workspace-shell";
import { isAdminEmail } from "@/lib/admin";
import { requirePortalUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const { admin, user } = await requirePortalUser();
  const isAdmin = isAdminEmail(user.email);

  if (isAdmin) {
    redirect("/admin");
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("email, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <CaseWorkspaceShell
      title="Seguridad"
      eyebrow="Acceso protegido"
      activeItem="Configuración"
      profile={profile}
    >
      <div className="space-y-6 lg:space-y-7">
        <section className="glass-panel rounded-[1.9rem] border border-accent/15 bg-[radial-gradient(circle_at_top_left,rgba(36,222,170,0.12),transparent_38%),linear-gradient(180deg,rgba(12,24,44,0.96),rgba(8,15,31,0.92))] p-5 lg:p-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] text-accent">
              Seguridad activa
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
              Tu acceso privado está protegido
            </h2>
            <p className="mt-3 text-sm leading-7 text-sky-100/74">
              Este espacio resume cómo protegemos tu dossier, qué tipo de acceso
              mantiene la sesión actual y qué debes hacer si notas actividad no
              reconocida.
            </p>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <article className="glass-panel rounded-[1.75rem] p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-accent">
                <LockKeyhole className="size-5" />
              </div>
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Método de acceso
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Código seguro por correo
                </h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-sky-100/72">
              El ingreso a tu panel privado se valida con un código temporal o
              con tu credencial protegida, según el flujo de acceso disponible.
            </p>
          </article>

          <article className="glass-panel rounded-[1.75rem] p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-accent">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Sesión actual
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Protegida y privada
                </h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-sky-100/72">
              Tu expediente permanece dentro de un entorno privado y el acceso
              está asociado a tu cuenta autenticada.
            </p>
          </article>

          <article className="glass-panel rounded-[1.75rem] p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-amber-200">
                <TriangleAlert className="size-5" />
              </div>
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Acción recomendada
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Cierra sesión si ves algo inusual
                </h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-sky-100/72">
              Si pierdes acceso a tu correo o detectas actividad extraña,
              solicita un nuevo ingreso seguro antes de continuar con el caso.
            </p>
          </article>
        </section>
      </div>
    </CaseWorkspaceShell>
  );
}
