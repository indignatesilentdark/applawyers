import { investigateBlockchain } from "@/lib/investigation/blockchain";
import { investigateDomain } from "@/lib/investigation/domain";
import { investigateEvidence } from "@/lib/investigation/evidence";
import { investigatePublicIntel } from "@/lib/investigation/public-intel";
import { investigateRegulators } from "@/lib/investigation/regulators";
import { calculateInvestigationScore } from "@/lib/investigation/scoring";
import {
  buildTimelineStep,
  splitMultiValueField,
} from "@/lib/investigation/shared";
import type {
  CaseEvidenceRow,
  CaseRow,
  InvestigationFinding,
  InvestigationResultRowPayload,
  StructuredReport,
} from "@/lib/types";

function normalizeSeverity(
  value: "Bajo" | "Medio" | "Alto" | "Baja" | "Media" | "Alta",
): "Baja" | "Media" | "Alta" {
  if (value === "Alto" || value === "Alta") {
    return "Alta";
  }

  if (value === "Medio" || value === "Media") {
    return "Media";
  }

  return "Baja";
}

function buildExecutiveSummary(
  caseRow: CaseRow,
  investigation: InvestigationResultRowPayload,
) {
  return [
    `El caso reporta un posible esquema de ${caseRow.fraud_type ?? "fraude financiero"} asociado a ${caseRow.company_name ?? "una plataforma no identificada"}.`,
    `El riesgo preliminar estimado es ${investigation.score_result.recommendedPriority.toLowerCase()} con un índice de ${investigation.score_result.preliminaryCaseIndex}/100.`,
    investigation.regulatory_result.summary,
    investigation.public_intel_result.summary,
  ].join(" ");
}

function buildFindings(
  investigation: InvestigationResultRowPayload,
): InvestigationFinding[] {
  const findings: InvestigationFinding[] = [];

  findings.push({
    confidence: investigation.score_result.fraudRiskScore / 100,
    explanation: `Riesgo preliminar estimado de fraude: ${investigation.score_result.fraudRiskScore}/100.`,
    severity:
      investigation.score_result.fraudRiskScore >= 70
        ? "Alta"
        : investigation.score_result.fraudRiskScore >= 40
          ? "Media"
          : "Baja",
    source: "Motor de scoring",
    sourceStatus: "verified",
    title: "Riesgo preliminar del caso",
    type: "scoring",
  });

  findings.push({
    confidence: investigation.blockchain_result.confidenceScore / 100,
    explanation: investigation.blockchain_result.traceabilityReasons.join(" "),
    severity: investigation.blockchain_result.traceabilityLevel,
    source: "Análisis blockchain",
    sourceStatus: investigation.blockchain_result.sources[0]?.status ?? "not_verified",
    sourceUrl: investigation.blockchain_result.sources[0]?.url,
    title: "Trazabilidad on-chain",
    type: "blockchain",
  });

  findings.push({
    confidence: investigation.domain_result.status === "verified" ? 0.8 : 0.3,
    explanation: investigation.domain_result.riskExplanation,
    severity: normalizeSeverity(investigation.domain_result.riskLevel),
    source: "Investigación de dominio",
    sourceStatus: investigation.domain_result.status,
    title: "Riesgo de dominio",
    type: "domain",
  });

  findings.push({
    confidence: investigation.public_intel_result.confidenceScore,
    explanation: investigation.public_intel_result.summary,
    severity: normalizeSeverity(investigation.public_intel_result.reputationRisk),
    source: "Señales públicas",
    sourceStatus: investigation.public_intel_result.sources[0]?.status ?? "not_verified",
    title: "Reputación pública",
    type: "public_intel",
  });

  if (investigation.regulatory_result.matches.some((item) => item.status === "advertido")) {
    findings.push({
      confidence: 0.86,
      explanation: "Se detectaron coincidencias de advertencia o alerta en fuentes regulatorias consultadas.",
      severity: "Alta",
      source: "Búsqueda regulatoria",
      sourceStatus: "verified",
      title: "Coincidencia regulatoria relevante",
      type: "regulatory",
    });
  } else {
    findings.push({
      confidence: 0.34,
      explanation: "No se encontró coincidencia en las fuentes consultadas.",
      severity: "Media",
      source: "Búsqueda regulatoria",
      sourceStatus: investigation.regulatory_result.sources[0]?.status ?? "not_verified",
      title: "Resultado regulatorio preliminar",
      type: "regulatory",
    });
  }

  const evidenceNeedingReview = investigation.evidence_result.filter(
    (item) => item.requiresHumanReview,
  ).length;
  findings.push({
    confidence: 0.72,
    explanation:
      evidenceNeedingReview > 0
        ? `${evidenceNeedingReview} evidencias requieren revisión humana para extraer más información.`
        : "La evidencia cargada pudo clasificarse automáticamente a nivel preliminar.",
    severity: evidenceNeedingReview > 0 ? "Media" : "Baja",
    source: "Análisis de evidencias",
    sourceStatus: evidenceNeedingReview > 0 ? "requires_human_review" : "verified",
    title: "Calidad y lectura de evidencia",
    type: "evidence",
  });

  return findings.slice(0, 6);
}

export async function runCaseInvestigation(
  caseRow: CaseRow,
  evidenceRows: CaseEvidenceRow[],
): Promise<{
  investigation: InvestigationResultRowPayload;
  report: StructuredReport;
}> {
  const relevantUrls = splitMultiValueField(caseRow.relevant_urls);
  const platformLinks = splitMultiValueField(caseRow.platform_links);
  const wallets = splitMultiValueField(caseRow.wallets);
  const hashes = splitMultiValueField(caseRow.transaction_hashes);

  const blockchain = await investigateBlockchain({
    transactionHash: hashes[0] ?? null,
    walletAddress: wallets[0] ?? null,
  });

  const domain = await investigateDomain({
    platformDomain: relevantUrls[0] ?? platformLinks[0] ?? caseRow.company_name,
    platformName: caseRow.company_name,
  });

  const regulatory = await investigateRegulators({
    country: caseRow.country,
    platformDomain: domain.domain,
    platformName: caseRow.company_name,
  });

  const publicIntel = await investigatePublicIntel({
    platformDomain: domain.domain ?? relevantUrls[0] ?? platformLinks[0] ?? null,
    platformName: caseRow.company_name,
    supportEmails: caseRow.company_emails,
    supportPhones: caseRow.phones_or_users,
  });

  const evidence = await investigateEvidence(evidenceRows);
  const score = calculateInvestigationScore({
    blockchain,
    caseRow,
    domain,
    evidence,
    publicIntel,
    regulatory,
  });

  const timeline = [
    buildTimelineStep("case_created", "Caso creado", "El expediente fue registrado.", "completed"),
    buildTimelineStep("blockchain", "Analizando wallet", "Consulta preliminar de wallet y hash.", blockchain.sources.some((item) => item.status === "verified") ? "completed" : "partial"),
    buildTimelineStep("domain", "Verificando dominio", "Revisión WHOIS y madurez registral.", domain.status === "verified" ? "completed" : "partial"),
    buildTimelineStep("regulators", "Consultando reguladores", "Búsqueda prudente en fuentes regulatorias.", regulatory.sources.some((item) => item.status === "verified") ? "completed" : "partial"),
    buildTimelineStep("public_intel", "Buscando señales públicas", "Revisión de señales públicas disponibles.", publicIntel.sources.some((item) => item.status === "verified") ? "completed" : "partial"),
    buildTimelineStep("evidence", "Analizando evidencias", "Clasificación preliminar de archivos aportados.", evidence.length ? "completed" : "partial"),
    buildTimelineStep("scoring", "Generando scoring", "Consolidación de riesgo, trazabilidad y prioridad.", "completed"),
    buildTimelineStep("report", "Informe listo", "Se preparó el dossier preliminar.", "completed"),
  ];

  const status =
    [blockchain, domain].some((item) =>
      "status" in item ? item.status === "source_unavailable" : false,
    ) || !regulatory.sources.some((item) => item.status === "verified")
      ? "partial"
      : "completed";

  const investigation: InvestigationResultRowPayload = {
    blockchain_result: blockchain,
    domain_result: domain,
    evidence_result: evidence,
    findings: [],
    public_intel_result: publicIntel,
    regulatory_result: regulatory,
    score_result: score,
    sources: [
      ...blockchain.sources,
      ...domain.sources,
      ...regulatory.sources,
      ...publicIntel.sources,
    ],
    status,
    timeline,
  };

  const findings = buildFindings(investigation);
  investigation.findings = findings;

  const report: StructuredReport = {
    complexity:
      score.legalComplexity === "Alta"
        ? "Alto"
        : score.legalComplexity === "Media"
          ? "Medio"
          : "Bajo",
    chronology: [
      `Inicio reportado: ${caseRow.start_date ?? "No especificado"}.`,
      `Canal de contacto principal: ${caseRow.contact_method ?? "No especificado"}.`,
      `Momento de sospecha: ${caseRow.suspicion_moment ?? "No especificado"}.`,
    ],
    disclaimer:
      "Este reporte combina análisis automatizado, fuentes públicas y evidencias proporcionadas. No sustituye revisión legal humana.",
    evidenceAnalysis: evidence.map(
      (item) => `${item.fileName}: ${item.summary} Utilidad probatoria ${item.probativeValue}.`,
    ),
    executiveSummary: buildExecutiveSummary(caseRow, investigation),
    findings,
    investigation,
    lawyerReviewItems: [
      "Validar titularidad de las cuentas o wallets relacionadas.",
      "Revisar material probatorio visual o auditivo no extraído automáticamente.",
      "Contrastar jurisdicción, advertencias regulatorias y posibles rutas de reclamación.",
    ],
    missingInformation: [
      "Comprobantes bancarios o extractos completos.",
      "Conversaciones con fechas visibles y soporte de identidad de la contraparte.",
      "Contratos, términos o documentos enviados por la plataforma.",
    ],
    nextSteps: [
      "Preservar accesos, correos, comprobantes y comunicaciones relevantes.",
      "Evitar pagos adicionales de recuperación sin validación profesional.",
      "Escalar a revisión humana si faltan fuentes verificadas o evidencia crítica.",
    ],
    recommendedDocuments: [
      "Extractos bancarios o comprobantes de transferencia.",
      "Capturas de dashboard con fecha visible.",
      "Hash de transacción y dirección wallet completa.",
    ],
    redFlags: findings
      .filter((item) => item.severity !== "Baja")
      .map((item) => item.title),
    traceabilityRoutes: blockchain.traceabilityReasons,
    urgentActions: [
      "No realizar pagos adicionales de recuperación.",
      "Guardar evidencia original sin editar.",
      "Cambiar credenciales si la plataforma tuvo acceso remoto.",
    ],
  };

  return { investigation, report };
}
