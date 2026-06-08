"use client";

import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";

type InvestigationTimelineProps = {
  currentStep?: number;
};

const steps = [
  "Información personal",
  "Detalles del caso",
  "Evidencias",
  "Análisis IA profundo",
  "Informe preliminar",
];

export function InvestigationTimeline({
  currentStep = 1,
}: InvestigationTimelineProps) {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <section className="glass-panel rounded-[1.75rem] p-5 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
            Proceso guiado
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Timeline de investigación
          </h2>
        </div>
        <div className="hidden rounded-full border border-border/70 bg-background/30 px-4 py-2 text-sm text-sky-100/78 sm:block">
          10 - 15 minutos
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="min-w-[44rem]">
          <div className="relative">
            <div className="absolute left-0 right-0 top-5 h-px bg-border/80" />
            <motion.div
              className="absolute left-0 top-5 h-px bg-gradient-to-r from-accent via-cyan-300 to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />

            <div className="relative grid grid-cols-5 gap-4">
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const active = stepNumber <= currentStep;

                return (
                  <div key={step} className="pr-4">
                    <div
                      className={`flex size-10 items-center justify-center rounded-full border text-sm font-semibold ${
                        active
                          ? "border-accent bg-accent/10 text-accent shadow-[0_0_18px_rgba(24,196,135,0.18)]"
                          : "border-border/80 bg-background/45 text-muted-foreground"
                      }`}
                    >
                      {stepNumber}
                    </div>
                    <p
                      className={`mt-4 max-w-[9rem] text-base leading-7 ${
                        active ? "text-white" : "text-sky-100/68"
                      }`}
                    >
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="surface-muted mt-6 flex items-start gap-3 rounded-[1.3rem] p-4">
        <div className="mt-0.5 inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/30 text-sky-100/86">
          <Clock3 className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            Tiempo estimado: <span className="text-accent">10 - 15 minutos</span>
          </p>
          <p className="mt-1 text-sm leading-6 text-sky-100/72">
            Responde algunas preguntas y deja que nuestra IA investigue por ti.
          </p>
        </div>
      </div>
    </section>
  );
}
