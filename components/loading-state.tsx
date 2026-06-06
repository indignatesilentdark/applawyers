"use client";

import { motion } from "framer-motion";

export function LoadingState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <motion.div
      className="glass-panel rounded-[1.75rem] p-6 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border border-border/80 bg-background-elevated/70">
        <div className="size-6 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
      </div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}
