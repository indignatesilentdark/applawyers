"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BadgeCheck,
  FolderLock,
  Network,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";

type HeroCaseAnalysisProps = {
  ctaHref: string;
};

const bullets = [
  "Plataforma involucrada",
  "Wallets utilizadas",
  "Evidencias aportadas",
  "Posibles rutas de fondos",
  "Riesgos detectados",
  "Viabilidad preliminar del caso",
];

const nodes = [
  { label: "Transacciones", top: "10%", right: "2%" },
  { label: "Wallets", top: "28%", right: "0%" },
  { label: "Plataformas", top: "54%", right: "3%" },
  { label: "Evidencias", top: "76%", right: "5%" },
] as const;

export function HeroCaseAnalysis({ ctaHref }: HeroCaseAnalysisProps) {
  return (
    <section className="glass-panel desktop-hero-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-7 xl:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(24,196,135,0.14),transparent_26%),radial-gradient(circle_at_82%_22%,rgba(75,145,255,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_55%)]" />
      <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)] xl:items-center">
        <div>
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex size-2.5 rounded-full bg-accent shadow-[0_0_12px_rgba(24,196,135,0.9)] animate-pulse" />
            Análisis pendiente
          </motion.div>

          <motion.h1
            className="mt-5 max-w-4xl text-[2.8rem] font-semibold leading-[0.95] tracking-[-0.07em] text-white sm:text-[3.3rem] xl:text-[4.8rem]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            Descubre qué ocurrió
            <span className="block bg-gradient-to-r from-accent via-cyan-300 to-emerald-200 bg-clip-text text-transparent">
              con tu dinero
            </span>
          </motion.h1>

          <motion.p
            className="mt-5 max-w-2xl text-base leading-8 text-sky-100/76 xl:text-[1.08rem]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            Nuestro sistema analizará tu caso a fondo utilizando inteligencia
            artificial, análisis documental y metodología de investigación
            especializada.
          </motion.p>

          <motion.div
            className="mt-6 grid gap-3 sm:grid-cols-2"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            {bullets.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <BadgeCheck className="size-5 text-accent" />
                <span className="text-[1.02rem] text-white/92">{item}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
          >
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Link
                href={ctaHref}
                className="inline-flex min-h-16 w-full items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,#20d8a4,#53e38f)] px-8 text-center text-base font-semibold uppercase tracking-[0.18em] text-[#042217] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_24px_60px_rgba(24,196,135,0.24)] transition hover:brightness-105 hover:shadow-[0_0_32px_rgba(24,196,135,0.35)] sm:w-auto"
              >
                Iniciar análisis profundo
              </Link>
            </motion.div>

            <div className="flex items-center gap-3 rounded-[1.25rem] border border-border/70 bg-background/25 px-4 py-3">
              <ShieldCheck className="size-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-white">100% privado y confidencial</p>
                <p className="text-sm text-sky-100/70">Tus datos están protegidos</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="relative min-h-[24rem]"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
        >
          <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(12,110,99,0.16),transparent_46%)]" />

          <div className="absolute left-[18%] top-[16%] h-[64%] w-[46%] rounded-[2rem] border border-cyan-300/22 bg-[linear-gradient(180deg,rgba(25,44,70,0.92),rgba(11,22,36,0.98))] shadow-[0_34px_80px_rgba(1,10,22,0.58)]" />
          <div className="absolute left-[24%] top-[12%] h-[66%] w-[48%] rounded-[2rem] border border-accent/25 bg-[linear-gradient(180deg,rgba(31,50,76,0.96),rgba(11,22,36,0.99))] shadow-[0_34px_90px_rgba(1,10,22,0.6)]" />
          <div className="absolute left-[14%] top-[18%] h-[68%] w-[50%] rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(21,35,58,0.98),rgba(8,16,28,1))] shadow-[0_40px_100px_rgba(1,8,18,0.7)]" />

          <div className="absolute left-[28%] top-[38%] flex size-24 items-center justify-center rounded-[2rem] border border-border/70 bg-background/55 backdrop-blur-xl">
            <FolderLock className="size-12 text-slate-200" />
          </div>
          <div className="absolute left-[36%] top-[34%] flex size-12 items-center justify-center rounded-full border border-accent/20 bg-accent/8 text-accent shadow-[0_0_28px_rgba(24,196,135,0.24)]">
            <ShieldCheck className="size-6" />
          </div>

          {nodes.map((node, index) => (
            <motion.div
              key={node.label}
              className="absolute flex items-center gap-3 rounded-full border border-border/70 bg-background/55 px-4 py-2.5 backdrop-blur-md"
              style={{ right: node.right, top: node.top }}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              {index === 0 ? (
                <Network className="size-4 text-cyan-300" />
              ) : index === 1 ? (
                <FolderLock className="size-4 text-cyan-300" />
              ) : index === 2 ? (
                <ScanSearch className="size-4 text-cyan-300" />
              ) : (
                <ShieldCheck className="size-4 text-cyan-300" />
              )}
              <span className="text-sm text-white/92">{node.label}</span>
            </motion.div>
          ))}

          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 540 420"
            fill="none"
            aria-hidden="true"
          >
            <path d="M270 180 C360 110 395 100 455 106" stroke="rgba(96,238,212,0.5)" strokeWidth="1.5" />
            <path d="M270 208 C365 185 395 187 458 193" stroke="rgba(96,238,212,0.45)" strokeWidth="1.5" />
            <path d="M270 245 C350 250 393 260 446 282" stroke="rgba(96,238,212,0.38)" strokeWidth="1.5" />
            <path d="M270 278 C345 320 385 336 442 360" stroke="rgba(96,238,212,0.34)" strokeWidth="1.5" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
