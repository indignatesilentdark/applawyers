"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type AuthFormProps = {
  disabled?: boolean;
  initialMessage?: string;
};

export function AuthForm({ disabled, initialMessage }: AuthFormProps) {
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem("approvedlawyer:last-email") ?? "";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(undefined);

    if (!email) {
      setError("Ingresa un correo válido.");
      return;
    }

    if (disabled) {
      setError("Supabase no está configurado todavía en este entorno.");
      return;
    }

    try {
      setIsSubmitting(true);
      window.localStorage.setItem("approvedlawyer:last-email", email);

      const supabase = createBrowserSupabaseClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });

      if (signInError) {
        throw signInError;
      }

      setMessage(
        "Revisa tu correo. Te enviamos un enlace seguro de acceso para continuar.",
      );
      setEmail("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos enviar el enlace seguro.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.form
      className="space-y-4"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <label className="label-base" htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="field-base"
          placeholder="nombre@correo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      {message ? (
        <p className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm leading-6 text-white">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-6 text-white">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || disabled}
        className="flex w-full items-center justify-center rounded-2xl bg-accent px-4 py-4 text-sm font-semibold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isSubmitting ? "Enviando enlace..." : "Enviar Magic Link"}
      </button>
    </motion.form>
  );
}
