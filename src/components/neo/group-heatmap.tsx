import { useMemo, useState } from "react";
import type { GroupStat } from "@/lib/lottery-data";
import { cn } from "@/lib/utils";

interface HeatmapProps {
  stats: GroupStat[];
  onSelect?: (group: number) => void;
  selected?: number | null;
}

export function GroupHeatmap({ stats, onSelect, selected }: HeatmapProps) {
  const [hover, setHover] = useState<number | null>(null);

  const { min, max } = useMemo(() => {
    const freqs = stats.map((s) => s.frequency);
    return { min: Math.min(...freqs), max: Math.max(...freqs) };
  }, [stats]);

  function colorFor(freq: number) {
    if (max === min) return "oklch(0.35 0.05 200)";
    const t = (freq - min) / (max - min); // 0 rare -> 1 frequent
    // interpolate red (rare) -> amber -> green (frequent)
    if (t < 0.5) {
      const k = t * 2;
      const l = 0.45 + k * 0.05;
      const c = 0.22 - k * 0.08;
      const h = 25 + k * 50;
      return `oklch(${l} ${c} ${h})`;
    } else {
      const k = (t - 0.5) * 2;
      const l = 0.5 + k * 0.25;
      const c = 0.14 + k * 0.12;
      const h = 75 + k * 70;
      return `oklch(${l} ${c} ${h})`;
    }
  }

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {stats.map((s) => {
        const isSel = selected === s.group;
        const isHover = hover === s.group;
        return (
          <button
            key={s.group}
            onMouseEnter={() => setHover(s.group)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onSelect?.(s.group)}
            className={cn(
              "relative aspect-square rounded-md p-2 text-left transition-all duration-200",
              "border border-border/50 hover:border-electric hover:scale-[1.04]",
              isSel && "border-electric ring-2 ring-electric/40 scale-[1.04]",
            )}
            style={{
              backgroundColor: colorFor(s.frequency),
              boxShadow: isHover || isSel ? "0 0 18px -4px var(--electric)" : undefined,
            }}
          >
            <div className="absolute inset-0 rounded-md bg-background/35" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="ticker text-xs font-bold tracking-tight">
                  {String(s.group).padStart(2, "0")}
                </span>
                <span className="ticker text-[10px] text-foreground/80">{s.score}</span>
              </div>
              <div>
                <div className="ticker text-sm font-semibold leading-none">{s.frequency}</div>
                <div className="mt-0.5 truncate text-[10px] text-foreground/70">{s.animal}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
