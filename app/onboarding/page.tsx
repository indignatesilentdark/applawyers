import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { requireAuthenticatedUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const { supabase, user } = await requireAuthenticatedUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell flex items-center py-8">
      <OnboardingForm email={user.email ?? null} userId={user.id} />
    </main>
  );
}
