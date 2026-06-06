"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileUploader } from "@/components/file-uploader";
import { LoadingState } from "@/components/loading-state";
import { StepButton } from "@/components/step-button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { slugifyFileName } from "@/lib/utils";

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

type CaseWizardProps = {
  userId: string;
};

type DraftState = {
  companyEmails: string;
  companyName: string;
  contactMethod: string;
  country: string;
  currency: string;
  fraudType: string;
  fullDescription: string;
  lostAmount: string;
  phonesOrUsers: string;
  platformLinks: string;
  promise: string;
  relevantUrls: string;
  startDate: string;
  stepsFollowed: string;
  suspicionMoment: string;
  transactionHashes: string;
  wallets: string;
};

const initialDraftState: DraftState = {
  companyEmails: "",
  companyName: "",
  contactMethod: "",
  country: "",
  currency: "USD",
  fraudType: "Broker falso",
  fullDescription: "",
  lostAmount: "",
  phonesOrUsers: "",
  platformLinks: "",
  promise: "",
  relevantUrls: "",
  startDate: "",
  stepsFollowed: "",
  suspicionMoment: "",
  transactionHashes: "",
  wallets: "",
};

const steps = [
  "Información general",
  "Cómo ocurrió",
  "Datos técnicos",
  "Evidencias",
  "Confirmación",
];

export function CaseWizard({ userId }: CaseWizardProps) {
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
    window.localStorage.setItem("approvedlawyer:case-draft", JSON.stringify(draft));
  }, [draft]);

  function updateField<Key extends keyof DraftState>(key: Key, value: DraftState[Key]) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validateCurrentStep() {
    if (step === 0) {
      return draft.companyName && draft.country && draft.lostAmount;
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

    return true;
  }

  async function uploadEvidence(caseId: string) {
    const supabase = createBrowserSupabaseClient();

    for (const file of files) {
      const sanitizedName = `${Date.now()}-${slugifyFileName(file.name)}`;
      const filePath = `${userId}/${caseId}/${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("case-evidence")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: evidenceError } = await supabase.from("case_evidence").insert({
        case_id: caseId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        user_id: userId,
      });

      if (evidenceError) {
        throw evidenceError;
      }
    }
  }

  async function handleSubmit() {
    setError(null);

    try {
      setIsSubmitting(true);
      setLoadingLabel("Guardando la información del caso...");
      const supabase = createBrowserSupabaseClient();

      const { data: createdCase, error: caseError } = await supabase
        .from("cases")
        .insert({
          company_emails: draft.companyEmails,
          company_name: draft.companyName,
          contact_method: draft.contactMethod,
          country: draft.country,
          currency: draft.currency,
          fraud_type: draft.fraudType,
          full_description: draft.fullDescription,
          lost_amount: Number(draft.lostAmount),
          phones_or_users: draft.phonesOrUsers,
          platform_links: draft.platformLinks,
          promise: draft.promise,
          relevant_urls: draft.relevantUrls,
          start_date: draft.startDate,
          status: "Pendiente",
          steps_followed: draft.stepsFollowed,
          suspicion_moment: draft.suspicionMoment,
          transaction_hashes: draft.transactionHashes,
          user_id: userId,
          wallets: draft.wallets,
        })
        .select("id")
        .single();

      if (caseError || !createdCase) {
        throw caseError ?? new Error("No pudimos crear el caso.");
      }

      if (files.length) {
        setLoadingLabel("Subiendo evidencias...");
        await uploadEvidence(createdCase.id);
      }

      setLoadingLabel("Generando informe preliminar con IA...");

      const reportResponse = await fetch("/api/analyze-case", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseId: createdCase.id,
        }),
      });

      if (!reportResponse.ok) {
        throw new Error("No pudimos generar el informe preliminar.");
      }

      window.localStorage.removeItem("approvedlawyer:case-draft");
      router.push(`/cases/${createdCase.id}/report`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Ocurrió un error al crear el caso.",
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
        description={`${loadingLabel} Este paso puede tardar unos segundos mientras consolidamos la información.`}
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
            <label className="label-base">País donde ocurrió</label>
            <input
              className="field-base"
              value={draft.country}
              onChange={(event) => updateField("country", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">Fecha aproximada de inicio</label>
            <input
              className="field-base"
              type="date"
              value={draft.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">Monto aproximado perdido</label>
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
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="label-base">¿Cómo te contactaron?</label>
            <textarea
              className="field-base min-h-24"
              value={draft.contactMethod}
              onChange={(event) => updateField("contactMethod", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">¿Qué te prometieron?</label>
            <textarea
              className="field-base min-h-24"
              value={draft.promise}
              onChange={(event) => updateField("promise", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">¿Qué pasos seguiste?</label>
            <textarea
              className="field-base min-h-28"
              value={draft.stepsFollowed}
              onChange={(event) => updateField("stepsFollowed", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">¿Cuándo sospechaste que era fraude?</label>
            <textarea
              className="field-base min-h-24"
              value={draft.suspicionMoment}
              onChange={(event) => updateField("suspicionMoment", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">Describe el caso completo</label>
            <textarea
              className="field-base min-h-36"
              value={draft.fullDescription}
              onChange={(event) => updateField("fullDescription", event.target.value)}
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
            <label className="label-base">Hashes de transacción</label>
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
              onChange={(event) => updateField("platformLinks", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">Correos usados por la empresa</label>
            <textarea
              className="field-base min-h-24"
              value={draft.companyEmails}
              onChange={(event) => updateField("companyEmails", event.target.value)}
            />
          </div>
          <div>
            <label className="label-base">
              Teléfonos o usuarios de WhatsApp / Telegram
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
              onChange={(event) => updateField("relevantUrls", event.target.value)}
            />
          </div>
        </div>
      ) : null}

      {step === 3 ? <FileUploader files={files} onFilesChange={setFiles} /> : null}

      {step === 4 ? (
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-border/70 bg-background-elevated/65 p-4">
            <h2 className="text-sm font-semibold text-white">
              Resumen previo al análisis
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
                <dt className="text-muted-foreground">País</dt>
                <dd className="text-white">{draft.country}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Monto</dt>
                <dd className="text-white">
                  {draft.lostAmount} {draft.currency}
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
            Al continuar, el sistema guardará el caso, asociará la evidencia y
            preparará un informe preliminar con apoyo de IA.
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
          Atrás
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
            Generar informe preliminar con IA
          </StepButton>
        )}
      </div>
    </motion.div>
  );
}
