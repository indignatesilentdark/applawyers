import { env, hasResendEnv } from "@/lib/env";
import { generateReportPdfBuffer } from "@/lib/report-pdf";
import { createResendClient } from "@/lib/resend";
import { renderReportAsText } from "@/lib/reporting";
import type { CaseEvidenceRow, CaseRow, ProfileRow, StructuredReport } from "@/lib/types";

type ReportDeliveryInput = {
  caseId: string;
  caseRow: CaseRow;
  evidence: CaseEvidenceRow[];
  profile?: Pick<ProfileRow, "email" | "first_name" | "last_name" | "phone"> | null;
  report: StructuredReport;
};

type HumanReviewInput = ReportDeliveryInput;

function getRecipientName(profile?: Pick<ProfileRow, "first_name" | "last_name"> | null) {
  return [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
}

function normalizeBaseUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  return url.startsWith("http") ? url : `https://${url}`;
}

function getCaseLink(caseId: string) {
  const baseUrl = normalizeBaseUrl(env.appBaseUrl);
  return baseUrl ? `${baseUrl}/cases/${caseId}/report` : null;
}

function buildClientReportHtml({
  caseId,
  caseRow,
  profile,
  report,
}: ReportDeliveryInput) {
  const recipientName = getRecipientName(profile) || "cliente";
  const caseLink = getCaseLink(caseId);

  return `
    <div style="margin:0;padding:32px 16px;background:#07111f;font-family:Arial,Helvetica,sans-serif;color:#f8fafc;">
      <div style="max-width:640px;margin:0 auto;background:linear-gradient(180deg,#18263a 0%,#0d1728 100%);border:1px solid #1d3557;border-radius:28px;padding:36px 32px;">
        <div style="display:inline-block;padding:10px 18px;border:1px solid #1d3557;border-radius:999px;background:#13233a;color:#9fb2cc;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;">
          Dossier privado
        </div>
        <h1 style="margin:18px 0 12px 0;font-size:34px;line-height:1.1;color:#ffffff;font-weight:700;">
          Tu analisis preliminar ya esta listo
        </h1>
        <p style="margin:0 0 18px 0;color:#b9c7da;font-size:16px;line-height:1.7;">
          Hola ${recipientName}, terminamos el primer analisis del caso relacionado con <strong>${caseRow.company_name ?? "la plataforma reportada"}</strong>.
        </p>
        <div style="margin:0 0 22px 0;padding:18px;border-radius:22px;background:#0b1626;border:1px solid #1d3557;">
          <p style="margin:0 0 8px 0;color:#9fb2cc;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;">Resumen ejecutivo</p>
          <p style="margin:0;color:#f8fafc;font-size:15px;line-height:1.7;">
            ${report.executiveSummary}
          </p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0 0 22px 0;">
          <div style="padding:16px;border-radius:18px;background:#0d192b;border:1px solid #183152;">
            <p style="margin:0 0 6px 0;color:#8fa6c4;font-size:12px;text-transform:uppercase;letter-spacing:0.14em;">Complejidad</p>
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">${report.complexity}</p>
          </div>
          <div style="padding:16px;border-radius:18px;background:#0d192b;border:1px solid #183152;">
            <p style="margin:0 0 6px 0;color:#8fa6c4;font-size:12px;text-transform:uppercase;letter-spacing:0.14em;">Pais</p>
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">${caseRow.country ?? "No especificado"}</p>
          </div>
        </div>
        <p style="margin:0 0 18px 0;color:#b9c7da;font-size:15px;line-height:1.7;">
          Adjuntamos un PDF del dossier. ${caseLink ? "Tambien puedes abrir tu dossier privado desde el siguiente enlace." : "Tambien puedes volver a entrar a tu panel privado para revisarlo en detalle."}
        </p>
        ${
          caseLink
            ? `<a href="${caseLink}" style="display:inline-block;padding:14px 22px;border-radius:16px;background:#20c997;color:#02111d;text-decoration:none;font-weight:700;">Abrir dossier privado</a>`
            : ""
        }
        <p style="margin:24px 0 0 0;color:#7187a4;font-size:13px;line-height:1.7;">
          ${report.disclaimer}
        </p>
      </div>
    </div>
  `.trim();
}

function buildHumanReviewHtml({
  caseId,
  caseRow,
  profile,
  report,
}: HumanReviewInput) {
  const caseLink = getCaseLink(caseId);
  const requester = getRecipientName(profile) || profile?.email || "Cliente privado";

  return `
    <div style="margin:0;padding:32px 16px;background:#07111f;font-family:Arial,Helvetica,sans-serif;color:#f8fafc;">
      <div style="max-width:640px;margin:0 auto;background:#101a2b;border:1px solid #1d3557;border-radius:28px;padding:32px;">
        <h1 style="margin:0 0 16px 0;font-size:28px;line-height:1.15;color:#ffffff;font-weight:700;">
          Solicitud de revision humana
        </h1>
        <p style="margin:0 0 14px 0;color:#b9c7da;font-size:15px;line-height:1.7;">
          ${requester} solicito revision humana para el caso <strong>${caseRow.company_name ?? "sin empresa especificada"}</strong>.
        </p>
        <p style="margin:0 0 14px 0;color:#b9c7da;font-size:15px;line-height:1.7;">
          Tipo: ${caseRow.fraud_type ?? "No especificado"}<br />
          Pais: ${caseRow.country ?? "No especificado"}<br />
          Monto: ${caseRow.lost_amount ?? "No especificado"} ${caseRow.currency ?? ""}
        </p>
        <p style="margin:0 0 16px 0;color:#f8fafc;font-size:15px;line-height:1.7;">
          Resumen: ${report.executiveSummary}
        </p>
        ${
          caseLink
            ? `<a href="${caseLink}" style="display:inline-block;padding:14px 22px;border-radius:16px;background:#20c997;color:#02111d;text-decoration:none;font-weight:700;">Abrir dossier</a>`
            : ""
        }
      </div>
    </div>
  `.trim();
}

export async function sendCaseReportEmail(input: ReportDeliveryInput) {
  if (!hasResendEnv || !input.profile?.email) {
    return { sent: false as const };
  }

  const resend = createResendClient();
  const pdfBuffer = await generateReportPdfBuffer(input);
  const attachment = pdfBuffer.toString("base64");

  const sendResult = await resend.emails.send({
    from: env.emailFrom,
    to: input.profile.email,
    subject: `Tu dossier preliminar sobre ${input.caseRow.company_name ?? "tu caso"} esta listo`,
    html: buildClientReportHtml(input),
    text: renderReportAsText(input.report),
    attachments: [
      {
        content: attachment,
        filename: `dossier-${input.caseId}.pdf`,
      },
    ],
  });

  if (sendResult.error) {
    throw new Error(sendResult.error.message);
  }

  return { sent: true as const };
}

export async function sendHumanReviewRequestEmail(input: HumanReviewInput) {
  if (!hasResendEnv || !env.humanReviewEmail) {
    return { sent: false as const };
  }

  const resend = createResendClient();
  const pdfBuffer = await generateReportPdfBuffer(input);

  const sendResult = await resend.emails.send({
    from: env.emailFrom,
    to: env.humanReviewEmail,
    subject: `Revision humana solicitada: ${input.caseRow.company_name ?? input.caseId}`,
    html: buildHumanReviewHtml(input),
    text: renderReportAsText(input.report),
    attachments: [
      {
        content: pdfBuffer.toString("base64"),
        filename: `revision-${input.caseId}.pdf`,
      },
    ],
  });

  if (sendResult.error) {
    throw new Error(sendResult.error.message);
  }

  return { sent: true as const };
}
