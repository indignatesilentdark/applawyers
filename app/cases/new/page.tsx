import { redirect } from "next/navigation";
import { CaseWizard } from "@/components/case-wizard";
import { DashboardShell } from "@/components/dashboard-shell";
import { requirePortalUser } from "@/lib/auth";

export default async function NewCasePage() {
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
      title="Crear nuevo caso"
      eyebrow="Solicitud privada"
      profile={profile}
    >
      <CaseWizard />
    </DashboardShell>
  );
}
