import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RegisterAccountForm } from "@/components/register-account-form";
import { findCountryNameByIsoCode } from "@/lib/countries";
import { getPortalSession } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await getPortalSession();

  if (session) {
    redirect("/dashboard");
  }

  const headersList = await headers();
  const countryCode = headersList.get("x-vercel-ip-country")?.toUpperCase();
  const initialCountry = findCountryNameByIsoCode(countryCode);

  return (
    <main className="page-shell page-shell-centered flex items-center py-8 lg:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <RegisterAccountForm initialCountry={initialCountry} />
      </div>
    </main>
  );
}
