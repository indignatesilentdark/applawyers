import { AuthForm } from "@/components/auth-form";

type AuthEntryScreenProps = {
  disabled: boolean;
  error?: string;
  message?: string;
};

export function AuthEntryScreen({
  disabled,
  error,
  message,
}: AuthEntryScreenProps) {
  return (
    <main className="page-shell page-shell-centered flex items-center py-8 lg:py-12">
      <section className="auth-shell w-full">
        <div className="glass-panel desktop-hero-panel rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/5 to-transparent" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card-muted/60 px-3 py-1 text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                <span className="size-2 rounded-full bg-accent" />
                Entorno privado
              </div>

              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.26em] text-muted-foreground">
                  approvedlawyer-case-platform
                </p>
                <h1 className="section-title max-w-xl font-semibold text-white lg:text-[4.25rem]">
                  Acceso privado a tu dossier
                </h1>
                <p className="max-w-xl text-sm leading-7 text-muted-foreground lg:text-base lg:leading-8">
                  Ingresa tu correo para recibir un código seguro. Desde allí
                  podrás validar tu acceso, crear tu perfil y continuar con la
                  solicitud de análisis preliminar.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.35rem] border border-border/80 bg-background-elevated/60 p-4">
                <p className="text-[0.72rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Acceso
                </p>
                <p className="mt-3 text-lg font-semibold text-white">OTP por email</p>
              </div>
              <div className="rounded-[1.35rem] border border-border/80 bg-background-elevated/60 p-4">
                <p className="text-[0.72rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Flujo
                </p>
                <p className="mt-3 text-lg font-semibold text-white">Privado y guiado</p>
              </div>
              <div className="rounded-[1.35rem] border border-border/80 bg-background-elevated/60 p-4">
                <p className="text-[0.72rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Resultado
                </p>
                <p className="mt-3 text-lg font-semibold text-white">Dossier preliminar</p>
              </div>
            </div>
          </div>
        </div>

        <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <AuthForm
            initialError={error}
            initialMessage={error ? undefined : message}
            disabled={disabled}
          />

          {disabled ? (
            <div className="rounded-2xl border border-border/80 bg-background-elevated/70 p-4 text-sm leading-6 text-muted-foreground">
              Configura `NEXT_PUBLIC_SUPABASE_URL`,
              `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` y
              `AUTH_OTP_SECRET` para habilitar el envío real de códigos.
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
