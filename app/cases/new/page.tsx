import { redirect } from "next/navigation";
import { CaseWorkspaceShell } from "@/components/case-workspace-shell";
import { CaseWizard } from "@/components/case-wizard";
import { OnboardingRegistrationTracker } from "@/components/onboarding-registration-tracker";
import { isAdminEmail } from "@/lib/admin";
import { requirePortalUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewCasePage() {
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
    <CaseWorkspaceShell profile={profile}>
      <OnboardingRegistrationTracker />
      <CaseWizard />
    </CaseWorkspaceShell>
  );
}
