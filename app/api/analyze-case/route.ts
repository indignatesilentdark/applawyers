import { NextResponse } from "next/server";
import { analyzeAndPersistCase } from "@/lib/cases";
import { requirePortalUser } from "@/lib/portal-auth";

export async function POST(request: Request) {
  try {
    const { admin, user } = await requirePortalUser();

    const body = (await request.json()) as { caseId?: string };
    if (!body.caseId) {
      return NextResponse.json(
        { error: "caseId is required" },
        { status: 400 },
      );
    }

    const report = await analyzeAndPersistCase(body.caseId, user.id, admin);

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to analyze case" },
      { status: 500 },
    );
  }
}
