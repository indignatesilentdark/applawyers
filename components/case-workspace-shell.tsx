"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Files,
  FolderOpen,
  Home,
  Menu,
  MessageCircleMore,
  PlusCircle,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import type { ProfileRow } from "@/lib/types";
import { cn } from "@/lib/utils";

type CaseWorkspaceShellProps = {
  children: React.ReactNode;
  profile?: Pick<ProfileRow, "email" | "first_name" | "last_name"> | null;
  title?: string;
  eyebrow?: string;
  activeItem?: string;
  isAdmin?: boolean;
};

const navigationItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/cases/new", icon: PlusCircle, label: "Nuevo caso" },
  { href: "/dashboard", adminHref: "/admin/cases", icon: FolderOpen, label: "Casos" },
  { href: "/security", icon: Settings, label: "Configuración" },
  { href: "/admin", icon: Users, label: "Admin", adminOnly: true },
  { href: "/admin", icon: ClipboardList, label: "Actividad", adminOnly: true },
  { href: "/admin", icon: MessageCircleMore, label: "Mensajes", badge: "3", adminOnly: true },
  { href: "/admin", icon: Files, label: "Entidades", adminOnly: true },
  { href: "/admin", icon: CalendarDays, label: "Agenda", adminOnly: true },
];

export function CaseWorkspaceShell({
  children,
  profile,
  title = "Nuevo caso",
  eyebrow = "Solicitud privada",
  activeItem = "Nuevo caso",
  isAdmin = false,
}: CaseWorkspaceShellProps) {
  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");
  const userName = fullName || "Usuario privado";
  const avatarLabel = userName.slice(0, 1).toUpperCase();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const visibleNavigationItems = navigationItems.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#091322_0%,#06101d_100%)] text-white">
      <div
        className={cn(
          "mx-auto grid min-h-screen max-w-[1760px] lg:transition-[grid-template-columns] lg:duration-300",
          sidebarCollapsed
            ? "lg:grid-cols-[5.5rem_minmax(0,1fr)]"
            : "lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18.5rem_minmax(0,1fr)]",
        )}
      >
        <aside
          className={cn(
            "hidden border-r border-border/70 bg-[linear-gradient(180deg,rgba(7,17,31,0.98),rgba(4,11,20,0.98))] lg:flex lg:flex-col",
            sidebarCollapsed ? "lg:px-3" : "",
          )}
        >
          <div
            className={cn(
              "border-b border-border/70 py-7",
              sidebarCollapsed ? "px-2" : "px-6",
            )}
          >
            <div
              className={cn(
                "flex items-center",
                sidebarCollapsed ? "justify-center" : "gap-3",
              )}
            >
              <div className="relative size-11 overflow-hidden rounded-2xl border border-accent/15 bg-accent/10">
                <Image
                  alt="Approve Lawyers"
                  className="object-contain"
                  fill
                  sizes="44px"
                  src="/logo-applawyers-original.png"
                />
              </div>
              {!sidebarCollapsed ? (
                <div>
                  <p className="text-[1.05rem] font-semibold tracking-[-0.03em] text-white">
                    Approve
                  </p>
                  <p className="-mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-accent">
                    Lawyers
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <nav
            className={cn(
              "flex-1 space-y-1 py-6",
              sidebarCollapsed ? "px-1" : "px-4",
            )}
          >
            {visibleNavigationItems.map((item) => {
              const Icon = item.icon;
              const href =
                isAdmin && "adminHref" in item && item.adminHref ? item.adminHref : item.href;

              return (
                <Link
                  key={`${href}-${item.label}`}
                  href={href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    "flex rounded-2xl py-3 text-sm text-sky-100/74 transition",
                    item.label === activeItem
                      ? "surface-accent text-white"
                      : "hover:bg-white/5 hover:text-white",
                    sidebarCollapsed
                      ? "justify-center px-2"
                      : "items-center justify-between px-4",
                  )}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <span
                    className={cn(
                      "flex items-center",
                      sidebarCollapsed ? "justify-center" : "gap-3",
                    )}
                  >
                    <Icon className="size-4" />
                    {!sidebarCollapsed ? item.label : null}
                  </span>
                  {item.badge && !sidebarCollapsed ? (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-accent/20 px-2 py-1 text-[0.7rem] font-semibold text-accent">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className={cn("space-y-4 p-4", sidebarCollapsed ? "px-1 pb-5" : "")}>
            {!sidebarCollapsed ? (
              <div className="surface-muted rounded-[1.4rem] p-4">
                <p className="text-sm font-semibold text-white">¿Necesitas ayuda?</p>
                <p className="mt-2 text-sm leading-6 text-sky-100/72">
                  Nuestro equipo está listo para asistirte.
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center rounded-xl border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent"
                >
                  Contactar soporte
                </button>
              </div>
            ) : null}

            <div
              className={cn(
                "surface-contrast rounded-[1.4rem] p-4",
                sidebarCollapsed ? "px-2 py-3" : "",
              )}
            >
              <div
                className={cn(
                  "flex items-center",
                  sidebarCollapsed ? "justify-center" : "gap-3",
                )}
              >
                <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-500/18 text-base font-semibold text-violet-100">
                  {avatarLabel}
                </div>
                {!sidebarCollapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{userName}</p>
                    <p className="truncate text-xs text-sky-100/68">Cuenta activa</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-screen flex-col">
          <header className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(10,20,34,0.92),rgba(8,16,28,0.92))] px-4 py-4 lg:px-7 lg:py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-white lg:hidden"
                  aria-label="Abrir navegación"
                  onClick={() => setMobileNavOpen(true)}
                >
                  <Menu className="size-5" />
                </button>
                <button
                  type="button"
                  className="hidden size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/25 text-sky-100/76 transition hover:border-accent/30 hover:text-white lg:inline-flex"
                  aria-label={sidebarCollapsed ? "Expandir navegación" : "Colapsar navegación"}
                  onClick={() => setSidebarCollapsed((value) => !value)}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="size-4" />
                  ) : (
                    <ChevronLeft className="size-4" />
                  )}
                </button>
                <div>
                  <p className="text-[0.78rem] uppercase tracking-[0.24em] text-muted-foreground">
                    {eyebrow}
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">
                    {title}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="hidden size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/25 text-sky-100/70 lg:inline-flex"
                  aria-label="Buscar"
                >
                  <Search className="size-4" />
                </button>
                <button
                  type="button"
                  className="hidden size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/25 text-sky-100/70 lg:inline-flex"
                  aria-label="Notificaciones"
                >
                  <Bell className="size-4" />
                </button>

                <div className="surface-muted hidden items-center gap-3 rounded-full px-3 py-2 lg:flex">
                  <div className="flex size-11 items-center justify-center rounded-full bg-violet-500/18 text-sm font-semibold text-violet-100">
                    {avatarLabel}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{userName}</p>
                    <p className="truncate text-xs text-sky-100/66">
                      {profile?.email ?? "Cuenta activa"}
                    </p>
                  </div>
                </div>

                <SignOutButton iconOnly />
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 py-5 lg:px-7 lg:py-8 xl:px-8">{children}</div>
        </section>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/72 backdrop-blur-sm transition lg:hidden",
          mobileNavOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileNavOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[18rem] max-w-[86vw] flex-col border-r border-border/70 bg-[linear-gradient(180deg,rgba(7,17,31,0.99),rgba(4,11,20,0.99))] shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition-transform duration-300 lg:hidden",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="relative size-11 overflow-hidden rounded-2xl border border-accent/15 bg-accent/10">
              <Image
                alt="Approve Lawyers"
                className="object-contain"
                fill
                sizes="44px"
                src="/logo-applawyers-original.png"
              />
            </div>
            <div>
              <p className="text-[1.05rem] font-semibold tracking-[-0.03em] text-white">
                Approve
              </p>
              <p className="-mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-accent">
                Lawyers
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-background/25 text-white"
            aria-label="Cerrar navegación"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {visibleNavigationItems.map((item) => {
            const Icon = item.icon;
            const href =
              isAdmin && "adminHref" in item && item.adminHref ? item.adminHref : item.href;

            return (
              <Link
                key={`mobile-${href}-${item.label}`}
                href={href}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-sky-100/74",
                  item.label === activeItem
                    ? "surface-accent text-white"
                    : "hover:bg-white/5 hover:text-white",
                )}
                onClick={() => setMobileNavOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-4" />
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-accent/20 px-2 py-1 text-[0.7rem] font-semibold text-accent">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>
    </main>
  );
}
