import { redirect } from "next/navigation";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireAuthenticatedUser() {
  if (!hasPublicSupabaseEnv) {
    redirect(
      "/?message=Configura%20Supabase%20para%20habilitar%20las%20rutas%20privadas.",
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?message=Inicia%20sesion%20con%20tu%20enlace%20seguro.");
  }

  return { supabase, user };
}
