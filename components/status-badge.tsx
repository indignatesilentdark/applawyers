import type { CaseStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<CaseStatus, string> = {
  Analizando: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  "Informe listo": "border-accent/40 bg-accent/10 text-white",
  Pendiente: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  "Requiere información": "border-rose-400/30 bg-rose-400/10 text-rose-100",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}
