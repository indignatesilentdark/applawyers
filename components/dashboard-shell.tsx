import Link from "next/link";
import type { ReactNode } from "react";
import type { ProfileRow } from "@/lib/types";
import { SignOutButton } from "@/components/sign-out-button";

type DashboardShellProps = {
  children: ReactNode;
  eyebrow?: string;
  profile?: Pick<ProfileRow, "email" | "first_name" | "last_name"> | null;
  title: string;
};

export function DashboardShell({
  children,
  eyebrow,
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
            <div>
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

          <nav className="mt-5 flex gap-2">
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
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}
