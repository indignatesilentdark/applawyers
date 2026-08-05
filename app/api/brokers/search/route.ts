import { NextResponse } from "next/server";
import { requirePortalUser } from "@/lib/portal-auth";
import { normalizeSearchValue } from "@/lib/utils";

type BrokerMatch = {
  id: string;
  matchReason: string;
  name: string;
  riskLevel: string;
  status: string;
};

export async function GET(request: Request) {
  try {
    await requirePortalUser();
    const { searchParams } = new URL(request.url);
    const query = `${searchParams.get("q") ?? ""}`.trim();
    const normalizedQuery = normalizeSearchValue(query);

    if (normalizedQuery.length < 3) {
      return NextResponse.json({ matches: [] satisfies BrokerMatch[] });
    }

    const { admin } = await requirePortalUser();
    const { data: brokers, error } = await admin
      .from("flagged_brokers")
      .select("id, name, aliases, risk_level, status")
      .order("updated_at", { ascending: false })
      .limit(40);

    if (error) {
      throw error;
    }

    const matches = (brokers ?? [])
      .map((broker) => {
        const normalizedName = normalizeSearchValue(broker.name ?? "");
        const aliasList = Array.isArray(broker.aliases) ? broker.aliases : [];
        const normalizedAliases = aliasList
          .map((alias) => normalizeSearchValue(`${alias ?? ""}`))
          .filter(Boolean);

        let matchReason = "";
        if (normalizedName === normalizedQuery) {
          matchReason = "Coincidencia exacta por nombre";
        } else if (normalizedAliases.includes(normalizedQuery)) {
          matchReason = "Coincidencia exacta por alias";
        } else if (
          normalizedName.includes(normalizedQuery) ||
          normalizedQuery.includes(normalizedName)
        ) {
          matchReason = "Coincidencia cercana por nombre";
        } else if (
          normalizedAliases.some(
            (alias) => alias.includes(normalizedQuery) || normalizedQuery.includes(alias),
          )
        ) {
          matchReason = "Coincidencia cercana por alias";
        }

        if (!matchReason) {
          return null;
        }

        return {
          id: broker.id,
          matchReason,
          name: broker.name,
          riskLevel: broker.risk_level ?? "medio",
          status: broker.status ?? "observacion",
        } satisfies BrokerMatch;
      })
      .filter((item): item is BrokerMatch => Boolean(item))
      .slice(0, 5);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No pudimos buscar entidades reportadas." },
      { status: 500 },
    );
  }
}
