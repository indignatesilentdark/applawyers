import { AuthEntryScreen } from "@/components/auth-entry-screen";
import { hasPortalAuthEnv } from "@/lib/env";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : undefined;
  const error =
    typeof params.error === "string"
      ? message ??
        "No pudimos completar el acceso. Solicita un nuevo código e intenta de nuevo."
      : undefined;

  return (
    <AuthEntryScreen
      disabled={!hasPortalAuthEnv}
      error={error}
      message={error ? undefined : message}
    />
  );
}
