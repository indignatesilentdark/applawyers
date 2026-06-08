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
    <main className="page-shell py-5">
      <div className="space-y-5">
        <header className="glass-panel rounded-[1.75rem] p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-4 overflow-hidden rounded-[1.35rem] border border-border/70 bg-background-elevated/70 px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent/10">
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
            </div>
            <SignOutButton />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background-elevated/70 p-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-accent/15 text-sm font-semibold text-accent">
              {fullName ? fullName.slice(0, 1).toUpperCase() : "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {fullName || "Usuario autenticado"}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {profile?.email ?? "Sesión protegida"}
              </p>
            </div>
          </div>

          <nav className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-border/70 px-4 py-2 text-xs font-medium text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/cases/new"
              className="rounded-full border border-border/70 px-4 py-2 text-xs font-medium text-white"
            >
              Nuevo caso
            </Link>
            <Link
              href="/profile"
              className="rounded-full border border-border/70 px-4 py-2 text-xs font-medium text-white"
            >
              Perfil
            </Link>
            <Link
              href="/security"
              className="rounded-full border border-border/70 px-4 py-2 text-xs font-medium text-white"
            >
              Seguridad
            </Link>
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-full border border-accent/35 bg-accent/10 px-4 py-2 text-xs font-medium text-white"
              >
                Admin
              </Link>
            ) : null}
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}
