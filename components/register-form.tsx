"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { COUNTRY_OPTIONS, findCountryOption } from "@/lib/countries";
import type { LeadTransferPayload } from "@/lib/leads";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type RegisterFormProps = {
  lead: LeadTransferPayload;
};

function getOtpErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "No pudimos validar tu solicitud.";
  }

  const message = error.message.toLowerCase();
  if (message.includes("expired")) {
    return "Código vencido";
  }
  if (
    message.includes("invalid") ||
    message.includes("token") ||
    message.includes("otp")
  ) {
    return "Código incorrecto";
  }

  return error.message || "No pudimos validar tu solicitud.";
}

export function RegisterForm({ lead }: RegisterFormProps) {
  const router = useRouter();
  const initialCountry = findCountryOption(lead.country)?.name ?? "";
  const initialPhoneCountry =
    findCountryOption(lead.country)?.dialCode ?? lead.phoneCountry ?? "";
  const [formState, setFormState] = useState({
    country: initialCountry,
    firstName: lead.firstName,
    lastName: lead.lastName,
    phone: lead.phone ?? initialPhoneCountry,
  });
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const selectedCountry = useMemo(
    () => findCountryOption(formState.country),
    [formState.country],
  );

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function handleCountryChange(nextCountry: string) {
    const country = findCountryOption(nextCountry);
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
          shouldReplaceDialCode && country
            ? `${country.dialCode} `
            : current.phone,
      };
    });
  }

  async function handleSendOtp() {
    setError(null);

    try {
      setIsSendingOtp(true);
      const supabase = createBrowserSupabaseClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: lead.email,
        options: {
          emailRedirectTo: undefined,
          shouldCreateUser: true,
        },
      });

      if (otpError) {
        throw otpError;
      }

      setOtpSent(true);
      setCooldown(45);
      setCode("");
    } catch (sendError) {
      setError(getOtpErrorMessage(sendError));
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    setError(null);

    if (code.trim().length !== 6) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }

    if (!formState.firstName || !formState.lastName || !formState.country || !formState.phone) {
      setError("Completa todos los datos requeridos para continuar.");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const supabase = createBrowserSupabaseClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: lead.email,
        token: code.trim(),
        type: "email",
      });

      if (verifyError) {
        throw verifyError;
      }

      const response = await fetch("/api/register/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: formState.country,
          firstName: formState.firstName,
          lastName: formState.lastName,
          leadId: lead.leadId,
          phone: formState.phone,
          phoneCountry: selectedCountry?.dialCode ?? lead.phoneCountry,
          source: lead.source,
          token: lead.token,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "No pudimos completar tu registro.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (verifyError) {
      setError(getOtpErrorMessage(verifyError));
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  return (
    <motion.section
      className="glass-panel rounded-[1.9rem] p-6 sm:p-8"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
          Registro seguro
        </p>
        <h1 className="section-title font-semibold text-white">
          Confirma tus datos y verifica tu acceso
        </h1>
        <p className="text-sm leading-7 text-muted-foreground">
          Ya recibimos tu solicitud inicial desde el funnel. Solo confirma tus
          datos, recibe un código de verificación y entra a tu panel privado.
        </p>
        <div className="rounded-[1.35rem] border border-border/80 bg-background-elevated/55 p-4 text-sm leading-6 text-muted-foreground">
          <p className="font-medium text-white">
            Analisis identificado para {lead.fullName || lead.email}
          </p>
          <p className="mt-1">
            Email vinculado: <span className="text-white">{lead.email}</span>
          </p>
          {lead.source ? <p className="mt-1">Origen: {lead.source}</p> : null}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="label-base" htmlFor="register-first-name">
            Nombre
          </label>
          <input
            id="register-first-name"
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
          <label className="label-base" htmlFor="register-last-name">
            Apellido
          </label>
          <input
            id="register-last-name"
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
          <label className="label-base" htmlFor="register-email">
            Email de verificación
          </label>
          <input
            id="register-email"
            className="field-base opacity-80"
            disabled
            value={lead.email}
          />
        </div>

        <div>
          <label className="label-base" htmlFor="register-country">
            País
          </label>
          <select
            id="register-country"
            className="field-base"
            value={formState.country}
            onChange={(event) => handleCountryChange(event.target.value)}
          >
            <option value="">Selecciona tu país</option>
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country.name} value={country.name}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-base" htmlFor="register-phone">
            Teléfono
          </label>
          <input
            id="register-phone"
            className="field-base"
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

      {otpSent ? (
        <div className="mt-6 space-y-4 rounded-[1.5rem] border border-border/80 bg-background-elevated/60 p-4">
          <div>
            <label className="label-base" htmlFor="register-code">
              Código de verificación
            </label>
            <input
              id="register-code"
              inputMode="numeric"
              maxLength={6}
              className="field-base text-center text-2xl tracking-[0.4em]"
              placeholder="123456"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp}
              className="rounded-2xl bg-accent px-4 py-4 text-sm font-semibold text-accent-foreground disabled:opacity-60"
            >
              {isVerifyingOtp ? "Validando..." : "Validar código"}
            </button>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSendingOtp || cooldown > 0}
              className="rounded-2xl border border-border/80 bg-background-elevated/60 px-4 py-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {cooldown > 0
                ? `Reenviar en ${cooldown}s`
                : isSendingOtp
                  ? "Reenviando..."
                  : "Reenviar código"}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-white">
          {error}
        </p>
      ) : null}

      {!otpSent ? (
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={isSendingOtp}
          className="mt-6 w-full rounded-2xl bg-accent px-4 py-4 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {isSendingOtp
            ? "Enviando código..."
            : "Enviar código de verificación"}
        </button>
      ) : null}
    </motion.section>
  );
}
