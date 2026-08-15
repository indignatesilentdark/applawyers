"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, LayoutDashboard, Search, Users2 } from "lucide-react";
import { AdminEntitiesPanel } from "@/components/admin-entities-panel";
import { formatCurrency, formatDate } from "@/lib/utils";

type AdminEntityItem = {
  id: string;
  name: string;
  riskLevel: string;
  sourceNote: string | null;
  sourceType: string;
  status: string;
  updatedAt: string;
};

type AdminUserItem = {
  id: string;
  email: string;
  createdAt: string;
  fullName: string;
  country: string | null;
  phone: string | null;
};

type AdminCaseItem = {
  id: string;
  companyName: string | null;
  fraudType: string | null;
  country: string | null;
  lostAmount: number | null;
  currency: string | null;
  status: string;
  createdAt: string;
  ownerLabel: string;
};

type AdminRegistryPanelProps = {
  entities: AdminEntityItem[];
  externalFeedCount: number;
  initialTab?: (typeof tabs)[number]["id"];
  users: AdminUserItem[];
  cases: AdminCaseItem[];
  totalCases: number;
};

const tabs = [
  { id: "overview", label: "Admin", icon: LayoutDashboard },
  { id: "users", label: "Usuarios", icon: Users2 },
  { id: "entities", label: "Entidades", icon: Building2 },
] as const;

export function AdminRegistryPanel({
  entities,
  externalFeedCount,
  initialTab = "overview",
  users,
  cases,
  totalCases,
}: AdminRegistryPanelProps) {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["id"]>(initialTab);
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) =>
      [user.fullName, user.email, user.country ?? "", user.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, users]);

  return (
    <section className="space-y-5">
      <div className="glass-panel rounded-[1.75rem] p-4 lg:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Admin
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
              Usuarios y entidades
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count =
                tab.id === "entities"
                  ? entities.length
                  : tab.id === "users"
                    ? users.length
                    : totalCases;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    isActive
                      ? "surface-accent inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                      : "inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-background/25 px-4 py-3 text-sm font-medium text-sky-100/78 transition hover:border-accent/25 hover:text-white"
                  }
                >
                  <Icon className="size-4" />
                  <span>{tab.label}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[0.68rem]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeTab === "overview" ? (
        <section className="glass-panel rounded-[1.9rem] p-5 lg:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Admin
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                Casos recientes
              </h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {totalCases} registro{totalCases === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-3">
            {cases.length ? (
              cases.map((item) => (
                <div
                  key={item.id}
                  className="surface-contrast rounded-[1.35rem] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {item.companyName || "Caso sin empresa"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.fraudType || "Tipo no especificado"} ·{" "}
                        {item.country || "País no especificado"}
                      </p>
                    </div>
                    <div className="rounded-full border border-accent/20 bg-accent/8 px-3 py-1 text-xs font-medium text-white">
                      {item.status}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-sky-300/10 bg-sky-300/5 px-4 py-3 text-sm text-white/90">
                      Cliente: {item.ownerLabel}
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/25 px-4 py-3 text-sm text-white/90">
                      Fecha: {formatDate(item.createdAt)}
                    </div>
                    <div className="rounded-2xl border border-accent/15 bg-accent/5 px-4 py-3 text-sm text-white/90">
                      Monto: {formatCurrency(item.lostAmount, item.currency ?? "USD")}
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/25 px-4 py-3 text-sm text-white/90">
                      <Link
                        href={`/admin/cases/${item.id}`}
                        className="font-medium text-accent"
                      >
                        Abrir dossier
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] border border-border/70 bg-background/25 px-5 py-6 text-sm text-muted-foreground">
                Aún no hay casos creados.
              </div>
            )}
          </div>
        </section>
      ) : activeTab === "entities" ? (
        <AdminEntitiesPanel
          entities={entities}
          externalFeedCount={externalFeedCount}
        />
      ) : (
        <section className="glass-panel rounded-[1.9rem] p-5 lg:p-6">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Usuarios registrados
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                Búsqueda de usuarios
              </h2>
            </div>

            <label className="relative block w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre, correo, país o teléfono..."
                className="field-base w-full pl-11"
              />
            </label>
          </div>

          <div className="mb-4 flex flex-wrap gap-3 text-sm">
            <div className="rounded-full border border-border/70 bg-background/25 px-4 py-2 text-white/85">
              {filteredUsers.length} usuario
              {filteredUsers.length === 1 ? "" : "s"} visible
              {query ? "s" : ""}
            </div>
            <div className="rounded-full border border-border/70 bg-background/25 px-4 py-2 text-white/85">
              Búsqueda viva en sesión Usuarios
            </div>
          </div>

          <div className="space-y-3">
            {filteredUsers.length ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="surface-contrast rounded-[1.35rem] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {user.fullName || user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Alta: {formatDate(user.createdAt)}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-sky-300/10 bg-sky-300/5 px-4 py-3 text-sm text-white/90">
                      País: {user.country || "No registrado"}
                    </div>
                    <div className="rounded-2xl border border-accent/15 bg-accent/5 px-4 py-3 text-sm text-white/90">
                      Teléfono: {user.phone || "No registrado"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] border border-border/70 bg-background/25 px-5 py-6 text-sm text-muted-foreground">
                No encontramos usuarios para esa búsqueda.
              </div>
            )}
          </div>
        </section>
      )}
    </section>
  );
}
