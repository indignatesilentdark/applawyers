import { AuthForm } from "@/components/auth-form";
import { hasPublicSupabaseEnv } from "@/lib/env";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const message =
    typeof params.message === "string"
      ? params.message
      : typeof params.error === "string"
        ? "No pudimos completar el acceso. Solicita un nuevo enlace e intenta de nuevo."
        : undefined;

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
              Ingresa tu correo para recibir un enlace seguro de acceso. Desde
              allí podrás crear tu perfil y continuar con la solicitud de
              análisis preliminar.
            </p>
          </div>

          <AuthForm
            initialMessage={message}
            disabled={!hasPublicSupabaseEnv}
          />

          {!hasPublicSupabaseEnv ? (
            <div className="rounded-2xl border border-border/80 bg-background-elevated/70 p-4 text-sm leading-6 text-muted-foreground">
              Configura `NEXT_PUBLIC_SUPABASE_URL` y
              `NEXT_PUBLIC_SUPABASE_ANON_KEY` para habilitar el envío real del
              Magic Link.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
