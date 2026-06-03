import { useMemo, useState } from "react";
import type { GroupStat } from "@/lib/lottery-data";
import { cn } from "@/lib/utils";
import { AnimalWatermark } from "./animal-watermarks";

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
        
        // Dados simulados para métricas avançadas que a IA sugeriu
        const zScore = ((s.frequency - (min + max) / 2) / ((max - min) / 2 || 1)).toFixed(2);
        const percentil = Math.round(((s.frequency - min) / (max - min || 1)) * 100);
        const atraso = Math.abs(Math.round(Math.random() * 20)); // Mock temporário para tooltip
        
        return (
          <div key={s.group} className="relative z-0" onMouseEnter={() => setHover(s.group)} onMouseLeave={() => setHover(null)}>
            <button
              onClick={() => onSelect?.(s.group)}
              className={cn(
                "w-full h-full relative aspect-square rounded-md p-2 text-left transition-all duration-200 overflow-hidden",
                "border border-border/50 hover:border-electric",
                isSel && "border-electric ring-2 ring-electric/40",
              )}
              style={{
                backgroundColor: colorFor(s.frequency),
                boxShadow: isHover || isSel ? "0 0 18px -4px var(--electric)" : undefined,
                transform: isHover || isSel ? "scale(1.04)" : "scale(1)",
                zIndex: isHover ? 10 : 1,
              }}
            >
              <div className="absolute inset-0 bg-background/35" />
              
              {/* Marca d'água vetorial monocromática */}
              <AnimalWatermark 
                group={s.group} 
                className="absolute -right-2 -bottom-2 h-16 w-16 opacity-[0.08] text-white transition-opacity duration-300 group-hover:opacity-[0.12]" 
              />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="ticker text-xs font-bold tracking-tight">
                    {String(s.group).padStart(2, "0")}
                  </span>
                  <span className="ticker text-[10px] text-foreground/80">{s.score}</span>
                </div>
                <div>
                  <div className="ticker text-sm font-semibold leading-none">{s.frequency}</div>
                  <div className="mt-0.5 truncate text-[10px] text-foreground/70 hidden sm:block">{s.animal}</div>
                </div>
              </div>
            </button>

            {/* Advanced Tooltip - Blueprint Style */}
            {isHover && (
              <div 
                className={cn(
                  "absolute z-50 w-48 rounded-lg border border-electric/40 bg-background/95 p-3 text-xs shadow-2xl backdrop-blur-md",
                  "left-1/2 -translate-x-1/2 mt-2 pointer-events-none",
                  "animate-in fade-in zoom-in-95 duration-200"
                )}
                style={{
                  top: "100%",
                }}
              >
                <div className="mb-2 flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-bold text-electric">G{String(s.group).padStart(2, "0")}</span>
                  <span className="font-medium text-foreground">{s.animal}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground">Freq</span>
                    <span className="font-mono">{s.frequency}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground">Atraso</span>
                    <span className="font-mono">{atraso}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground">Z-Score</span>
                    <span className="font-mono">{zScore}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground">Percentil</span>
                    <span className="font-mono">{percentil}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
