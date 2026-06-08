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
      className="inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(120,20,40,0.18)] hover:border-rose-300/35 hover:bg-rose-400/14 disabled:opacity-60"
    >
      <span className="inline-flex size-2 rounded-full bg-rose-300" />
      {isLoading ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
