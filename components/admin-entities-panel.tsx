"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, DatabaseZap, Globe2, Search, ShieldAlert, Sparkles } from "lucide-react";

type AdminEntityItem = {
  id: string;
  name: string;
  riskLevel: string;
  sourceNote: string | null;
  sourceType: string;
  status: string;
  updatedAt: string;
};

type AdminEntitiesPanelProps = {
  entities: AdminEntityItem[];
  externalFeedCount: number;
};

function formatRelativeDate(date: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getRiskTone(riskLevel: string) {
  switch (riskLevel) {
    case "alto":
      return "border-rose-400/25 bg-rose-500/10 text-rose-100";
    case "medio":
      return "border-amber-400/25 bg-amber-500/10 text-amber-100";
    default:
      return "border-sky-400/20 bg-sky-400/10 text-sky-100";
  }
}

export function AdminEntitiesPanel({
  entities,
  externalFeedCount,
}: AdminEntitiesPanelProps) {
  const [query, setQuery] = useState("");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredEntities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return entities;
    }

    return entities.filter((entity) =>
      [
        entity.name,
        entity.sourceType,
        entity.status,
        entity.sourceNote ?? "",
        entity.riskLevel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [entities, query]);

  function handleSync() {
    setSyncMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/cron/broker-feed", {
          method: "POST",
        });
        const payload = (await response.json()) as {
          createdFeeds?: number;
          error?: string;
          upsertedBrokers?: number;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "No pudimos sincronizar las entidades.");
        }

        setSyncMessage(
          `Sincronización completada. Feed: ${payload.createdFeeds ?? 0} · entidades actualizadas: ${payload.upsertedBrokers ?? 0}.`,
        );
      } catch (error) {
        setSyncMessage(
          error instanceof Error
            ? error.message
            : "No pudimos sincronizar las entidades.",
        );
      }
    });
  }

  return (
    <section className="glass-panel rounded-[1.9rem] p-5 lg:p-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <div className="relative overflow-hidden rounded-[1.6rem] border border-accent/20 bg-[radial-gradient(circle_at_top_left,rgba(36,222,170,0.18),transparent_42%),linear-gradient(180deg,rgba(12,24,44,0.96),rgba(8,15,31,0.92))] p-5">
          <div className="pointer-events-none absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 p-3 text-accent/80">
            <DatabaseZap className="size-5" />
          </div>

          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-emerald-100/70">
            Radar externo
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
            Sincronizar entidades desde fuentes públicas
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-sky-100/72">
            Actualiza el radar interno con brokers observados en WikiFX y otras
            señales del feed externo para reforzar las alertas del sistema.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90">
              <span className="text-muted-foreground">Entidades cargadas:</span>{" "}
              {entities.length}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90">
              <span className="text-muted-foreground">Feed externo:</span>{" "}
              {externalFeedCount}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSync}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="size-4" />
              {isPending ? "Sincronizando..." : "Sincronizar brokers externos"}
            </button>
            <div className="rounded-2xl border border-border/70 bg-background/25 px-4 py-3 text-sm text-sky-100/76">
              Solo admins pueden ejecutar esta actualización manual.
            </div>
          </div>

          {syncMessage ? (
            <p className="mt-4 rounded-2xl border border-border/70 bg-background/25 px-4 py-3 text-sm leading-6 text-white/88">
              {syncMessage}
            </p>
          ) : null}
        </div>

        <div className="surface-muted rounded-[1.6rem] p-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-amber-200">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
                Criterio operativo
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                Entidades bajo observación
              </h3>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm leading-7 text-sky-100/72">
            <p>
              Las coincidencias externas no se muestran como fraude confirmado.
              El sistema las conserva como observación, señal pública o reporte
              previo hasta que exista mayor validación.
            </p>
            <div className="rounded-2xl border border-amber-400/15 bg-amber-500/8 px-4 py-3 text-amber-100/88">
              Una entidad pasa de observación a reportado cuando acumula señales
              consistentes o revisión humana interna.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Entidades
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
              Lista inteligente de brokers y plataformas
            </h2>
          </div>

          <label className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, riesgo, estado o fuente..."
              className="field-base w-full pl-11"
            />
          </label>
        </div>

        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          <div className="rounded-full border border-border/70 bg-background/25 px-4 py-2 text-white/85">
            {filteredEntities.length} entidad
            {filteredEntities.length === 1 ? "" : "es"} visible
            {query ? "s" : ""}
          </div>
          <div className="rounded-full border border-border/70 bg-background/25 px-4 py-2 text-white/85">
            Búsqueda viva en sesión Entidades
          </div>
          <div className="rounded-full border border-border/70 bg-background/25 px-4 py-2 text-white/85">
            Coincidencias por fuente pública y radar interno
          </div>
        </div>

        <div className="space-y-3">
          {filteredEntities.length ? (
            filteredEntities.map((entity) => (
              <div
                key={entity.id}
                className="surface-contrast rounded-[1.35rem] p-4"
              >
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-white">
                        {entity.name}
                      </p>
                      <span
                        className={`rounded-full border px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] ${getRiskTone(entity.riskLevel)}`}
                      >
                        Riesgo {entity.riskLevel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-sky-100/72">
                      {entity.sourceNote || "Entidad cargada sin nota adicional."}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm text-white/85 sm:grid-cols-2 xl:min-w-[22rem]">
                    <div className="rounded-2xl border border-border/70 bg-background/25 px-4 py-3">
                      <span className="text-muted-foreground">Estado:</span>{" "}
                      {entity.status}
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/25 px-4 py-3">
                      <span className="text-muted-foreground">Actualizada:</span>{" "}
                      {formatRelativeDate(entity.updatedAt)}
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/25 px-4 py-3 sm:col-span-2">
                      <div className="flex items-center gap-2">
                        <Globe2 className="size-4 text-accent" />
                        <span className="text-muted-foreground">Fuente:</span>{" "}
                        {entity.sourceType}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.35rem] border border-border/70 bg-background/25 px-5 py-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-4 text-amber-200" />
                No encontramos entidades para esa búsqueda.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
