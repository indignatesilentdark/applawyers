import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { hasPortalAuthEnv } from "@/lib/env";
import { getPortalSession } from "@/lib/portal-auth";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const session = hasPortalAuthEnv ? await getPortalSession() : null;
  const message = typeof params.message === "string" ? params.message : undefined;
  const error =
    typeof params.error === "string"
      ? message ??
        "No pudimos completar el acceso. Solicita un nuevo código e intenta de nuevo."
      : undefined;

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell flex items-center py-8">
      <section className="glass-panel relative w-full overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/5 to-transparent" />
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card-muted/60 px-3 py-1 text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="size-2 rounded-full bg-accent" />
            Entorno privado
          </div>

          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.26em] text-muted-foreground">
              approvedlawyer-case-platform
            </p>
            <h1 className="section-title max-w-sm font-semibold text-white">
              Acceso privado a tu dossier
            </h1>
            <p className="max-w-md text-sm leading-7 text-muted-foreground">
              Ingresa tu correo para recibir un código seguro. Desde allí
              podrás validar tu acceso, crear tu perfil y continuar con la
              solicitud de análisis preliminar.
            </p>
          </div>

          <AuthForm
            initialError={error}
            initialMessage={error ? undefined : message}
            disabled={!hasPortalAuthEnv}
          />

          {!hasPortalAuthEnv ? (
            <div className="rounded-2xl border border-border/80 bg-background-elevated/70 p-4 text-sm leading-6 text-muted-foreground">
              Configura `NEXT_PUBLIC_SUPABASE_URL`,
              `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` y
              `AUTH_OTP_SECRET` para habilitar el envío real de códigos.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
