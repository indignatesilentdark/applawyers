"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { COUNTRY_OPTIONS, type CountryOption, findCountryOption } from "@/lib/countries";

type RegisterAccountFormProps = {
  initialCountry?: string;
};

function buildPhoneValue(rawValue: string, countryOption?: CountryOption | null) {
  const digitsOnly = rawValue.replace(/\D/g, "");
  const dialDigits = (countryOption?.dialCode ?? "").replace(/\D/g, "");
  const hasDialPrefix = Boolean(dialDigits) && digitsOnly.startsWith(dialDigits);
  const localDigits = hasDialPrefix
    ? digitsOnly.slice(dialDigits.length)
    : digitsOnly;
  const maxLocalDigits = countryOption?.phoneDigits ?? Math.max(4, 15 - dialDigits.length);
  const trimmedLocalDigits = localDigits.slice(0, maxLocalDigits);

  if (countryOption?.dialCode) {
    return `${countryOption.dialCode} ${trimmedLocalDigits}`.trim();
  }

  return trimmedLocalDigits ? `+${trimmedLocalDigits.slice(0, 15)}` : "";
}

export function RegisterAccountForm({ initialCountry }: RegisterAccountFormProps) {
  const router = useRouter();
  const initialCountryOption = findCountryOption(initialCountry);
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    country: initialCountryOption?.name ?? "",
    phone: initialCountryOption ? `${initialCountryOption.dialCode} ` : "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCountry = useMemo(
    () => findCountryOption(formState.country),
    [formState.country],
  );

  function handleCountryChange(nextCountry: string) {
    const option = findCountryOption(nextCountry);
    const previousDialCode = selectedCountry?.dialCode ?? "";

    setFormState((current) => {
      const trimmedPhone = current.phone.trim();
      const shouldReplaceDialCode =
        !trimmedPhone ||
        trimmedPhone === previousDialCode ||
        trimmedPhone.startsWith(`${previousDialCode} `);

      return {
        ...current,
        country: nextCountry,
        phone:
          shouldReplaceDialCode && option
            ? `${option.dialCode} `
            : buildPhoneValue(current.phone, option),
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          phoneCountry: selectedCountry?.dialCode ?? "",
        }),
      });

      const payload = (await response.json()) as { error?: string; nextPath?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "No pudimos crear tu cuenta.");
      }

      router.push(payload.nextPath ?? "/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "No pudimos crear tu cuenta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.form
      className="glass-panel rounded-[2rem] p-6 sm:p-8"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      onSubmit={handleSubmit}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
            Registro privado
          </p>
          <Link
            href="/login"
            className="inline-flex items-center rounded-full border border-border/80 bg-background-elevated/60 px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-accent/50 hover:text-white"
          >
            Ya tengo cuenta
          </Link>
        </div>
        <h1 className="section-title font-semibold text-white">
          Crea tu acceso privado
        </h1>
        <p className="text-sm leading-7 text-muted-foreground">
          Registra tu correo, define tu contraseña y deja que el sistema complete
          automáticamente tu país y prefijo telefónico para acelerar el ingreso.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="label-base" htmlFor="register-email">
            Correo electrónico
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            className="field-base"
            placeholder="nombre@correo.com"
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({ ...current, email: event.target.value }))
            }
          />
        </div>

        <div>
          <label className="label-base" htmlFor="register-password">
            Contraseña
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            className="field-base"
            placeholder="Minimo 8 caracteres"
            value={formState.password}
            onChange={(event) =>
              setFormState((current) => ({ ...current, password: event.target.value }))
            }
          />
        </div>

        <div>
          <label className="label-base" htmlFor="register-confirm-password">
            Confirmar contraseña
          </label>
          <input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            className="field-base"
            placeholder="Repite tu contraseña"
            value={formState.confirmPassword}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }))
            }
          />
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <label className="label-base !mb-0" htmlFor="register-country">
              País
            </label>
            {selectedCountry ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                <span>{selectedCountry.flag}</span>
                <span>
                  {selectedCountry.name}
                  {initialCountryOption?.name === selectedCountry.name
                    ? " detectado por IP"
                    : ""}
                </span>
              </div>
            ) : null}
          </div>
          <select
            id="register-country"
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
          <label className="label-base" htmlFor="register-phone">
            Teléfono con código de país
          </label>
          <input
            id="register-phone"
            type="tel"
            inputMode="numeric"
            className="field-base"
            placeholder={`${selectedCountry?.dialCode ?? "+00"} 300 000 0000`}
            value={formState.phone}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                phone: buildPhoneValue(
                  event.target.value,
                  selectedCountry,
                ),
              }))
            }
            maxLength={selectedCountry ? selectedCountry.dialCode.length + selectedCountry.phoneDigits + 1 : 16}
          />
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            Solo se permiten numeros. El prefijo del pais se mantiene automaticamente.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-white">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 flex w-full items-center justify-center rounded-2xl bg-accent px-4 py-4 text-sm font-semibold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta privada"}
      </button>
    </motion.form>
  );
}
