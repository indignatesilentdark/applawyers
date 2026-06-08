import { env, hasOpenAIEnv } from "@/lib/env";
import type { CaseEvidenceRow, CaseRow, StructuredReport } from "@/lib/types";

const reportSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "executiveSummary",
    "chronology",
    "redFlags",
    "evidenceAnalysis",
    "traceabilityRoutes",
    "missingInformation",
    "complexity",
    "nextSteps",
    "disclaimer",
  ],
  properties: {
    executiveSummary: { type: "string" },
    chronology: {
      type: "array",
      items: { type: "string" },
    },
    redFlags: {
      type: "array",
      items: { type: "string" },
    },
    evidenceAnalysis: {
      type: "array",
      items: { type: "string" },
    },
    traceabilityRoutes: {
      type: "array",
      items: { type: "string" },
    },
    missingInformation: {
      type: "array",
      items: { type: "string" },
    },
    complexity: {
      type: "string",
      enum: ["Bajo", "Medio", "Alto"],
    },
    nextSteps: {
      type: "array",
      items: { type: "string" },
    },
    disclaimer: { type: "string" },
  },
} as const;

const LEGAL_DISCLAIMER =
  "Este informe es un análisis preliminar basado en la información proporcionada. No constituye una promesa de recuperación ni asesoría legal definitiva.";

function buildPrompt(caseRow: CaseRow, evidence: CaseEvidenceRow[]) {
  const evidenceList = evidence.length
    ? evidence
        .map(
          (item, index) =>
            `${index + 1}. ${item.file_name} | tipo: ${item.file_type ?? "desconocido"} | tamaño: ${item.file_size ?? "n/d"}`,
        )
        .join("\n")
    : "No se adjuntaron evidencias todavía.";

  return `
Analiza el siguiente caso de posible fraude financiero digital.

Lineamientos:
- Usa tono prudente, profesional e investigativo.
- No prometas recuperación.
- No des asesoría legal definitiva.
- Basa el análisis únicamente en la información entregada.
- Si hay vacíos, menciónalos como información faltante.
- La cronología debe ser preliminar y clara.
- Las rutas de trazabilidad deben formularse como hipótesis prudentes.
- El disclaimer debe quedar exactamente así: "${LEGAL_DISCLAIMER}"

Datos del caso:
- Empresa o plataforma: ${caseRow.company_name ?? "No especificado"}
- Tipo de fraude: ${caseRow.fraud_type ?? "No especificado"}
- País: ${caseRow.country ?? "No especificado"}
- Fecha aproximada de inicio: ${caseRow.start_date ?? "No especificado"}
- Monto aproximado perdido: ${caseRow.lost_amount ?? "No especificado"} ${caseRow.currency ?? ""}
- Metodo de pago: ${caseRow.payment_method ?? "No especificado"}
- Banco involucrado: ${caseRow.bank_name ?? "No especificado"}
- Método de contacto: ${caseRow.contact_method ?? "No especificado"}
- Promesa recibida: ${caseRow.promise ?? "No especificado"}
- Pasos seguidos: ${caseRow.steps_followed ?? "No especificado"}
- Momento de sospecha: ${caseRow.suspicion_moment ?? "No especificado"}
- Descripción completa: ${caseRow.full_description ?? "No especificado"}
- Wallets: ${caseRow.wallets ?? "No especificado"}
- Hashes: ${caseRow.transaction_hashes ?? "No especificado"}
- Enlaces de plataforma: ${caseRow.platform_links ?? "No especificado"}
- Correos de la empresa: ${caseRow.company_emails ?? "No especificado"}
- Teléfonos o usuarios: ${caseRow.phones_or_users ?? "No especificado"}
- URLs relevantes: ${caseRow.relevant_urls ?? "No especificado"}
- Ya denuncio ante autoridades: ${
    caseRow.reported_to_authorities === null
      ? "No especificado"
      : caseRow.reported_to_authorities
        ? "Si"
        : "No"
  }
- Ya contacto abogados: ${
    caseRow.contacted_lawyers === null
      ? "No especificado"
      : caseRow.contacted_lawyers
        ? "Si"
        : "No"
  }
- Ofertas de recuperacion recibidas: ${
    caseRow.recovery_offer_received === null
      ? "No especificado"
      : caseRow.recovery_offer_received
        ? "Si"
        : "No"
  }
- Detalles de recuperacion: ${caseRow.recovery_offer_details ?? "No especificado"}

Evidencias:
${evidenceList}
`.trim();
}

function extractResponseText(payload: {
  output?: Array<{ content?: Array<{ text?: string; type?: string }> }>;
  output_text?: string;
}) {
  if (typeof payload.output_text === "string" && payload.output_text.length > 0) {
    return payload.output_text;
  }

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (
        (content.type === "output_text" || content.type === "text") &&
        typeof content.text === "string"
      ) {
        return content.text;
      }
    }
  }

  return null;
}

export function buildFallbackReport(
  caseRow: CaseRow,
  evidence: CaseEvidenceRow[],
): StructuredReport {
  return {
    complexity:
      evidence.length > 3 || caseRow.transaction_hashes || caseRow.wallets
        ? "Alto"
        : caseRow.full_description
          ? "Medio"
          : "Bajo",
    chronology: [
      `La interacción inicial habría comenzado mediante ${caseRow.contact_method ?? "un canal no precisado"}.`,
      `La narrativa indica una promesa asociada a ${caseRow.promise ?? "beneficios económicos no detallados"}.`,
      `La sospecha de fraude surgió cuando ${caseRow.suspicion_moment ?? "el usuario detectó inconsistencias en la operación"}.`,
    ],
    disclaimer: LEGAL_DISCLAIMER,
    evidenceAnalysis: evidence.length
      ? evidence.map(
          (item) =>
            `Se recibió ${item.file_name}, útil para contrastar comunicaciones, soportes o trazabilidad técnica.`,
        )
      : [
          "Aún no hay archivos adjuntos; el análisis dependerá principalmente de la narrativa declarada hasta recibir soportes adicionales.",
        ],
    executiveSummary:
      `El caso describe un posible esquema de ${caseRow.fraud_type ?? "fraude financiero digital"} vinculado a ${caseRow.company_name ?? "una plataforma no identificada"}. ` +
      "La información actual permite abrir una revisión preliminar, pero todavía requiere validación documental para sostener una reconstrucción más sólida.",
    missingInformation: [
      "Comprobantes de pago o transferencias.",
      "Conversaciones completas con fechas visibles.",
      "Metodo de pago y soportes de banco, wallet o hash cuando existan.",
      "Enlaces exactos de acceso a la plataforma o perfiles usados.",
    ],
    nextSteps: [
      "Consolidar conversaciones, recibos y capturas en orden cronológico.",
      "Verificar coincidencias entre medios de contacto, dominios y posibles wallets.",
      "Escalar a revisión humana cuando la documentación esté completa.",
    ],
    redFlags: [
      `La promesa reportada (${caseRow.promise ?? "no especificada"}) puede reflejar un incentivo comercial impropio si no estaba respaldada documentalmente.`,
      "La falta de identificación verificable de la contraparte es una señal de riesgo recurrente.",
      "Los canales digitales dispersos suelen dificultar la trazabilidad y exigen consolidación temprana de evidencia.",
    ],
    traceabilityRoutes: [
      "Cruce de dominios, correos y teléfonos utilizados durante la captación.",
      "Identificación de wallets, hashes o comprobantes para mapear flujos técnicos.",
      "Revisión de cronología de contacto y momentos de presión o insistencia comercial.",
    ],
  };
}

export async function generateStructuredReport(
  caseRow: CaseRow,
  evidence: CaseEvidenceRow[],
) {
  if (!hasOpenAIEnv) {
    return buildFallbackReport(caseRow, evidence);
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openAIKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.openAIModel,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "Eres un analista legal-tech especializado en informes preliminares de fraude financiero digital.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildPrompt(caseRow, evidence),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "case_report",
          strict: true,
          schema: reportSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    output?: Array<{ content?: Array<{ text?: string; type?: string }> }>;
    output_text?: string;
  };
  const outputText = extractResponseText(payload);

  if (!outputText) {
    throw new Error("OpenAI response did not include structured text output.");
  }

  const parsed = JSON.parse(outputText) as StructuredReport;
  parsed.disclaimer = LEGAL_DISCLAIMER;
  return parsed;
}

export function renderReportAsText(report: StructuredReport) {
  return [
    report.investigation
      ? `Resultado preliminar\n- Índice del caso: ${report.investigation.score_result.preliminaryCaseIndex}/100\n- Riesgo estimado: ${report.investigation.score_result.fraudRiskScore}/100\n- Trazabilidad: ${report.investigation.score_result.traceabilityScore}/100\n- Evidencia: ${report.investigation.score_result.evidenceQualityScore}/100\n- Riesgo de segunda estafa: ${report.investigation.score_result.recoveryScamRiskScore}/100\n- Prioridad: ${report.investigation.score_result.recommendedPriority}`
      : null,
    report.findings?.length
      ? `Hallazgos principales\n- ${report.findings.map((item) => `${item.title}: ${item.explanation}`).join("\n- ")}`
      : null,
    `Resumen ejecutivo\n${report.executiveSummary}`,
    `Cronología\n- ${report.chronology.join("\n- ")}`,
    `Alertas detectadas\n- ${report.redFlags.join("\n- ")}`,
    `Análisis de evidencia\n- ${report.evidenceAnalysis.join("\n- ")}`,
    `Rutas de trazabilidad\n- ${report.traceabilityRoutes.join("\n- ")}`,
    `Información faltante\n- ${report.missingInformation.join("\n- ")}`,
    report.urgentActions?.length
      ? `Acciones urgentes\n- ${report.urgentActions.join("\n- ")}`
      : null,
    report.recommendedDocuments?.length
      ? `Documentos recomendados\n- ${report.recommendedDocuments.join("\n- ")}`
      : null,
    `Próximos pasos\n- ${report.nextSteps.join("\n- ")}`,
    `Nivel de complejidad\n${report.complexity}`,
    `Disclaimer\n${report.disclaimer}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
