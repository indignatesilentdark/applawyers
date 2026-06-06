import type { ReactNode } from "react";

export function ReportSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="glass-panel rounded-[1.5rem] p-5">
      <h2 className="text-lg font-semibold tracking-[-0.03em] text-white">
        {title}
      </h2>
      <div className="mt-4 text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
