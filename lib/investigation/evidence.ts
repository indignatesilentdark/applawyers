import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { CaseEvidenceRow, EvidenceInvestigationResult } from "@/lib/types";
import {
  buildEmptyEntities,
  extractEntitiesFromText,
  summarizeText,
} from "@/lib/investigation/shared";

function inferProbativeValue(params: {
  entityCount: number;
  fileType: string;
  hasExtractedText: boolean;
}) {
  if (
    params.entityCount >= 4 ||
    params.fileType.includes("pdf") ||
    params.fileType.includes("json")
  ) {
    return "Alta" as const;
  }

  if (params.entityCount >= 2 || params.hasExtractedText) {
    return "Media" as const;
  }

  return "Baja" as const;
}

async function tryReadStorageText(filePath: string) {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.storage.from("case-evidence").download(filePath);

  if (error || !data) {
    return null;
  }

  const mimeType = data.type.toLowerCase();

  if (
    mimeType.startsWith("text/") ||
    mimeType.includes("json") ||
    mimeType.includes("csv")
  ) {
    return await data.text();
  }

  return null;
}

export async function investigateEvidence(
  evidenceRows: CaseEvidenceRow[],
): Promise<EvidenceInvestigationResult[]> {
  const results: EvidenceInvestigationResult[] = [];

  for (const evidence of evidenceRows) {
    const fileType = (evidence.file_type ?? "archivo").toLowerCase();
    const extractedText = await tryReadStorageText(evidence.file_path);
    const detectedEntities = extractedText
      ? extractEntitiesFromText(extractedText)
      : buildEmptyEntities();
    const entityCount = Object.values(detectedEntities).reduce(
      (count, items) => count + items.length,
      0,
    );
    const requiresHumanReview =
      !extractedText && (fileType.includes("image") || fileType.includes("pdf") || fileType.includes("audio"));
    const sourceStatus = extractedText
      ? "verified"
      : requiresHumanReview
        ? "requires_human_review"
        : "not_verified";

    const riskSignals = [];
    if (detectedEntities.wallets.length > 0) {
      riskSignals.push("Contiene wallets o direcciones financieras.");
    }
    if (detectedEntities.balances.length > 0) {
      riskSignals.push("Contiene montos o balances visibles.");
    }
    if (requiresHumanReview) {
      riskSignals.push("Requiere revisión humana para OCR, lectura visual o transcripción.");
    }

    const probativeValue = inferProbativeValue({
      entityCount,
      fileType,
      hasExtractedText: Boolean(extractedText),
    });

    results.push({
      detectedEntities,
      evidenceId: evidence.id,
      evidenceType: fileType,
      extractedText: extractedText ? summarizeText(extractedText, 420) : null,
      fileName: evidence.file_name,
      probativeValue,
      requiresHumanReview,
      riskSignals,
      sourceStatus,
      summary: extractedText
        ? "Se extrajo texto util para contraste preliminar."
        : requiresHumanReview
          ? "Archivo recibido, pero su lectura profunda requiere revisión humana."
          : "Archivo registrado sin extracción automática disponible.",
    });
  }

  return results;
}
