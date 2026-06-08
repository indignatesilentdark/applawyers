import Link from "next/link";
import type { CaseRow } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";

type CaseCardProps = {
  caseItem: Pick<
    CaseRow,
    "company_name" | "created_at" | "currency" | "fraud_type" | "id" | "lost_amount" | "status"
  >;
  hasReport: boolean;
};

export function CaseCard({ caseItem, hasReport }: CaseCardProps) {
  return (
    <article className="glass-panel rounded-[1.5rem] p-5 lg:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-medium text-white">
            {caseItem.company_name || "Caso sin plataforma especificada"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {caseItem.fraud_type || "Tipo de fraude no especificado"}
          </p>
        </div>
        <StatusBadge status={caseItem.status} />
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-background-elevated/60 p-3">
          <dt className="text-muted-foreground">Fecha</dt>
          <dd className="mt-1 text-white">{formatDate(caseItem.created_at)}</dd>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background-elevated/60 p-3">
          <dt className="text-muted-foreground">Monto</dt>
          <dd className="mt-1 text-white">
            {formatCurrency(caseItem.lost_amount, caseItem.currency ?? "USD")}
          </dd>
        </div>
      </dl>

      {hasReport ? (
        <Link
          href={`/cases/${caseItem.id}/report`}
          className="mt-5 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
        >
          Ver informe
        </Link>
      ) : null}
    </article>
  );
}
