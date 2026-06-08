import type {
  EvidenceEntityMap,
  InvestigationSource,
  InvestigationStepStatus,
  InvestigationTimelineStep,
  VerificationStatus,
} from "@/lib/types";

export const DEFAULT_NOTE_NO_VERIFICATION =
  "No verificado. Fuente no disponible o integracion no configurada.";

export function nowIso() {
  return new Date().toISOString();
}

export function createSource(
  label: string,
  status: VerificationStatus,
  options: {
    note?: string;
    url?: string;
  } = {},
): InvestigationSource {
  return {
    checkedAt: nowIso(),
    label,
    note: options.note,
    status,
    url: options.url,
  };
}

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getDomainFromText(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(
    /(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)/i,
  );

  return match?.[1]?.toLowerCase() ?? null;
}

export function splitMultiValueField(value?: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function summarizeText(value: string, maxLength = 320) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildEmptyEntities(): EvidenceEntityMap {
  return {
    balances: [],
    dates: [],
    emails: [],
    phones: [],
    platformNames: [],
    wallets: [],
  };
}

export function extractEntitiesFromText(text: string): EvidenceEntityMap {
  const entities = buildEmptyEntities();
  const walletMatches =
    text.match(/\b0x[a-fA-F0-9]{40}\b/g) ??
    text.match(/\b(?:bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}\b/g) ??
    [];
  const emailMatches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  const phoneMatches = text.match(/\+?\d[\d\s().-]{7,}\d/g) ?? [];
  const dateMatches =
    text.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g) ??
    text.match(/\b\d{4}-\d{2}-\d{2}\b/g) ??
    [];
  const balanceMatches = text.match(/\b(?:USD|USDT|US\$|\$)\s?\d[\d.,]*/gi) ?? [];

  entities.wallets = uniqueValues(walletMatches);
  entities.emails = uniqueValues(emailMatches);
  entities.phones = uniqueValues(phoneMatches);
  entities.dates = uniqueValues(dateMatches);
  entities.balances = uniqueValues(balanceMatches);

  return entities;
}

export async function fetchJsonWithTimeout<T>(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {},
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function buildTimelineStep(
  code: InvestigationTimelineStep["code"],
  label: string,
  message: string,
  status: InvestigationStepStatus,
): InvestigationTimelineStep {
  return {
    code,
    label,
    message,
    status,
    updatedAt: nowIso(),
  };
}
