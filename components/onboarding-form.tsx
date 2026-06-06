"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type OnboardingFormProps = {
  email: string | null;
  userId: string;
};

export function OnboardingForm({ email, userId }: OnboardingFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState({
    country: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (
      !formState.firstName ||
      !formState.lastName ||
      !formState.country ||
      !formState.phone
    ) {
      setError("Completa todos los campos para crear tu perfil.");
      return;
    }

    try {
      setIsSaving(true);
      const supabase = createBrowserSupabaseClient();
      const { error: upsertError } = await supabase.from("profiles").upsert({
        country: formState.country,
        email,
        first_name: formState.firstName,
        id: userId,
        last_name: formState.lastName,
        phone: formState.phone,
      });

      if (upsertError) {
        throw upsertError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No pudimos guardar el perfil.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <motion.form
      className="glass-panel rounded-[1.75rem] p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      onSubmit={handleSubmit}
    >
      <div className="mb-6 space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
          Onboarding seguro
        </p>
        <h1 className="section-title font-semibold text-white">
          Completa tu perfil
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Necesitamos estos datos para asociar tu dossier privado al titular de
          la cuenta.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label-base" htmlFor="first-name">
            Nombre
          </label>
          <input
            id="first-name"
            className="field-base"
            value={formState.firstName}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                firstName: event.target.value,
              }))
            }
          />
        </div>

        <div>
          <label className="label-base" htmlFor="last-name">
            Apellido
          </label>
          <input
            id="last-name"
            className="field-base"
            value={formState.lastName}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                lastName: event.target.value,
              }))
            }
          />
        </div>

        <div>
          <label className="label-base" htmlFor="country">
            País
          </label>
          <input
            id="country"
            className="field-base"
            value={formState.country}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                country: event.target.value,
              }))
            }
          />
        </div>

        <div>
          <label className="label-base" htmlFor="phone">
            Teléfono con código de país
          </label>
          <input
            id="phone"
            className="field-base"
            placeholder="+57 300 000 0000"
            value={formState.phone}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                phone: event.target.value,
              }))
            }
          />
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-white">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 w-full rounded-2xl bg-accent px-4 py-4 text-sm font-semibold text-accent-foreground disabled:opacity-60"
      >
        {isSaving ? "Creando perfil..." : "Crear perfil"}
      </button>
    </motion.form>
  );
}
