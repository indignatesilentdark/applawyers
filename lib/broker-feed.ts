import { env } from "@/lib/env";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeSearchValue } from "@/lib/utils";

type ExternalBrokerFeedItem = {
  brokerName: string;
  normalizedBrokerName: string;
  riskLevel: "bajo" | "medio" | "alto";
  sourceType: "wikifx_exposure" | "wikifx_public_signal";
  sourceUrl: string;
  title: string;
};

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function inferBrokerName(title: string) {
  const cleanedTitle = title
    .replace(/^["'¿¡\s]+|["'?!.,\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const candidates = [
    cleanedTitle.split(":")[0],
    cleanedTitle.split(" Queja")[0],
    cleanedTitle.split(" puntuación")[0],
    cleanedTitle.split(" calificación")[0],
    cleanedTitle.split(" ¿")[0],
    cleanedTitle.split(" es ")[0],
  ]
    .map((item) => item.trim())
    .filter(Boolean);

  return candidates[0] ?? cleanedTitle;
}

function inferRiskLevel(title: string, sourceUrl: string): ExternalBrokerFeedItem["riskLevel"] {
  const normalized = normalizeSearchValue(title);

  if (sourceUrl.includes("/exposure/detail/")) {
    return "alto";
  }

  if (
    normalized.includes("sin regulacion") ||
    normalized.includes("licencia revocada") ||
    normalized.includes("alerta") ||
    normalized.includes("bloqueos de retiro") ||
    normalized.includes("no puede retirar") ||
    normalized.includes("estafa")
  ) {
    return "alto";
  }

  if (
    normalized.includes("riesgo") ||
    normalized.includes("quejas") ||
    normalized.includes("dudas") ||
    normalized.includes("no autorizado")
  ) {
    return "medio";
  }

  return "bajo";
}

export async function fetchWikiFxFeed() {
  const sourceUrl = env.wikiFxFeedUrl ?? "https://www.wikifx.com/es/";
  const response = await fetch(sourceUrl, {
    headers: {
      "User-Agent":
        "ApproveLawyersBot/1.0 (+https://app.approvelawyers.com; broker-intelligence)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`No pudimos consultar WikiFX (${response.status}).`);
  }

  const html = await response.text();
  const linkPattern =
    /href="(\/es\/(?:newsdetail|exposure\/detail)\/[^"]+)"[^>]*>([^<]{3,220})</g;
  const seen = new Set<string>();
  const items: ExternalBrokerFeedItem[] = [];

  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(html)) !== null) {
    const rawPath = match[1];
    const rawTitle = decodeHtml(match[2]).trim();

    if (!rawTitle || seen.has(rawPath)) {
      continue;
    }

    const brokerName = inferBrokerName(rawTitle);
    const normalizedBrokerName = normalizeSearchValue(brokerName);

    if (normalizedBrokerName.length < 3) {
      continue;
    }

    seen.add(rawPath);

    items.push({
      brokerName,
      normalizedBrokerName,
      riskLevel: inferRiskLevel(rawTitle, rawPath),
      sourceType: rawPath.includes("/exposure/detail/")
        ? "wikifx_exposure"
        : "wikifx_public_signal",
      sourceUrl: new URL(rawPath, sourceUrl).toString(),
      title: rawTitle,
    });
  }

  return items.slice(0, 50);
}

export async function syncWikiFxFeed(admin: SupabaseClient) {
  const items = await fetchWikiFxFeed();

  if (!items.length) {
    return { createdFeeds: 0, upsertedBrokers: 0 };
  }

  const { error: feedError } = await admin.from("external_broker_feeds").upsert(
    items.map((item) => ({
      broker_name: item.brokerName,
      normalized_broker_name: item.normalizedBrokerName,
      risk_level: item.riskLevel,
      source_name: "WikiFX",
      source_type: item.sourceType,
      source_url: item.sourceUrl,
      title: item.title,
    })),
    { onConflict: "source_url" },
  );

  if (feedError) {
    throw feedError;
  }

  const { error: flaggedError } = await admin.from("flagged_brokers").upsert(
    items.map((item) => ({
      aliases: [],
      country: "Global",
      domains: [],
      emails: [],
      name: item.brokerName,
      normalized_name: item.normalizedBrokerName,
      phones: [],
      risk_level: item.riskLevel,
      source_note: `${item.title} | Fuente: ${item.sourceUrl}`,
      source_type: item.sourceType,
      status: "observacion",
    })),
    { onConflict: "normalized_name" },
  );

  if (flaggedError) {
    throw flaggedError;
  }

  return {
    createdFeeds: items.length,
    upsertedBrokers: items.length,
  };
}
