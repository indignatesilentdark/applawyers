"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  Home,
  LockKeyhole,
  Menu,
  ShieldCheck,
  ShieldUser,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

type DossierPrivateHeaderProps = {
  isAdmin?: boolean;
  userEmail?: string | null;
  userName?: string | null;
};

type NavItem = {
  href: string;
  icon: typeof Home;
  label: string;
};

export function DossierPrivateHeader({
  isAdmin,
  userEmail,
  userName,
}: DossierPrivateHeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigationItems = useMemo<NavItem[]>(
    () => [
      { href: "/dashboard", icon: Home, label: "Inicio" },
      { href: "/cases/new", icon: Sparkles, label: "Iniciar análisis" },
      { href: "/profile", icon: UserRound, label: "Perfil" },
      { href: "/security", icon: LockKeyhole, label: "Seguridad" },
      ...(isAdmin
        ? [{ href: "/admin", icon: ShieldUser, label: "Admin" }]
        : []),
    ],
    [isAdmin],
  );

  const avatarLabel = (userName || userEmail || "A").slice(0, 1).toUpperCase();

  return (
    <>
      <header className="glass-panel relative overflow-visible rounded-[1.8rem] px-4 py-4 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background-elevated/40 text-white xl:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </button>

            <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-accent/20 bg-accent/10">
              <Image
                alt="Approve Lawyers"
                className="object-contain"
                fill
                sizes="48px"
                src="/logo-applawyers-original.png"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[0.72rem] uppercase tracking-[0.28em] text-muted-foreground">
                Approve Lawyers
              </p>
              <div className="mt-1 flex items-center gap-2 text-white">
                <ShieldCheck className="size-4 text-accent" />
                <p className="truncate text-lg font-semibold tracking-[-0.03em]">
                  Dossier Privado
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((current) => !current)}
              className="surface-muted inline-flex items-center gap-3 rounded-full px-3 py-2.5 text-left"
              aria-expanded={isUserMenuOpen}
              aria-label="Abrir menú de usuario"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                {avatarLabel}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-semibold text-white">
                  {userName || "Usuario privado"}
                </p>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>

            {isUserMenuOpen ? (
              <div className="surface-contrast absolute right-0 top-[calc(100%+0.85rem)] z-30 w-72 rounded-[1.35rem] p-3 shadow-[0_30px_70px_rgba(1,7,16,0.55)]">
                <div className="rounded-[1.1rem] border border-border/70 bg-background/35 p-3">
                  <p className="text-sm font-semibold text-white">
                    {userName || "Usuario privado"}
                  </p>
                  <p className="mt-1 break-words text-sm leading-6 text-sky-100/78">
                    {userEmail || "Sesión protegida"}
                  </p>
                </div>

                <div className="mt-3 space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsUserMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-[1rem] px-3 py-3 text-sm text-white/85",
                          active
                            ? "surface-accent"
                            : "border border-transparent hover:border-border/70 hover:bg-background/30",
                        )}
                        >
                        <span>{item.label}</span>
                        <Icon className="size-4 text-muted-foreground" />
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <SignOutButton forceLabel />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#020812]/84 backdrop-blur-sm"
            aria-label="Cerrar menú"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="surface-contrast absolute inset-y-0 left-0 flex w-[88vw] max-w-sm flex-col overflow-y-auto px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
                  Menú privado
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  Dossier Privado
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-[1.15rem] px-4 py-4 text-lg tracking-[0.08em]",
                      active
                        ? "surface-accent text-white"
                        : "border border-transparent text-sky-100/78 hover:border-border/70 hover:bg-background/30",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span>{item.label}</span>
                    </div>
                    <Icon className="size-5 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto pt-6">
              <div className="surface-muted rounded-[1.35rem] p-4">
                <p className="text-sm font-semibold text-white">
                  {userName || "Usuario privado"}
                </p>
                <p className="mt-1 break-words text-sm leading-6 text-sky-100/78">
                  {userEmail || "Sesión protegida"}
                </p>
              </div>

              <div className="mt-4">
                <SignOutButton forceLabel />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
