"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    try {
      setIsLoading(true);
      await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      router.push("/");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      aria-label={isLoading ? "Saliendo" : "Cerrar sesión"}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-400/25 bg-rose-400/10 p-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(120,20,40,0.18)] hover:border-rose-300/35 hover:bg-rose-400/14 disabled:opacity-60 md:px-4 md:py-2.5"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      >
        <path d="M9 5.75H6.75A1.75 1.75 0 0 0 5 7.5v9A1.75 1.75 0 0 0 6.75 18.25H9" strokeLinecap="round" />
        <path d="M13 8.25 17 12l-4 3.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 12H9" strokeLinecap="round" />
      </svg>
      <span className="hidden md:inline">{isLoading ? "Saliendo..." : "Cerrar sesión"}</span>
    </button>
  );
}
