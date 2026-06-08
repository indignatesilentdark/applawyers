import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { requirePortalUser } from "@/lib/auth";
import { findCountryNameByIsoCode } from "@/lib/countries";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { admin, user } = await requirePortalUser();
  const headersList = await headers();
  const countryCode = headersList.get("x-vercel-ip-country")?.toUpperCase();
  const initialCountry = findCountryNameByIsoCode(countryCode);

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell page-shell-centered flex items-center py-8 lg:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <OnboardingForm email={user.email} initialCountry={initialCountry} />
      </div>
    </main>
  );
}
