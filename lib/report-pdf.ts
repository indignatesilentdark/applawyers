import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CaseEvidenceRow, CaseRow, ProfileRow, StructuredReport } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type ReportPdfInput = {
  caseRow: CaseRow;
  evidence: CaseEvidenceRow[];
  profile?: Pick<ProfileRow, "email" | "first_name" | "last_name"> | null;
  report: StructuredReport;
};

type PdfContext = {
  boldFont: PDFFont;
  font: PDFFont;
  page: PDFPage;
  pageWidth: number;
  pdf: PDFDocument;
  y: number;
};

const PAGE_MARGIN = 48;
const PAGE_SIZE: [number, number] = [595.28, 841.89];
const LOGO_PATH = path.join(process.cwd(), "public", "logo-applawyers-original.png");

function sanitizeText(value: string) {
  return value.replace(/[^\x20-\x7E\xA0-\xFF\n]/g, "");
}

function getFullName(profile?: Pick<ProfileRow, "first_name" | "last_name"> | null) {
  return [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
  const sanitized = sanitizeText(text);
  const paragraphs = sanitized.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    let currentLine = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

function createPage(pdf: PDFDocument) {
  const page = pdf.addPage(PAGE_SIZE);
  page.drawRectangle({
    color: rgb(0.04, 0.08, 0.14),
    height: PAGE_SIZE[1],
    width: PAGE_SIZE[0],
    x: 0,
    y: 0,
  });
  return page;
}

function ensureSpace(context: PdfContext, neededHeight: number) {
  if (context.y - neededHeight >= PAGE_MARGIN) {
    return context;
  }

  return {
    ...context,
    page: createPage(context.pdf),
    y: PAGE_SIZE[1] - PAGE_MARGIN,
  };
}

function drawTextBlock(
  context: PdfContext,
  text: string,
  options: {
    color?: ReturnType<typeof rgb>;
    font?: PDFFont;
    fontSize?: number;
    gapAfter?: number;
    lineHeight?: number;
  } = {},
) {
  const font = options.font ?? context.font;
  const fontSize = options.fontSize ?? 11;
  const lineHeight = options.lineHeight ?? fontSize * 1.5;
  const color = options.color ?? rgb(0.88, 0.91, 0.97);
  const lines = wrapText(
    text,
    font,
    fontSize,
    context.pageWidth - PAGE_MARGIN * 2,
  );

  const nextContext = ensureSpace(context, lines.length * lineHeight + (options.gapAfter ?? 0));

  for (const line of lines) {
    nextContext.page.drawText(line || " ", {
      color,
      font,
      size: fontSize,
      x: PAGE_MARGIN,
      y: nextContext.y,
    });
    nextContext.y -= lineHeight;
  }

  nextContext.y -= options.gapAfter ?? 0;
  return nextContext;
}

function drawSection(
  context: PdfContext,
  title: string,
  content: string[],
) {
  let nextContext = ensureSpace(context, 52);
  nextContext.page.drawRectangle({
    color: rgb(0.08, 0.13, 0.22),
    height: 26,
    width: nextContext.pageWidth - PAGE_MARGIN * 2,
    x: PAGE_MARGIN,
    y: nextContext.y - 8,
  });
  nextContext.page.drawText(sanitizeText(title), {
    color: rgb(0.99, 1, 1),
    font: nextContext.boldFont,
    size: 13,
    x: PAGE_MARGIN + 12,
    y: nextContext.y,
  });
  nextContext.y -= 34;

  for (const item of content) {
    nextContext = drawTextBlock(nextContext, `- ${item}`, {
      color: rgb(0.83, 0.88, 0.95),
      fontSize: 10.5,
      gapAfter: 4,
      lineHeight: 15,
    });
  }

  nextContext.y -= 8;
  return nextContext;
}

export async function generateReportPdfBuffer({
  caseRow,
  evidence,
  profile,
  report,
}: ReportPdfInput) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logoBytes = await readFile(LOGO_PATH);
  const logoImage = await pdf.embedPng(logoBytes);

  let context: PdfContext = {
    boldFont,
    font,
    page: createPage(pdf),
    pageWidth: PAGE_SIZE[0],
    pdf,
    y: PAGE_SIZE[1] - PAGE_MARGIN,
  };

  const logoScale = logoImage.scale(0.12);
  context.page.drawImage(logoImage, {
    height: logoScale.height,
    width: logoScale.width,
    x: PAGE_MARGIN,
    y: context.y - logoScale.height + 10,
  });

  context.page.drawRectangle({
    color: rgb(0.08, 0.18, 0.22),
    height: logoScale.height + 16,
    width: logoScale.width + 16,
    x: PAGE_MARGIN - 8,
    y: context.y - logoScale.height + 2,
  });

  context.page.drawImage(logoImage, {
    height: logoScale.height,
    width: logoScale.width,
    x: PAGE_MARGIN,
    y: context.y - logoScale.height + 10,
  });

  context.y -= logoScale.height + 14;

  context = drawTextBlock(context, "APPROVEDLAWYER - DOSSIER PRELIMINAR", {
    color: rgb(0.53, 0.71, 0.95),
    fontSize: 10,
    gapAfter: 10,
  });

  context = drawTextBlock(
    context,
    caseRow.company_name || "Caso en analisis",
    {
      color: rgb(1, 1, 1),
      font: boldFont,
      fontSize: 24,
      gapAfter: 8,
      lineHeight: 28,
    },
  );

  context = drawTextBlock(
    context,
    [
      `Fecha del informe: ${formatDate(caseRow.created_at)}`,
      `Titular: ${getFullName(profile) || "Cliente privado"}`,
      `Correo: ${profile?.email ?? "No disponible"}`,
      `Pais: ${caseRow.country ?? "No especificado"}`,
      `Monto reportado: ${formatCurrency(caseRow.lost_amount, caseRow.currency ?? "USD")}`,
      `Evidencias cargadas: ${evidence.length}`,
    ].join("\n"),
    {
      color: rgb(0.78, 0.84, 0.92),
      fontSize: 10.5,
      gapAfter: 18,
      lineHeight: 16,
    },
  );

  context = drawSection(context, "Resumen ejecutivo", [report.executiveSummary]);
  context = drawSection(context, "Cronologia preliminar", report.chronology);
  context = drawSection(context, "Alertas detectadas", report.redFlags);
  context = drawSection(
    context,
    "Analisis de evidencia aportada",
    report.evidenceAnalysis,
  );
  context = drawSection(
    context,
    "Posibles rutas de trazabilidad",
    report.traceabilityRoutes,
  );
  context = drawSection(context, "Informacion faltante", report.missingInformation);
  context = drawSection(context, "Proximos pasos sugeridos", [
    `Nivel de complejidad estimado: ${report.complexity}`,
    ...report.nextSteps,
  ]);
  context = drawSection(context, "Observacion legal", [report.disclaimer]);

  if (evidence.length > 0) {
    drawSection(
      context,
      "Archivos cargados",
      evidence.map(
        (item) =>
          `${item.file_name} (${item.file_type ?? "archivo"}, ${item.file_size ?? 0} bytes)`,
      ),
    );
  }

  return Buffer.from(await pdf.save());
}
