import { redirect } from "next/navigation";
import { AuthEntryScreen } from "@/components/auth-entry-screen";
import { hasPortalAuthEnv } from "@/lib/env";
import { getPortalSession, getPostAuthNextPath } from "@/lib/portal-auth";

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
    redirect(await getPostAuthNextPath(session.admin, session.user.id));
  }

  return (
    <AuthEntryScreen
      disabled={!hasPortalAuthEnv}
      error={error}
      message={error ? undefined : message}
    />
  );
}
