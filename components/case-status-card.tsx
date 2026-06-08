"use client";

import { motion } from "framer-motion";
import { FileClock, FolderSearch, ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  analysis: ScanSearch,
  file: FileClock,
  report: FolderSearch,
} as const;

type CaseStatusCardProps = {
  description?: string;
  icon: keyof typeof iconMap;
  label: string;
  tone?: "amber" | "emerald" | "slate";
  value: string;
};

const toneMap = {
  amber: {
    badge: "bg-amber-400/12 text-amber-300 border-amber-300/18",
    value: "text-amber-300",
  },
  emerald: {
    badge: "bg-cyan-400/12 text-cyan-300 border-cyan-300/18",
    value: "text-cyan-300",
  },
  slate: {
    badge: "bg-slate-300/8 text-slate-200 border-border/70",
    value: "text-slate-200",
  },
} as const;

export function CaseStatusCard({
  description,
  icon,
  label,
  tone = "slate",
  value,
}: CaseStatusCardProps) {
  const Icon = iconMap[icon];
  const styles = toneMap[tone];

  return (
    <motion.article
      className="surface-muted rounded-[1.4rem] p-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-2xl border",
            styles.badge,
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn("mt-1 text-2xl font-semibold tracking-[-0.04em]", styles.value)}>
            {value}
          </p>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-sky-100/72">{description}</p>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
