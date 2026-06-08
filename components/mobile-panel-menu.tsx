"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SignOutButton } from "@/components/sign-out-button";

type MobilePanelMenuProps = {
  isAdmin?: boolean;
  title: string;
  userEmail?: string | null;
  userName?: string;
};

type NavItem = {
  href: string;
  label: string;
};

export function MobilePanelMenu({
  isAdmin,
  title,
  userEmail,
  userName,
}: MobilePanelMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const items: NavItem[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/cases/new", label: "Nuevo caso" },
    { href: "/profile", label: "Perfil" },
    { href: "/security", label: "Seguridad" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3 xl:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menú"
          className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background-elevated/50 text-white"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4.5 7.5h15" strokeLinecap="round" />
            <path d="M4.5 12h15" strokeLinecap="round" />
            <path d="M4.5 16.5h15" strokeLinecap="round" />
          </svg>
        </button>

        <div className="min-w-0 flex-1 px-1">
          <p className="truncate text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
            Panel privado
          </p>
          <p className="truncate text-base font-semibold text-white">{title}</p>
        </div>

        <SignOutButton iconOnly />
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-[#020812]/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="surface-contrast absolute inset-y-0 left-0 flex w-[86vw] max-w-sm flex-col overflow-hidden border-r border-border/80">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-5">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
                  Navegación
                </p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                  Approve Lawyers
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar menú"
                className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background-elevated/50 text-white"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M6 6l12 12" strokeLinecap="round" />
                  <path d="M18 6 6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-6">
              <div className="space-y-2">
                {items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between rounded-[1.15rem] px-4 py-4 text-lg tracking-[0.08em] ${
                        active
                          ? "surface-accent text-white"
                          : "border border-transparent text-sky-100/78"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        ir
                      </span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="border-t border-border/70 px-5 py-5">
              <div className="surface-muted rounded-[1.35rem] p-4">
                <p className="text-sm font-semibold text-white">
                  {userName || "Cuenta privada"}
                </p>
                <p className="mt-1 break-words text-sm leading-6 text-sky-100/78">
                  {userEmail || "Sesión protegida"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
