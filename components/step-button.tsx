import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type StepButtonProps = {
  children: ReactNode;
  variant?: "ghost" | "primary";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function StepButton({
  children,
  className,
  disabled,
  variant = "primary",
  ...props
}: StepButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary"
          ? "bg-accent text-accent-foreground"
          : "border border-border/80 bg-background-elevated/60 text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}
