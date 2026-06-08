import { env } from "@/lib/env";
import type { DomainInvestigationResult, InvestigationSource } from "@/lib/types";
import {
  createSource,
  DEFAULT_NOTE_NO_VERIFICATION,
  fetchJsonWithTimeout,
  getDomainFromText,
} from "@/lib/investigation/shared";

type DomainInput = {
  platformDomain?: string | null;
  platformName?: string | null;
};

type WhoisPayload = {
  WhoisRecord?: {
    createdDate?: string;
    domainName?: string;
    estimatedDomainAge?: number;
    expiresDate?: string;
    nameServers?: {
      hostNames?: string[];
    };
    registrarName?: string;
    registrant?: {
      country?: string;
    };
    status?: string;
  };
};

export async function investigateDomain({
  platformDomain,
  platformName,
}: DomainInput): Promise<DomainInvestigationResult> {
  const domain =
    getDomainFromText(platformDomain) ??
    getDomainFromText(platformName) ??
    null;
  const sources: InvestigationSource[] = [];

  const fallback: DomainInvestigationResult = {
    country: null,
    createdAt: null,
    domain,
    domainAgeDays: null,
    domainFound: Boolean(domain),
    expiresAt: null,
    nameservers: [],
    notes: [],
    privacyProtection: "No verificado",
    registrar: null,
    riskExplanation: domain
      ? "No verificado. Fuente no disponible o integracion no configurada."
      : "No se recibio un dominio valido para investigar.",
    riskLevel: "Medio",
    sources,
    status: domain ? "not_verified" : "requires_human_review",
  };

  if (!domain) {
    sources.push(
      createSource("WHOIS", "requires_human_review", {
        note: "No fue posible extraer un dominio desde la informacion del caso.",
      }),
    );
    fallback.notes.push(
      "Requiere revisión humana: no se pudo identificar un dominio válido.",
    );
    return fallback;
  }

  if (!env.whoisXmlApiKey) {
    sources.push(
      createSource("WhoisXML API", "not_verified", {
        note: DEFAULT_NOTE_NO_VERIFICATION,
      }),
    );
    fallback.notes.push(
      "Dominio detectado pero sin verificación WHOIS conectada.",
    );
    return fallback;
  }

  try {
    const url = new URL("https://www.whoisxmlapi.com/whoisserver/WhoisService");
    url.searchParams.set("apiKey", env.whoisXmlApiKey);
    url.searchParams.set("domainName", domain);
    url.searchParams.set("outputFormat", "JSON");

    const payload = await fetchJsonWithTimeout<WhoisPayload>(url.toString());
    const record = payload.WhoisRecord;

    sources.push(
      createSource("WhoisXML API", "verified", {
        url: `https://www.whoisxmlapi.com/`,
      }),
    );

    const createdAt = record?.createdDate ?? null;
    const expiresAt = record?.expiresDate ?? null;
    const ageDays =
      createdAt != null
        ? Math.floor(
            (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
          )
        : record?.estimatedDomainAge ?? null;
    const privacy =
      record?.status?.toLowerCase().includes("privacy") ||
      record?.registrarName?.toLowerCase().includes("privacy")
        ? "Activa"
        : "Inactiva";

    const riskLevel =
      ageDays != null && ageDays < 180 ? "Alto" : ageDays != null && ageDays < 365 ? "Medio" : "Bajo";

    return {
      country: record?.registrant?.country ?? null,
      createdAt,
      domain,
      domainAgeDays: ageDays,
      domainFound: true,
      expiresAt,
      nameservers: record?.nameServers?.hostNames ?? [],
      notes: ageDays != null ? [`Dominio con antigüedad aproximada de ${ageDays} días.`] : [],
      privacyProtection: privacy,
      registrar: record?.registrarName ?? null,
      riskExplanation:
        riskLevel === "Alto"
          ? "Dominio joven o con poca madurez registral, lo que incrementa el riesgo preliminar."
          : riskLevel === "Medio"
            ? "El dominio existe, pero su antigüedad o disponibilidad parcial amerita cautela."
            : "El dominio presenta antigüedad suficiente para reducir riesgo técnico, sin excluir otras alertas.",
      riskLevel,
      sources,
      status: "verified",
    };
  } catch (error) {
    sources.push(
      createSource("WhoisXML API", "source_unavailable", {
        note:
          error instanceof Error
            ? error.message
            : "Fuente no disponible temporalmente.",
      }),
    );
    fallback.notes.push("Fuente WHOIS no disponible. Requiere revisión humana.");
    return {
      ...fallback,
      status: "source_unavailable",
    };
  }
}
