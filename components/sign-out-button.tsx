"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    try {
      setIsLoading(true);
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
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
      className="rounded-full border border-border/80 bg-background-elevated/60 px-3 py-2 text-xs font-medium text-muted-foreground disabled:opacity-60"
    >
      {isLoading ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
