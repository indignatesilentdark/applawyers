"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthFormProps = {
  disabled?: boolean;
  initialError?: string;
  initialMessage?: string;
};

export function AuthForm({
  disabled,
  initialError,
  initialMessage,
}: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem("approvedlawyer:last-email") ?? "";
  });
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"otp" | "password">("otp");
  const [step, setStep] = useState<"code" | "email">("email");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function handleRequestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(undefined);

    if (!email) {
      setError("Ingresa un correo válido.");
      return;
    }

    if (disabled) {
      setError("El envío de códigos aún no está configurado en este entorno.");
      return;
    }

    try {
      setIsRequesting(true);
      window.localStorage.setItem("approvedlawyer:last-email", email);

      const response = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "No pudimos enviar el código seguro.");
      }

      setStep("code");
      setCode("");
      setMessage(payload.message ?? "Te enviamos un código seguro de 6 dígitos.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos enviar el código seguro.",
      );
    } finally {
      setIsRequesting(false);
    }
  }

  async function handleVerifyCode() {
    setError(null);
    setMessage(undefined);

    if (code.trim().length < 6) {
      setError("Ingresa el código de 6 dígitos que recibiste por correo.");
      return;
    }

    try {
      setIsVerifying(true);
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const payload = (await response.json()) as {
        error?: string;
        nextPath?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "No pudimos validar el código.");
      }

      router.push(payload.nextPath ?? "/dashboard");
      router.refresh();
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "No pudimos validar el código.",
      );
    } finally {
      setIsVerifying(false);
    }
  }

  async function handlePasswordSignIn() {
    setError(null);
    setMessage(undefined);

    if (!email || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    try {
      setIsVerifying(true);
      const response = await fetch("/api/auth/sign-in-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as {
        error?: string;
        nextPath?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "No pudimos iniciar sesión.");
      }

      router.push(payload.nextPath ?? "/dashboard");
      router.refresh();
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "No pudimos iniciar sesión.",
      );
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <motion.form
      className="space-y-4"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onSubmit={handleRequestCode}
    >
      <div className="grid grid-cols-2 gap-2 rounded-[1.2rem] border border-border/80 bg-background-elevated/45 p-1">
        <button
          type="button"
          className={
            mode === "otp"
              ? "rounded-[0.95rem] bg-accent px-3 py-3 text-sm font-semibold text-accent-foreground"
              : "rounded-[0.95rem] px-3 py-3 text-sm font-medium text-muted-foreground"
          }
          onClick={() => {
            setMode("otp");
            setStep("email");
            setPassword("");
            setCode("");
            setError(null);
            setMessage(undefined);
          }}
        >
          Código seguro
        </button>
        <button
          type="button"
          className={
            mode === "password"
              ? "rounded-[0.95rem] bg-accent px-3 py-3 text-sm font-semibold text-accent-foreground"
              : "rounded-[0.95rem] px-3 py-3 text-sm font-medium text-muted-foreground"
          }
          onClick={() => {
            setMode("password");
            setStep("email");
            setCode("");
            setError(null);
            setMessage(undefined);
          }}
        >
          Contraseña
        </button>
      </div>

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

      {mode === "otp" && step === "code" ? (
        <div className="space-y-2">
          <label className="label-base" htmlFor="code">
            Código de acceso
          </label>
          <input
            id="code"
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
      ) : null}

      {mode === "password" ? (
        <div className="space-y-2">
          <label className="label-base" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="field-base"
            placeholder="Tu contraseña privada"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
      ) : null}

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

      {mode === "otp" && step === "email" ? (
        <button
          type="submit"
          disabled={isRequesting || disabled}
          className="flex w-full items-center justify-center rounded-2xl bg-accent px-4 py-4 text-sm font-semibold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isRequesting ? "Enviando código..." : "Enviar código seguro"}
        </button>
      ) : null}

      {mode === "password" ? (
        <button
          type="button"
          onClick={handlePasswordSignIn}
          disabled={isVerifying || disabled}
          className="flex w-full items-center justify-center rounded-2xl bg-accent px-4 py-4 text-sm font-semibold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isVerifying ? "Ingresando..." : "Entrar con contraseña"}
        </button>
      ) : (
        mode === "otp" ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={isVerifying || disabled}
            className="flex w-full items-center justify-center rounded-2xl bg-accent px-4 py-4 text-sm font-semibold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isVerifying ? "Verificando..." : "Verificar código"}
          </button>

          <button
            type="button"
            className="w-full text-sm text-muted-foreground"
            onClick={() => {
              setStep("email");
              setCode("");
              setMessage(undefined);
              setError(null);
            }}
          >
            Cambiar correo o solicitar un nuevo código
          </button>
        </div>
        ) : null
      )}

      <div className="pt-2 text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-white underline decoration-accent/60 underline-offset-4">
          Regístrate aquí
        </Link>
      </div>
    </motion.form>
  );
}
