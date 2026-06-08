import { RegisterForm } from "@/components/register-form";
import { getValidatedLeadTransfer } from "@/lib/leads";

export const dynamic = "force-dynamic";

type RegisterPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return typeof value === "string" ? value : "";
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = (await searchParams) ?? {};
  const leadId = getSingleParam(params, "lead_id");
  const token = getSingleParam(params, "token");

  if (!leadId || !token) {
    return (
      <main className="page-shell page-shell-centered flex items-center py-8 lg:py-12">
        <section className="glass-panel mx-auto w-full max-w-3xl rounded-[2rem] p-6 sm:p-8">
          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
            Registro seguro
          </p>
          <h1 className="section-title mt-3 font-semibold text-white">
            No pudimos validar tu solicitud
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">
            El enlace no incluye la información necesaria para asociar tu lead.
            Solicita uno nuevo desde el funnel o vuelve al acceso principal.
          </p>
        </section>
      </main>
    );
  }

  let lead = null;
  let errorMessage: string | null = null;

  try {
    lead = await getValidatedLeadTransfer(leadId, token);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "El enlace ya no es valido o necesita ser generado de nuevo.";
  }

  return (
    <main className="page-shell page-shell-centered flex items-center py-8 lg:py-12">
      {lead ? (
        <div className="mx-auto w-full max-w-3xl">
          <RegisterForm lead={lead} />
        </div>
      ) : (
        <section className="glass-panel mx-auto w-full max-w-3xl rounded-[2rem] p-6 sm:p-8">
          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
            Registro seguro
          </p>
          <h1 className="section-title mt-3 font-semibold text-white">
            No pudimos validar tu solicitud
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">
            {errorMessage}
          </p>
        </section>
      )}
    </main>
  );
}
