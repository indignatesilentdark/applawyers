import { NextResponse } from "next/server";
import { analyzeAndPersistCase } from "@/lib/cases";
import { requirePortalUser } from "@/lib/portal-auth";
import { slugifyFileName } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { admin, user } = await requirePortalUser();
    const formData = await request.formData();
    const payload = formData.get("payload");

    if (typeof payload !== "string") {
      return NextResponse.json(
        { error: "No recibimos la información del caso." },
        { status: 400 },
      );
    }

    const casePayload = JSON.parse(payload) as Record<string, string>;

    const { data: createdCase, error: caseError } = await admin
      .from("cases")
      .insert({
        company_emails: casePayload.companyEmails,
        company_name: casePayload.companyName,
        contact_method: casePayload.contactMethod,
        country: casePayload.country,
        currency: casePayload.currency,
        fraud_type: casePayload.fraudType,
        full_description: casePayload.fullDescription,
        lost_amount: Number(casePayload.lostAmount),
        phones_or_users: casePayload.phonesOrUsers,
        platform_links: casePayload.platformLinks,
        promise: casePayload.promise,
        relevant_urls: casePayload.relevantUrls,
        start_date: casePayload.startDate,
        status: "Pendiente",
        steps_followed: casePayload.stepsFollowed,
        suspicion_moment: casePayload.suspicionMoment,
        transaction_hashes: casePayload.transactionHashes,
        user_id: user.id,
        wallets: casePayload.wallets,
      })
      .select("id")
      .single();

    if (caseError || !createdCase) {
      throw caseError ?? new Error("No pudimos crear el caso.");
    }

    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File && item.size > 0);

    for (const file of files) {
      const sanitizedName = `${Date.now()}-${slugifyFileName(file.name)}`;
      const filePath = `${user.id}/${createdCase.id}/${sanitizedName}`;

      const { error: uploadError } = await admin.storage
        .from("case-evidence")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: evidenceError } = await admin.from("case_evidence").insert({
        case_id: createdCase.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        user_id: user.id,
      });

      if (evidenceError) {
        throw evidenceError;
      }
    }

    await analyzeAndPersistCase(createdCase.id, user.id, admin);

    return NextResponse.json({
      caseId: createdCase.id,
      ok: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No pudimos crear el caso." },
      { status: 500 },
    );
  }
}
