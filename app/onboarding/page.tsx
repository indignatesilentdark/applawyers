import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { requirePortalUser } from "@/lib/auth";

const COUNTRY_BY_ISO_CODE: Record<string, string> = {
  AR: "Argentina",
  BO: "Bolivia",
  BR: "Brasil",
  CL: "Chile",
  CO: "Colombia",
  CR: "Costa Rica",
  CU: "Cuba",
  EC: "Ecuador",
  ES: "Espana",
  GT: "Guatemala",
  HN: "Honduras",
  HT: "Haiti",
  MX: "Mexico",
  NI: "Nicaragua",
  PA: "Panama",
  PE: "Peru",
  PY: "Paraguay",
  SV: "El Salvador",
  US: "Estados Unidos",
  UY: "Uruguay",
  VE: "Venezuela",
};

export default async function OnboardingPage() {
  const { admin, user } = await requirePortalUser();
  const headersList = await headers();
  const countryCode = headersList.get("x-vercel-ip-country")?.toUpperCase();
  const initialCountry = countryCode
    ? COUNTRY_BY_ISO_CODE[countryCode]
    : undefined;

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
      <OnboardingForm email={user.email} initialCountry={initialCountry} />
    </main>
  );
}
