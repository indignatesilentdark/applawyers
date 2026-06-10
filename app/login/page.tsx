import { redirect } from "next/navigation";
import { AuthEntryScreen } from "@/components/auth-entry-screen";
import { hasPortalAuthEnv } from "@/lib/env";
import { getPortalSession } from "@/lib/portal-auth";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
    <AuthEntryScreen
      disabled={!hasPortalAuthEnv}
      error={error}
      message={error ? undefined : message}
    />
  );
}
