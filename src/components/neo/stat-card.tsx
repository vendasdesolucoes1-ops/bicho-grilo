import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "neon" | "electric" | "warning" | "danger";
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  neon: "text-neon text-glow-neon",
  electric: "text-electric text-glow-electric",
  warning: "text-warning",
  danger: "text-danger",
};

export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  return (
    <div className="rounded-md border border-border bg-surface/60 p-3 backdrop-blur transition-colors hover:border-electric/50">
      <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1.5 ticker text-2xl font-semibold leading-none", toneClasses[tone])}>
        {value}
      </div>
      {hint && <div className="mt-1.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
