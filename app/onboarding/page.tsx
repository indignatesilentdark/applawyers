import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { requirePortalUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const { admin, user } = await requirePortalUser();

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell flex items-center py-8">
      <OnboardingForm email={user.email} />
    </main>
  );
}
