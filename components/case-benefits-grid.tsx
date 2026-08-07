"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Clock3,
  FileDown,
  FileSearch,
  FileText,
  Globe2,
} from "lucide-react";

const benefits = [
  {
    description: "Resumen técnico inicial para abrir una ruta de revisión prudente.",
    icon: FileText,
    title: "Informe preliminar IA",
  },
  {
    description: "Lectura estructurada de archivos, capturas y soportes aportados.",
    icon: FileSearch,
    title: "Análisis de evidencias",
  },
  {
    description: "Reconstrucción estimada de hechos, contactos y señales del caso.",
    icon: Clock3,
    title: "Cronología del caso",
  },
  {
    description: "Identificación inicial de posibles marcos regulatorios o territorios útiles.",
    icon: Globe2,
    title: "Posibles jurisdicciones",
  },
  {
    description: "Alertas tempranas sobre inconsistencias, presión comercial o trazas sensibles.",
    icon: AlertTriangle,
    title: "Riesgos identificados",
  },
  {
    description: "Un expediente claro, privado y listo para descargar o compartir con revisión humana.",
    icon: FileDown,
    title: "Dossier descargable",
  },
];

export function CaseBenefitsGrid() {
  return (
    <section className="glass-panel rounded-[1.75rem] p-5 lg:p-6">
      <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
        Valor entregado
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        ¿Qué recibirás?
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;

          return (
            <motion.article
              key={benefit.title}
              className="surface-muted rounded-[1.35rem] p-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              transition={{ delay: index * 0.03, duration: 0.26 }}
              viewport={{ once: true, amount: 0.25 }}
            >
              <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/30 text-accent">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-white">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-sky-100/72">
                {benefit.description}
              </p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
