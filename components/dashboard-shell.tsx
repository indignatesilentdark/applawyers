import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { MobilePanelMenu } from "@/components/mobile-panel-menu";
import type { ProfileRow } from "@/lib/types";
import { SignOutButton } from "@/components/sign-out-button";

type DashboardShellProps = {
  children: ReactNode;
  eyebrow?: string;
  isAdmin?: boolean;
  summaryText?: string;
  profile?: Pick<ProfileRow, "email" | "first_name" | "last_name"> | null;
  title: string;
};

export function DashboardShell({
  children,
  eyebrow,
  isAdmin,
  profile,
  summaryText,
  title,
}: DashboardShellProps) {
  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");
  const mobileTitle = eyebrow ?? title;

  return (
    <main className="page-shell overflow-x-clip py-5 lg:py-8">
      <div className="space-y-5">
        <header className="glass-panel relative overflow-hidden rounded-[1.75rem] p-5 lg:p-6">
          <MobilePanelMenu
            isAdmin={isAdmin}
            title={mobileTitle}
            userEmail={profile?.email}
            userName={fullName || undefined}
          />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(19rem,0.8fr)] xl:items-start">
            <div className="min-w-0">
              <div className="mb-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.7fr)]">
                <div className="surface-contrast min-w-0 overflow-hidden rounded-[1.35rem] pr-16 pl-3 py-3 lg:px-4 lg:py-4 xl:pr-4">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent/10 lg:size-16">
                      <Image
                        alt="Approve Lawyers"
                        className="object-contain"
                        fill
                        sizes="56px"
                        src="/logo-applawyers-original.png"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
                        Plataforma privada
                      </p>
                      <p className="truncate text-base font-semibold tracking-[-0.03em] text-white">
                        Approve Lawyers
                      </p>
                    </div>
                  </div>
                </div>

                <div className="surface-muted hidden rounded-[1.35rem] p-4 xl:flex xl:flex-col xl:justify-center">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
                    Vista actual
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-sky-100/72">
                    {summaryText ??
                      "Espacio privado para revisar actividad, acceder a tus herramientas y continuar el flujo del caso."}
                  </p>
                </div>
              </div>
              {eyebrow ? (
                <p className="mb-2 hidden text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground xl:block">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="hidden text-2xl font-semibold tracking-[-0.04em] text-white xl:block">
                {title}
              </h1>

              <nav className="mt-5 hidden flex-wrap gap-2 xl:flex">
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin"
                      className="surface-accent rounded-full px-4 py-2 text-xs font-medium text-white"
                    >
                      Admin
                    </Link>
                    <Link
                      href="/admin/cases"
                      className="rounded-full border border-border/70 bg-background-elevated/30 px-4 py-2 text-xs font-medium text-white"
                    >
                      Casos
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="rounded-full border border-border/70 bg-background-elevated/30 px-4 py-2 text-xs font-medium text-white"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/cases/new"
                      className="rounded-full border border-border/70 bg-background-elevated/30 px-4 py-2 text-xs font-medium text-white"
                    >
                      Nuevo caso
                    </Link>
                    <Link
                      href="/profile"
                      className="rounded-full border border-border/70 bg-background-elevated/30 px-4 py-2 text-xs font-medium text-white"
                    >
                      Perfil
                    </Link>
                    <Link
                      href="/security"
                      className="rounded-full border border-border/70 bg-background-elevated/30 px-4 py-2 text-xs font-medium text-white"
                    >
                      Seguridad
                    </Link>
                  </>
                )}
              </nav>
            </div>
            <div className="min-w-0 space-y-4 xl:pl-3">
              <div className="hidden justify-start xl:flex xl:justify-end">
                <SignOutButton />
              </div>
              <div className="surface-muted min-w-0 rounded-[1.5rem] p-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/15 text-sm font-semibold text-accent">
                    {fullName ? fullName.slice(0, 1).toUpperCase() : "A"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="truncate text-base font-semibold text-white">
                        {fullName || "Usuario autenticado"}
                      </p>
                      <span className="rounded-full border border-border/70 bg-background/35 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                        Cuenta activa
                      </span>
                    </div>
                    <p className="mt-1 break-words text-sm leading-6 text-sky-100/80">
                      {profile?.email ?? "Sesión protegida"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
