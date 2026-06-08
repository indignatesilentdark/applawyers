import { env } from "@/lib/env";
import type {
  InvestigationSource,
  RegulatoryInvestigationResult,
  RegulatoryMatch,
} from "@/lib/types";
import {
  createSource,
  DEFAULT_NOTE_NO_VERIFICATION,
  fetchJsonWithTimeout,
  getDomainFromText,
} from "@/lib/investigation/shared";

type RegulatorsInput = {
  country?: string | null;
  platformDomain?: string | null;
  platformName?: string | null;
};

const REGULATORS = [
  { label: "FCA Warning List", site: "fca.org.uk" },
  { label: "FCA Register", site: "register.fca.org.uk" },
  { label: "CNMV advertencias", site: "cnmv.es" },
  { label: "CySEC", site: "cysec.gov.cy" },
  { label: "ASIC", site: "asic.gov.au" },
  { label: "SEC investor alerts", site: "investor.gov" },
  { label: "IOSCO investor alerts", site: "iosco.org" },
];

function buildSearchQueries(platformName?: string | null, platformDomain?: string | null) {
  const domain = getDomainFromText(platformDomain);
  return REGULATORS.map((regulator) => ({
    query: `"${platformName ?? domain ?? ""}" site:${regulator.site}`,
    regulator,
  })).filter((entry) => entry.query.replace(/["\s]/g, "").length > 0);
}

export async function investigateRegulators({
  platformDomain,
  platformName,
}: RegulatorsInput): Promise<RegulatoryInvestigationResult> {
  const sources: InvestigationSource[] = [];
  const queries = buildSearchQueries(platformName, platformDomain);
  const fallback: RegulatoryInvestigationResult = {
    consultedRegulators: REGULATORS.map((item) => item.label),
    matches: [],
    notes: [],
    riskLevel: "Medio",
    sources,
    summary: "No se encontró coincidencia en las fuentes consultadas.",
  };

  if (!env.searchApiKey) {
    sources.push(
      createSource("Búsqueda regulatoria", "not_verified", {
        note: DEFAULT_NOTE_NO_VERIFICATION,
      }),
    );
    fallback.notes.push(
      "No se pudo automatizar la búsqueda en organismos regulatorios por falta de API de búsqueda.",
    );
    return fallback;
  }

  const matches: RegulatoryMatch[] = [];

  for (const entry of queries.slice(0, 4)) {
    try {
      const url = new URL("https://api.search.brave.com/res/v1/web/search");
      url.searchParams.set("q", entry.query);
      url.searchParams.set("count", "3");

      const payload = await fetchJsonWithTimeout<{
        web?: {
          results?: Array<{
            description?: string;
            title?: string;
            url?: string;
          }>;
        };
      }>(url.toString(), {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": env.searchApiKey,
        },
      });

      const results = payload.web?.results ?? [];
      const best = results[0];

      sources.push(
        createSource(entry.regulator.label, "verified", {
          url: best?.url,
        }),
      );

      if (!best) {
        matches.push({
          confidence: 0.18,
          label: entry.regulator.label,
          status: "no_encontrado",
          type: "sin_coincidencia",
        });
        continue;
      }

      const haystack = `${best.title ?? ""} ${best.description ?? ""}`.toLowerCase();
      const exactNeedle = platformName?.toLowerCase().trim();
      const partialNeedle = getDomainFromText(platformDomain);
      const exact = Boolean(exactNeedle && haystack.includes(exactNeedle));
      const partial = Boolean(partialNeedle && haystack.includes(partialNeedle));
      const warned =
        haystack.includes("warning") ||
        haystack.includes("alert") ||
        haystack.includes("unauthorised") ||
        haystack.includes("advertencia");

      matches.push({
        confidence: exact ? 0.88 : partial ? 0.63 : 0.34,
        label: entry.regulator.label,
        sourceUrl: best.url,
        status: warned ? "advertido" : exact || partial ? "autorizado" : "no_encontrado",
        type: exact ? "exacta" : partial ? "parcial" : "sin_coincidencia",
      });
    } catch (error) {
      sources.push(
        createSource(entry.regulator.label, "source_unavailable", {
          note:
            error instanceof Error
              ? error.message
              : "Fuente no disponible temporalmente.",
        }),
      );
      matches.push({
        confidence: 0.1,
        label: entry.regulator.label,
        status: "no_verificado",
        type: "sin_coincidencia",
      });
    }
  }

  const warnedCount = matches.filter((match) => match.status === "advertido").length;
  const riskLevel = warnedCount > 0 ? "Alto" : matches.some((m) => m.type === "parcial") ? "Medio" : "Bajo";

  return {
    consultedRegulators: REGULATORS.map((item) => item.label),
    matches,
    notes:
      warnedCount > 0
        ? ["Se detectaron coincidencias de advertencia en fuentes regulatorias consultadas."]
        : ["No se encontró coincidencia en las fuentes consultadas."],
    riskLevel,
    sources,
    summary:
      warnedCount > 0
        ? "Se detectaron alertas o coincidencias regulatorias que requieren validación humana."
        : "No se encontró coincidencia en las fuentes consultadas.",
  };
}
