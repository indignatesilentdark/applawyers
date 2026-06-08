import type {
  BlockchainInvestigationResult,
  CaseRow,
  DomainInvestigationResult,
  EvidenceInvestigationResult,
  InvestigationScore,
  PublicIntelResult,
  RegulatoryInvestigationResult,
} from "@/lib/types";
import { clampScore } from "@/lib/investigation/shared";

type ScoringInput = {
  blockchain: BlockchainInvestigationResult;
  caseRow: CaseRow;
  domain: DomainInvestigationResult;
  evidence: EvidenceInvestigationResult[];
  publicIntel: PublicIntelResult;
  regulatory: RegulatoryInvestigationResult;
};

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateInvestigationScore({
  blockchain,
  caseRow,
  domain,
  evidence,
  publicIntel,
  regulatory,
}: ScoringInput): InvestigationScore {
  const explanations: string[] = [];
  let fraudRiskScore = 15;
  let traceabilityScore = blockchain.transactionCount > 0 ? 45 : 15;
  let recoveryScamRiskScore = caseRow.recovery_offer_received ? 60 : 10;

  if ((caseRow.suspicion_moment ?? "").toLowerCase().includes("reti")) {
    fraudRiskScore += 14;
    explanations.push("Se reporta imposibilidad de retiro o bloqueo de fondos.");
  }

  if ((caseRow.promise ?? "").toLowerCase().includes("rent")) {
    fraudRiskScore += 10;
    explanations.push("Se describen promesas de rentabilidad.");
  }

  if ((caseRow.contact_method ?? "").toLowerCase().includes("llamad")) {
    fraudRiskScore += 8;
    explanations.push("La comunicación por llamadas eleva la opacidad del caso.");
  }

  if ((caseRow.payment_method ?? "").toLowerCase().includes("cripto")) {
    fraudRiskScore += 12;
    traceabilityScore += 10;
    explanations.push("El uso de criptoactivos incrementa el riesgo y la necesidad de trazabilidad técnica.");
  }

  if ((caseRow.steps_followed ?? "").toLowerCase().includes("trader")) {
    fraudRiskScore += 8;
    explanations.push("Se reporta figura de 'trader personal' o intermediación similar.");
  }

  if (caseRow.recovery_offer_received) {
    fraudRiskScore += 12;
    recoveryScamRiskScore += 24;
    explanations.push("Existe oferta de recuperación con potencial de segunda estafa.");
  }

  if (regulatory.matches.some((item) => item.status === "advertido")) {
    fraudRiskScore += 18;
    explanations.push("Aparecen coincidencias de advertencia regulatoria.");
  }

  if (domain.riskLevel === "Alto") {
    fraudRiskScore += 10;
    explanations.push("El dominio presenta señales de riesgo o baja madurez registral.");
  }

  if (publicIntel.reputationRisk === "Alto") {
    fraudRiskScore += 12;
    explanations.push("Se detectaron señales públicas negativas relevantes.");
  }

  if (blockchain.traceabilityLevel === "Alta") {
    traceabilityScore += 25;
    explanations.push("La actividad on-chain tiene mejor trazabilidad preliminar.");
  } else if (blockchain.traceabilityLevel === "Media") {
    traceabilityScore += 15;
  } else {
    traceabilityScore += 5;
  }

  if (blockchain.contractInteractionDetected) {
    traceabilityScore -= 8;
    explanations.push("La interacción con contratos puede complejizar el seguimiento.");
  }

  const evidenceQualityScore = clampScore(
    average(
      evidence.map((item) =>
        item.probativeValue === "Alta"
          ? 80
          : item.probativeValue === "Media"
            ? 55
            : 28,
      ),
    ) || 18,
  );

  const preliminaryCaseIndex = clampScore(
    average([fraudRiskScore, traceabilityScore, evidenceQualityScore, recoveryScamRiskScore]),
  );

  const legalComplexity =
    preliminaryCaseIndex >= 70 || traceabilityScore < 35
      ? "Alta"
      : preliminaryCaseIndex >= 40
        ? "Media"
        : "Baja";

  const recommendedPriority =
    preliminaryCaseIndex >= 70
      ? "Alta"
      : preliminaryCaseIndex >= 45
        ? "Media"
        : "Baja";

  explanations.push(
    "Este scoring es preliminar y combina narrativa, fuentes públicas, señales técnicas y calidad de evidencia.",
  );

  return {
    evidenceQualityScore,
    explanations,
    fraudRiskScore: clampScore(fraudRiskScore),
    legalComplexity,
    preliminaryCaseIndex,
    recommendedPriority,
    recoveryScamRiskScore: clampScore(recoveryScamRiskScore),
    traceabilityScore: clampScore(traceabilityScore),
  };
}
