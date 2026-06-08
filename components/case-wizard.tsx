"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileUploader } from "@/components/file-uploader";
import { LoadingState } from "@/components/loading-state";
import { StepButton } from "@/components/step-button";

const fraudOptions = [
  "Broker falso",
  "Criptomonedas",
  "Trading",
  "Préstamo falso",
  "Casino",
  "Trabajo falso",
  "Recuperador falso",
  "Otro",
] as const;

const booleanOptions = [
  { label: "Sí", value: "si" },
  { label: "No", value: "no" },
] as const;

type DraftState = {
  bankName: string;
  companyEmails: string;
  companyName: string;
  contactMethod: string;
  contactedLawyers: string;
  country: string;
  currency: string;
  fraudType: string;
  fullDescription: string;
  lostAmount: string;
  paymentMethod: string;
  phonesOrUsers: string;
  platformLinks: string;
  promise: string;
  recoveryOfferDetails: string;
  recoveryOfferReceived: string;
  relevantUrls: string;
  reportedToAuthorities: string;
  startDate: string;
  stepsFollowed: string;
  suspicionMoment: string;
  transactionHashes: string;
  wallets: string;
};

const initialDraftState: DraftState = {
  bankName: "",
  companyEmails: "",
  companyName: "",
  contactMethod: "",
  contactedLawyers: "",
  country: "",
  currency: "USD",
  fraudType: "Broker falso",
  fullDescription: "",
  lostAmount: "",
  paymentMethod: "",
  phonesOrUsers: "",
  platformLinks: "",
  promise: "",
  recoveryOfferDetails: "",
  recoveryOfferReceived: "",
  relevantUrls: "",
  reportedToAuthorities: "",
  startDate: "",
  stepsFollowed: "",
  suspicionMoment: "",
  transactionHashes: "",
  wallets: "",
};

const steps = [
  "Informacion general",
  "Como ocurrio",
  "Datos tecnicos",
  "Evidencias",
  "Confirmacion",
];

export function CaseWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [draft, setDraft] = useState<DraftState>(() => {
    if (typeof window === "undefined") {
      return initialDraftState;
    }

    const savedDraft = window.localStorage.getItem("approvedlawyer:case-draft");
    if (!savedDraft) {
      return initialDraftState;
    }

    try {
      return JSON.parse(savedDraft) as DraftState;
    } catch {
      window.localStorage.removeItem("approvedlawyer:case-draft");
      return initialDraftState;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Preparando el caso...");

  useEffect(() => {
    window.localStorage.setItem(
      "approvedlawyer:case-draft",
      JSON.stringify(draft),
    );
  }, [draft]);

  function updateField<Key extends keyof DraftState>(
    key: Key,
    value: DraftState[Key],
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validateCurrentStep() {
    if (step === 0) {
      return (
        draft.companyName &&
        draft.country &&
        draft.lostAmount &&
        draft.startDate &&
        draft.paymentMethod
      );
    }

    if (step === 1) {
      return (
        draft.contactMethod &&
        draft.promise &&
        draft.stepsFollowed &&
        draft.suspicionMoment &&
        draft.fullDescription
      );
    }

    if (step === 2) {
      return (
        draft.reportedToAuthorities &&
        draft.contactedLawyers &&
        draft.recoveryOfferReceived
      );
    }

    return true;
  }

  async function handleSubmit() {
    setError(null);

    try {
      setIsSubmitting(true);
      setLoadingLabel("Guardando la informacion del caso...");

      const formData = new FormData();
      formData.append("payload", JSON.stringify(draft));

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/cases", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        caseId?: string;
        error?: string;
      };

      if (!response.ok || !payload.caseId) {
        throw new Error(payload.error ?? "No pudimos crear el caso.");
      }

      window.localStorage.removeItem("approvedlawyer:case-draft");
      router.push(`/cases/${payload.caseId}/report`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Ocurrio un error al crear el caso.",
      );
    } finally {
      setIsSubmitting(false);
      setLoadingLabel("Preparando el caso...");
    }
  }

  if (isSubmitting) {
    return (
      <LoadingState
        title="Procesando dossier"
        description={`${loadingLabel} Este paso puede tardar unos segundos mientras consolidamos la informacion.`}
      />
    );
  }

  return (
    <motion.div
      className="glass-panel rounded-[1.75rem] p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
            Paso {step + 1} de {steps.length}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            {steps[step]}
          </h1>
        </div>
        <div className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
          Flujo privado
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {steps.map((stepLabel, index) => (
          <div
            key={stepLabel}
            className={`h-1.5 flex-1 rounded-full ${
              index <= step ? "bg-accent" : "bg-border/70"
            }`}
          />
        ))}
      </div>

      {step === 0 ? (
        <div className="space-y-4">
          <div>
            <label className="label-base">Empresa o plataforma involucrada</label>
            <input
              className="field-base"
              value={draft.companyName}
              onChange={(event) => updateField("companyName", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">Tipo de fraude</label>
            <select
              className="field-base"
              value={draft.fraudType}
              onChange={(event) => updateField("fraudType", event.target.value)}
            >
              {fraudOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Pais donde ocurrio</label>
            <input
              className="field-base"
              value={draft.country}
              onChange={(event) => updateField("country", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">Fecha aproximada del hecho</label>
            <input
              className="field-base"
              type="date"
              value={draft.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">Monto exacto o aproximado perdido</label>
            <input
              className="field-base"
              type="number"
              min="0"
              value={draft.lostAmount}
              onChange={(event) => updateField("lostAmount", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">Moneda</label>
            <input
              className="field-base"
              value={draft.currency}
              onChange={(event) => updateField("currency", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">Metodo de pago usado</label>
            <input
              className="field-base"
              placeholder="Transferencia, tarjeta, cripto, wallet..."
              value={draft.paymentMethod}
              onChange={(event) =>
                updateField("paymentMethod", event.target.value)
              }
            />
          </div>
          <div>
            <label className="label-base">Banco involucrado si aplica</label>
            <input
              className="field-base"
              value={draft.bankName}
              onChange={(event) => updateField("bankName", event.target.value)}
            />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="label-base">Como te contactaron</label>
            <textarea
              className="field-base min-h-24"
              value={draft.contactMethod}
              onChange={(event) =>
                updateField("contactMethod", event.target.value)
              }
            />
          </div>
          <div>
            <label className="label-base">Que te prometieron</label>
            <textarea
              className="field-base min-h-24"
              value={draft.promise}
              onChange={(event) => updateField("promise", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">
              Conversaciones o instrucciones clave
            </label>
            <textarea
              className="field-base min-h-28"
              value={draft.stepsFollowed}
              onChange={(event) =>
                updateField("stepsFollowed", event.target.value)
              }
            />
          </div>
          <div>
            <label className="label-base">Cuando sospechaste que era fraude</label>
            <textarea
              className="field-base min-h-24"
              value={draft.suspicionMoment}
              onChange={(event) =>
                updateField("suspicionMoment", event.target.value)
              }
            />
          </div>
          <div>
            <label className="label-base">Descripcion completa del caso</label>
            <textarea
              className="field-base min-h-36"
              value={draft.fullDescription}
              onChange={(event) =>
                updateField("fullDescription", event.target.value)
              }
            />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div>
            <label className="label-base">Wallets enviadas o recibidas</label>
            <textarea
              className="field-base min-h-24"
              value={draft.wallets}
              onChange={(event) => updateField("wallets", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">Hashes de transaccion</label>
            <textarea
              className="field-base min-h-24"
              value={draft.transactionHashes}
              onChange={(event) =>
                updateField("transactionHashes", event.target.value)
              }
            />
          </div>
          <div>
            <label className="label-base">Enlaces de la plataforma</label>
            <textarea
              className="field-base min-h-24"
              value={draft.platformLinks}
              onChange={(event) =>
                updateField("platformLinks", event.target.value)
              }
            />
          </div>
          <div>
            <label className="label-base">Correos usados por la empresa</label>
            <textarea
              className="field-base min-h-24"
              value={draft.companyEmails}
              onChange={(event) =>
                updateField("companyEmails", event.target.value)
              }
            />
          </div>
          <div>
            <label className="label-base">
              Telefonos o usuarios de WhatsApp / Telegram
            </label>
            <textarea
              className="field-base min-h-24"
              value={draft.phonesOrUsers}
              onChange={(event) =>
                updateField("phonesOrUsers", event.target.value)
              }
            />
          </div>
          <div>
            <label className="label-base">URLs relevantes</label>
            <textarea
              className="field-base min-h-24"
              value={draft.relevantUrls}
              onChange={(event) =>
                updateField("relevantUrls", event.target.value)
              }
            />
          </div>
          <div>
            <label className="label-base">Ya denunciaste ante autoridades</label>
            <select
              className="field-base"
              value={draft.reportedToAuthorities}
              onChange={(event) =>
                updateField("reportedToAuthorities", event.target.value)
              }
            >
              <option value="">Selecciona una opcion</option>
              {booleanOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Ya contactaste abogados</label>
            <select
              className="field-base"
              value={draft.contactedLawyers}
              onChange={(event) =>
                updateField("contactedLawyers", event.target.value)
              }
            >
              <option value="">Selecciona una opcion</option>
              {booleanOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">
              Recibiste ofertas de supuesta recuperacion
            </label>
            <select
              className="field-base"
              value={draft.recoveryOfferReceived}
              onChange={(event) =>
                updateField("recoveryOfferReceived", event.target.value)
              }
            >
              <option value="">Selecciona una opcion</option>
              {booleanOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Detalles de esas ofertas</label>
            <textarea
              className="field-base min-h-24"
              value={draft.recoveryOfferDetails}
              onChange={(event) =>
                updateField("recoveryOfferDetails", event.target.value)
              }
            />
          </div>
        </div>
      ) : null}

      {step === 3 ? <FileUploader files={files} onFilesChange={setFiles} /> : null}

      {step === 4 ? (
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-border/70 bg-background-elevated/65 p-4">
            <h2 className="text-sm font-semibold text-white">
              Resumen previo al analisis
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Empresa</dt>
                <dd className="text-white">{draft.companyName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tipo de fraude</dt>
                <dd className="text-white">{draft.fraudType}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Pais</dt>
                <dd className="text-white">{draft.country}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Monto</dt>
                <dd className="text-white">
                  {draft.lostAmount} {draft.currency}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Metodo de pago</dt>
                <dd className="text-white">
                  {draft.paymentMethod || "No especificado"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Evidencias</dt>
                <dd className="text-white">
                  {files.length} archivo{files.length === 1 ? "" : "s"}
                </dd>
              </div>
            </dl>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">
            Al continuar, el sistema guardara el caso, asociara la evidencia y
            preparara un informe preliminar con apoyo de IA.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-white">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3">
        <StepButton
          type="button"
          variant="ghost"
          disabled={step === 0}
          onClick={() => setStep((current) => current - 1)}
        >
          Atras
        </StepButton>

        {step < steps.length - 1 ? (
          <StepButton
            type="button"
            disabled={!validateCurrentStep()}
            onClick={() => setStep((current) => current + 1)}
          >
            Continuar
          </StepButton>
        ) : (
          <StepButton type="button" onClick={handleSubmit}>
            Analizar mi caso profundamente
          </StepButton>
        )}
      </div>
    </motion.div>
  );
}
