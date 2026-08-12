"use client";

import { motion } from "framer-motion";
import { Banknote, CalendarDays, CircleDollarSign, Globe, Landmark, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FileUploader } from "@/components/file-uploader";
import { LoadingState } from "@/components/loading-state";
import {
  trackCaseStarted,
  trackCaseStepCompleted,
  trackCaseSubmitted,
} from "@/lib/gtag";

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
  "Información general",
  "Detalles del caso",
  "Evidencia y documentos",
  "Revisión",
  "Confirmación",
];

const tipsByStep = [
  [
    "Sé lo más detallado posible",
    "Adjunta evidencia relevante",
    "Verifica los datos antes de continuar",
  ],
  [
    "Explica cómo empezó el contacto",
    "Resume promesas o presiones recibidas",
    "Describe cuándo sospechaste del fraude",
  ],
  [
    "Incluye wallets, hashes y enlaces",
    "Agrega correos, teléfonos o usuarios",
    "Sube capturas, recibos o documentos",
  ],
  [
    "Revisa cada dato antes de enviar",
    "Confirma montos, fechas y plataforma",
    "Asegúrate de incluir toda la evidencia",
  ],
  [
    "El análisis comenzará al confirmar",
    "Conserva tu correo disponible",
    "Podrás descargar tu dossier después",
  ],
] as const;

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
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [brokerMatches, setBrokerMatches] = useState<
    Array<{
      id: string;
      matchReason: string;
      name: string;
      riskLevel: string;
      status: string;
    }>
  >([]);
  const [isCheckingBroker, setIsCheckingBroker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Preparando el caso...");
  const hasTrackedStartRef = useRef(false);

  useEffect(() => {
    window.localStorage.setItem(
      "approvedlawyer:case-draft",
      JSON.stringify(draft),
    );
  }, [draft]);

  useEffect(() => {
    if (hasTrackedStartRef.current) {
      return;
    }

    const hasExistingDraft = Object.values(draft).some((value) => `${value}`.trim().length > 0);
    trackCaseStarted(hasExistingDraft ? "resume_draft" : "fresh_start");
    hasTrackedStartRef.current = true;
  }, [draft]);

  useEffect(() => {
    const query = draft.companyName.trim();
    if (query.length < 3) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setIsCheckingBroker(true);
        const response = await fetch(
          `/api/brokers/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as {
          matches?: Array<{
            id: string;
            matchReason: string;
            name: string;
            riskLevel: string;
            status: string;
          }>;
        };

        if (!response.ok) {
          throw new Error();
        }

        setBrokerMatches(payload.matches ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setBrokerMatches([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsCheckingBroker(false);
        }
      }
    }, 320);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [draft.companyName]);

  function updateField<Key extends keyof DraftState>(
    key: Key,
    value: DraftState[Key],
  ) {
    if (key === "companyName" && `${value}`.trim().length < 3) {
      setBrokerMatches([]);
      setIsCheckingBroker(false);
    }

    setDraftMessage(null);
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
      return draft.contactMethod && draft.fullDescription;
    }

    if (step === 2) {
      return true;
    }

    return true;
  }

  function saveDraftSnapshot() {
    window.localStorage.setItem(
      "approvedlawyer:case-draft",
      JSON.stringify(draft),
    );
    setDraftMessage("Borrador guardado localmente en esta sesión.");
  }

  async function handleSubmit() {
    setError(null);

    try {
      setIsSubmitting(true);
      setLoadingLabel("Guardando la información del caso...");

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

      trackCaseSubmitted(files.length);
      window.localStorage.removeItem("approvedlawyer:case-draft");
      router.push(`/cases/${payload.caseId}/report`);
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
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)_minmax(19rem,0.95fr)]">
        <article className="surface-contrast rounded-[1.55rem] p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                Plataforma privada
              </p>
              <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-white">
                Approve Lawyers
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-sky-100/72">
            Plataforma segura para la gestión y seguimiento de casos legales.
          </p>
          <div className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Conexión segura
          </div>
        </article>

        <article className="surface-muted rounded-[1.55rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                Vista actual
              </p>
              <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-white">
                Crear nuevo caso
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/30 p-3 text-sky-100/70">
              <Sparkles className="size-4" />
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-sky-100/72">
            Espacio privado para revisar actividad, acceder a tus herramientas y continuar el flujo del caso.
          </p>
        </article>

        <article className="surface-muted rounded-[1.55rem] p-5">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-3xl bg-violet-500/18 text-2xl font-semibold text-violet-100">
              M
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <p className="truncate text-xl font-semibold tracking-[-0.04em] text-white">
                  Miguel Henao
                </p>
                <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-accent">
                  Cuenta activa
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-sky-100/72">
                capitalprofx.com@gmail.com
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-4xl font-semibold tracking-[-0.05em] text-white">
            Crear nuevo caso
          </h2>
        </div>

        <button
          type="button"
          onClick={saveDraftSnapshot}
          className="inline-flex items-center justify-center rounded-2xl border border-border/70 bg-background/35 px-5 py-3 text-sm font-medium text-white"
        >
          Guardar borrador
        </button>
      </section>

      <div className="flex flex-wrap items-center gap-3 rounded-[1.6rem] border border-border/70 bg-background/20 px-5 py-4">
        {steps.map((stepLabel, index) => (
          <div key={stepLabel} className="flex items-center gap-3">
            <div
              className={`flex size-8 items-center justify-center rounded-full border text-sm font-semibold ${
                index === step
                  ? "border-accent bg-accent text-accent-foreground"
                  : index < step
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-border/80 bg-background/35 text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`text-sm ${
                index === step ? "text-white" : "text-sky-100/66"
              }`}
            >
              {stepLabel}
            </span>
            {index < steps.length - 1 ? (
              <div className="hidden h-px w-8 bg-border/70 sm:block" />
            ) : null}
          </div>
        ))}
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="glass-panel rounded-[1.75rem] overflow-hidden">
          <div className="border-b border-border/70 px-5 py-5 lg:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-3xl font-semibold tracking-[-0.05em] text-white">
                  {steps[step]}
                </h3>
                <div className="mt-4 h-1.5 w-full max-w-[28rem] rounded-full bg-border/60">
                  <div
                    className="h-1.5 rounded-full bg-accent transition-all"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/25 px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <LockKeyhole className="size-3.5" />
                Flujo privado
              </div>
            </div>
          </div>

          <div className="px-5 py-5 lg:px-6">
            {step === 0 ? (
              <div className="grid gap-5">
                <div>
                  <label className="label-base">Empresa o plataforma involucrada</label>
                  <input
                    className="field-base"
                    value={draft.companyName}
                    onChange={(event) => updateField("companyName", event.target.value)}
                  />
                  {isCheckingBroker ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Revisando entidades reportadas...
                    </p>
                  ) : null}
                  {brokerMatches.length ? (
                    <div className="mt-3 rounded-[1.35rem] border border-amber-400/25 bg-[linear-gradient(180deg,rgba(66,44,16,0.52),rgba(28,22,13,0.5))] p-4">
                      <p className="text-sm font-semibold text-white">
                        Detectamos coincidencias previas con entidades bajo observación
                      </p>
                      <div className="mt-3 space-y-3">
                        {brokerMatches.map((match) => (
                          <div
                            key={match.id}
                            className="rounded-[1rem] border border-white/8 bg-background/35 p-3"
                          >
                            <p className="text-sm font-semibold text-white">{match.name}</p>
                            <p className="mt-1 text-sm text-sky-100/74">{match.matchReason}</p>
                            <p className="mt-2 inline-flex rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-amber-200/90">
                              Riesgo {match.riskLevel} · Estado {match.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
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
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className="field-base pl-11"
                      value={draft.country}
                      onChange={(event) => updateField("country", event.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="label-base">Fecha aproximada del hecho</label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        className="field-base pr-11"
                        type="date"
                        value={draft.startDate}
                        onChange={(event) => updateField("startDate", event.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label-base">Monto exacto o aproximado perdido</label>
                    <div className="relative">
                      <CircleDollarSign className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        className="field-base pr-11"
                        type="number"
                        min="0"
                        placeholder="Ingresa el monto"
                        value={draft.lostAmount}
                        onChange={(event) => updateField("lostAmount", event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="label-base">Moneda</label>
                    <select
                      className="field-base"
                      value={draft.currency}
                      onChange={(event) => updateField("currency", event.target.value)}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="COP">COP</option>
                    </select>
                  </div>

                  <div>
                    <label className="label-base">Método de pago usado</label>
                    <div className="relative">
                      <Banknote className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        className="field-base pr-11"
                        placeholder="Transferencia, tarjeta, cripto, wallet..."
                        value={draft.paymentMethod}
                        onChange={(event) =>
                          updateField("paymentMethod", event.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label-base">Banco involucrado (si aplica)</label>
                  <div className="relative">
                    <Landmark className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className="field-base pr-11"
                      placeholder="Ingresa el nombre del banco"
                      value={draft.bankName}
                      onChange={(event) => updateField("bankName", event.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-5">
                <div>
                  <label className="label-base">Cómo te contactaron</label>
                  <textarea
                    className="field-base min-h-24"
                    value={draft.contactMethod}
                    onChange={(event) =>
                      updateField("contactMethod", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="label-base">Qué te prometieron</label>
                  <textarea
                    className="field-base min-h-24"
                    value={draft.promise}
                    onChange={(event) => updateField("promise", event.target.value)}
                  />
                </div>
                <div>
                  <label className="label-base">Conversaciones o instrucciones clave</label>
                  <textarea
                    className="field-base min-h-28"
                    value={draft.stepsFollowed}
                    onChange={(event) =>
                      updateField("stepsFollowed", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="label-base">Cuándo sospechaste que era fraude</label>
                  <textarea
                    className="field-base min-h-24"
                    value={draft.suspicionMoment}
                    onChange={(event) =>
                      updateField("suspicionMoment", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="label-base">Descripción completa del caso</label>
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
              <div className="grid gap-5">
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
                  <label className="label-base">Teléfonos o usuarios de WhatsApp / Telegram</label>
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
                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <label className="label-base">¿Ya denunciaste ante autoridades?</label>
                    <select
                      className="field-base"
                      value={draft.reportedToAuthorities}
                      onChange={(event) =>
                        updateField("reportedToAuthorities", event.target.value)
                      }
                    >
                      <option value="">Selecciona una opción</option>
                      {booleanOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-base">¿Ya contactaste abogados?</label>
                    <select
                      className="field-base"
                      value={draft.contactedLawyers}
                      onChange={(event) =>
                        updateField("contactedLawyers", event.target.value)
                      }
                    >
                      <option value="">Selecciona una opción</option>
                      {booleanOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-base">¿Recibiste ofertas de recuperación?</label>
                    <select
                      className="field-base"
                      value={draft.recoveryOfferReceived}
                      onChange={(event) =>
                        updateField("recoveryOfferReceived", event.target.value)
                      }
                    >
                      <option value="">Selecciona una opción</option>
                      {booleanOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
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

            {step === 3 ? (
              <div className="space-y-5">
                <FileUploader files={files} onFilesChange={setFiles} />
                <div className="rounded-[1.25rem] border border-border/70 bg-background/25 p-4 text-sm leading-7 text-sky-100/74">
                  Sube capturas, recibos, conversaciones, documentos o cualquier
                  evidencia que ayude a reconstruir el recorrido del fraude.
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-border/70 bg-background-elevated/65 p-4">
                  <h2 className="text-sm font-semibold text-white">
                    Resumen previo al análisis
                  </h2>
                  <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
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
                      <dt className="text-muted-foreground">Método de pago</dt>
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
                    {brokerMatches.length ? (
                      <div className="md:col-span-2">
                        <dt className="text-muted-foreground">Señales detectadas</dt>
                        <dd className="text-white">
                          {brokerMatches.length} coincidencia
                          {brokerMatches.length === 1 ? "" : "s"} con entidades reportadas
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                <p className="text-sm leading-7 text-muted-foreground">
                  Al continuar, el sistema guardará el caso, asociará la evidencia y preparará un informe preliminar con apoyo de IA.
                </p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-border/70 px-5 py-5 lg:px-6">
            {draftMessage ? (
              <p className="mb-4 rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-white">
                {draftMessage}
              </p>
            ) : null}

            {error ? (
              <p className="mb-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-white">
                {error}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((current) => current - 1)}
                className="rounded-2xl border border-border/70 bg-background/25 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                Atrás
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  disabled={!validateCurrentStep()}
                  onClick={() => {
                    trackCaseStepCompleted(step, steps[step]);
                    setStep((current) => current + 1);
                  }}
                  className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-50"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
                >
                  Analizar mi caso profundamente
                </button>
              )}
            </div>
          </div>
        </article>

        <aside className="space-y-5">
          <section className="glass-panel rounded-[1.6rem] p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/25 text-sky-100/76">
                <Sparkles className="size-4" />
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">
                Consejos
              </h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-sky-100/72">
              Completa toda la información posible para que nuestro equipo pueda evaluar tu caso de forma más efectiva.
            </p>
            <div className="mt-4 space-y-3">
              {tipsByStep[step].map((tip) => (
                <div key={tip} className="flex items-start gap-3 text-sm leading-7 text-sky-100/76">
                  <div className="mt-1 flex size-5 items-center justify-center rounded-full border border-accent/35 bg-accent/10 text-accent">
                    <ShieldCheck className="size-3" />
                  </div>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[1.6rem] p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/25 text-accent">
                <LockKeyhole className="size-4" />
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">
                Tu privacidad es importante
              </h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-sky-100/72">
              Toda la información que compartes está protegida con cifrado de nivel bancario y solo será utilizada para la gestión de tu caso.
            </p>
            <div className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Información segura
            </div>
          </section>
        </aside>
      </section>
    </motion.section>
  );
}
