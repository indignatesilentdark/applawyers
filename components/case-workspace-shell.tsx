import Image from "next/image";
import Link from "next/link";
import { Bell, CalendarDays, ClipboardList, Files, FolderOpen, Home, Menu, MessageCircleMore, PlusCircle, Search, Settings, Users } from "lucide-react";
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
  { href: "/dashboard", icon: FolderOpen, label: "Casos" },
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
  const visibleNavigationItems = navigationItems.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#091322_0%,#06101d_100%)] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1640px] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-border/70 bg-[linear-gradient(180deg,rgba(7,17,31,0.98),rgba(4,11,20,0.98))] lg:flex lg:flex-col">
          <div className="border-b border-border/70 px-6 py-7">
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
          </div>

          <nav className="flex-1 space-y-1 px-4 py-6">
            {visibleNavigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-sky-100/74",
                    item.label === activeItem
                      ? "surface-accent text-white"
                      : "hover:bg-white/5 hover:text-white",
                  )}
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

          <div className="space-y-4 p-4">
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

            <div className="surface-contrast rounded-[1.4rem] p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-500/18 text-base font-semibold text-violet-100">
                  {avatarLabel}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{userName}</p>
                  <p className="truncate text-xs text-sky-100/68">Cuenta activa</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-screen flex-col">
          <header className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(10,20,34,0.92),rgba(8,16,28,0.92))] px-5 py-5 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-white lg:hidden"
                  aria-label="Abrir navegación"
                >
                  <Menu className="size-5" />
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

          <div className="flex-1 px-4 py-5 lg:px-7 lg:py-7">{children}</div>
        </section>
      </div>
    </main>
  );
}
