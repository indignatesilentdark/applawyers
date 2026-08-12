"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { COUNTRY_OPTIONS, findCountryOption } from "@/lib/countries";

type OnboardingFormProps = {
  email: string;
  initialCountry?: string;
};

export function OnboardingForm({
  email,
  initialCountry,
}: OnboardingFormProps) {
  const router = useRouter();
  const initialCountryOption = findCountryOption(initialCountry);
  const [formState, setFormState] = useState({
    country: initialCountryOption?.name ?? "",
    firstName: "",
    lastName: "",
    phone: initialCountryOption ? `${initialCountryOption.dialCode} ` : "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function handleCountryChange(nextCountry: string) {
    const selectedCountry = findCountryOption(nextCountry);
    const previousCountry = findCountryOption(formState.country);

    setFormState((current) => {
      const trimmedPhone = current.phone.trim();
      const shouldReplaceDialCode =
        !trimmedPhone ||
        (previousCountry
          ? trimmedPhone === previousCountry.dialCode ||
            trimmedPhone.startsWith(`${previousCountry.dialCode} `)
          : true);

      return {
        ...current,
        country: nextCountry,
        phone:
          shouldReplaceDialCode && selectedCountry
            ? `${selectedCountry.dialCode} `
            : current.phone,
      };
    });
  }

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
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "No pudimos guardar el perfil.");
      }

      router.push("/cases/new");
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
        <div className="flex justify-end">
          <Link
            href="/login"
            className="inline-flex items-center rounded-full border border-border/80 bg-background-elevated/65 px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-accent/50 hover:text-white"
          >
            Ya tengo cuenta
          </Link>
        </div>
        <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
          Onboarding seguro
        </p>
        <h1 className="section-title font-semibold text-white">
          Completa tu perfil
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Necesitamos estos datos para asociar tu dossier privado al titular de
          la cuenta <span className="text-white">{email}</span>.
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Si ya habias ingresado antes, puedes volver al acceso principal para
          recibir tu codigo y entrar a tu panel privado.
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
          <select
            id="country"
            className="field-base"
            value={formState.country}
            onChange={(event) => handleCountryChange(event.target.value)}
          >
            <option value="">Selecciona tu pais</option>
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country.name} value={country.name}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-base" htmlFor="phone">
            Teléfono con código de país
          </label>
          <input
            id="phone"
            className="field-base"
            placeholder={`${findCountryOption(formState.country)?.dialCode ?? "+00"} 300 000 0000`}
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
