import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ProfileRow } from "@/lib/types";
import { SignOutButton } from "@/components/sign-out-button";

type DashboardShellProps = {
  children: ReactNode;
  eyebrow?: string;
  isAdmin?: boolean;
  profile?: Pick<ProfileRow, "email" | "first_name" | "last_name"> | null;
  title: string;
};

export function DashboardShell({
  children,
  eyebrow,
  isAdmin,
  profile,
  title,
}: DashboardShellProps) {
  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="page-shell py-5 lg:py-8">
      <div className="space-y-5">
        <header className="glass-panel rounded-[1.75rem] p-5 lg:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(19rem,0.8fr)] xl:items-start">
            <div className="min-w-0">
              <div className="surface-contrast mb-4 overflow-hidden rounded-[1.35rem] px-3 py-3 lg:px-4 lg:py-4">
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
              {eyebrow ? (
                <p className="mb-2 text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                {title}
              </h1>

              <nav className="mt-5 flex flex-wrap gap-2">
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
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="surface-accent rounded-full px-4 py-2 text-xs font-medium text-white"
                  >
                    Admin
                  </Link>
                ) : null}
              </nav>
            </div>
            <div className="space-y-4 xl:pl-3">
              <div className="flex justify-start xl:justify-end">
                <SignOutButton />
              </div>
              <div className="surface-muted rounded-[1.5rem] p-4">
                <div className="flex items-center gap-4">
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
                    <p className="mt-1 truncate text-sm text-sky-100/80">
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
