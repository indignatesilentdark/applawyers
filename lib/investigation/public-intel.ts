import { env } from "@/lib/env";
import type {
  InvestigationSource,
  PublicIntelMention,
  PublicIntelResult,
} from "@/lib/types";
import {
  clampScore,
  createSource,
  DEFAULT_NOTE_NO_VERIFICATION,
  fetchJsonWithTimeout,
  getDomainFromText,
  splitMultiValueField,
} from "@/lib/investigation/shared";

type PublicIntelInput = {
  platformDomain?: string | null;
  platformName?: string | null;
  supportEmails?: string | null;
  supportPhones?: string | null;
};

function buildQueries(input: PublicIntelInput) {
  const domain = getDomainFromText(input.platformDomain);
  const phone = splitMultiValueField(input.supportPhones)[0];
  const email = splitMultiValueField(input.supportEmails)[0];
  const platform = input.platformName?.trim();

  return [
    platform ? `${platform} scam` : null,
    platform ? `${platform} withdrawal problem` : null,
    domain ? `${domain} fraud` : null,
    domain ? `${domain} warning` : null,
    phone ? `"${phone}" reviews` : null,
    email ? `"${email}" warning` : null,
  ].filter((item): item is string => Boolean(item));
}

function classifyMention(title: string, description: string): PublicIntelMention["kind"] {
  const haystack = `${title} ${description}`.toLowerCase();
  if (
    haystack.includes("scam") ||
    haystack.includes("fraud") ||
    haystack.includes("warning") ||
    haystack.includes("withdrawal problem")
  ) {
    return "negative";
  }

  if (haystack.includes("alert")) {
    return "warning";
  }

  return "neutral";
}

export async function investigatePublicIntel(
  input: PublicIntelInput,
): Promise<PublicIntelResult> {
  const sources: InvestigationSource[] = [];
  const queries = buildQueries(input);
  const fallback: PublicIntelResult = {
    confidenceScore: 0.16,
    negativeMentions: 0,
    neutralMentions: 0,
    notes: [],
    relevantMentions: [],
    reputationRisk: "Medio",
    sources,
    summary: "No verificado. Fuente no disponible o integracion no configurada.",
  };

  if (!queries.length) {
    sources.push(
      createSource("Intel pública", "requires_human_review", {
        note: "No hay suficientes identificadores públicos para buscar señales externas.",
      }),
    );
    fallback.summary = "Requiere revisión humana.";
    return fallback;
  }

  if (!env.searchApiKey) {
    sources.push(
      createSource("Brave Search", "not_verified", {
        note: DEFAULT_NOTE_NO_VERIFICATION,
      }),
    );
    return fallback;
  }

  const relevantMentions: PublicIntelMention[] = [];

  for (const queryText of queries.slice(0, 4)) {
    try {
      const url = new URL("https://api.search.brave.com/res/v1/web/search");
      url.searchParams.set("q", queryText);
      url.searchParams.set("count", "5");

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
      sources.push(
        createSource("Brave Search", "verified", {
          note: `Consulta: ${queryText}`,
        }),
      );

      for (const result of results.slice(0, 2)) {
        if (!result.url || !result.title) {
          continue;
        }

        relevantMentions.push({
          kind: classifyMention(result.title, result.description ?? ""),
          title: result.title,
          url: result.url,
        });
      }
    } catch (error) {
      sources.push(
        createSource("Brave Search", "source_unavailable", {
          note:
            error instanceof Error
              ? error.message
              : "Fuente no disponible temporalmente.",
        }),
      );
    }
  }

  const negativeMentions = relevantMentions.filter((item) => item.kind === "negative").length;
  const neutralMentions = relevantMentions.filter((item) => item.kind === "neutral").length;
  const warningMentions = relevantMentions.filter((item) => item.kind === "warning").length;
  const riskScore = clampScore(negativeMentions * 25 + warningMentions * 18 + neutralMentions * 5);

  return {
    confidenceScore: clampScore(riskScore) / 100,
    negativeMentions,
    neutralMentions,
    notes: [
      "Las menciones públicas son señales informativas y no sustituyen evidencia legal verificable.",
    ],
    relevantMentions,
    reputationRisk: riskScore >= 60 ? "Alto" : riskScore >= 30 ? "Medio" : "Bajo",
    sources,
    summary:
      relevantMentions.length > 0
        ? `Se identificaron ${negativeMentions} menciones negativas y ${neutralMentions} neutrales en señales públicas consultadas.`
        : "No se encontraron señales públicas relevantes en la consulta automatizada.",
  };
}
