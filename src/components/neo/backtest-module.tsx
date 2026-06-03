import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Play, Loader2 } from "lucide-react";
import type { Draw, GroupStat } from "@/lib/lottery-data";
import { cn } from "@/lib/utils";

type Strategy = "frequency" | "delay" | "mixed" | "random";

interface BacktestProps {
  draws: Draw[];
  stats: GroupStat[];
}

function runBacktest(draws: Draw[], stats: GroupStat[], strat: Strategy, n: number) {
  const window = draws.slice(-n);
  let hits = 0;
  let pnl = 0;
  let peak = 0;
  let maxDD = 0;
  const equity: { i: number; pnl: number }[] = [];
  const sortedByFreq = [...stats].sort((a, b) => b.frequency - a.frequency);
  const sortedByDelay = [...stats].sort((a, b) => b.delay - a.delay);

  for (let i = 0; i < window.length; i++) {
    let pick: number;
    if (strat === "frequency") pick = sortedByFreq[i % 5].group;
    else if (strat === "delay") pick = sortedByDelay[i % 5].group;
    else if (strat === "mixed") {
      pick =
        i % 2 === 0
          ? sortedByFreq[Math.floor(i / 10) % 5].group
          : sortedByDelay[Math.floor(i / 10) % 5].group;
    } else pick = Math.floor(Math.random() * 25) + 1;

    const win = window[i].group === pick;
    // Jogo do bicho group payout ~18x for stake 1; expected return -28%
    if (win) {
      hits++;
      pnl += 17; // net win
    } else pnl -= 1;
    peak = Math.max(peak, pnl);
    maxDD = Math.min(maxDD, pnl - peak);
    if (i % Math.max(1, Math.floor(window.length / 80)) === 0) equity.push({ i, pnl });
  }
  equity.push({ i: window.length, pnl });
  return {
    hits,
    n: window.length,
    rate: window.length > 0 ? hits / window.length : 0,
    pnl,
    maxDD,
    equity,
  };
}

export function BacktestModule({ draws, stats }: BacktestProps) {
  const [strat, setStrat] = useState<Strategy>("frequency");
  const [size, setSize] = useState(500);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof runBacktest> | null>(null);
  const [baseline, setBaseline] = useState<ReturnType<typeof runBacktest> | null>(null);

  function run() {
    setRunning(true);
    setTimeout(() => {
      setResult(runBacktest(draws, stats, strat, size));
      setBaseline(runBacktest(draws, stats, "random", size));
      setRunning(false);
    }, 400);
  }

  const strategies: { id: Strategy; label: string; desc: string }[] = [
    { id: "frequency", label: "Frequência", desc: "Top 5 mais frequentes" },
    { id: "delay", label: "Atraso", desc: "Top 5 mais atrasados" },
    { id: "mixed", label: "Mista", desc: "Alterna frequência e atraso" },
    { id: "random", label: "Aleatória", desc: "Escolha uniforme" },
  ];

  return (
    <div className="space-y-4 p-4">
      <header>
        <h2 className="text-lg font-semibold">Backtest de Estratégias</h2>
        <p className="text-sm text-muted-foreground">
          Aplica estratégias hipotéticas sobre o histórico. Todos os payouts assumem cotação
          tradicional 18:1 do grupo cheio — valor educacional, não recomendação.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        {strategies.map((s) => (
          <button
            key={s.id}
            onClick={() => setStrat(s.id)}
            className={cn(
              "rounded-md border p-3 text-left transition-all",
              strat === s.id
                ? "border-electric bg-electric/10 shadow-[0_0_18px_-6px_var(--electric)]"
                : "border-border bg-surface hover:border-electric/50",
            )}
          >
            <div className="text-sm font-semibold">{s.label}</div>
            <div className="text-[11px] text-muted-foreground">{s.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface p-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Amostra</div>
        {[100, 500, 1000, 5000].map((n) => (
          <button
            key={n}
            onClick={() => setSize(n)}
            className={cn(
              "rounded px-3 py-1 text-xs font-mono transition-colors",
              size === n
                ? "bg-electric text-electric-foreground"
                : "bg-accent text-foreground hover:bg-accent/80",
            )}
          >
            {n.toLocaleString()}
          </button>
        ))}
        <button
          onClick={run}
          disabled={running}
          className="ml-auto inline-flex items-center gap-2 rounded bg-neon px-4 py-1.5 text-xs font-semibold text-neon-foreground transition-all hover:brightness-110 disabled:opacity-50"
        >
          {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
          Executar
        </button>
      </div>

      {result && baseline && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Metric label="Taxa de acerto" value={`${(result.rate * 100).toFixed(2)}%`} hint={`${result.hits}/${result.n}`} />
            <Metric
              label="P&L teórico"
              value={result.pnl.toLocaleString()}
              tone={result.pnl >= 0 ? "neon" : "danger"}
            />
            <Metric label="Drawdown máx" value={result.maxDD.toLocaleString()} tone="danger" />
            <Metric
              label="vs aleatória"
              value={`${(result.pnl - baseline.pnl >= 0 ? "+" : "") + (result.pnl - baseline.pnl).toLocaleString()}`}
              tone={result.pnl - baseline.pnl >= 0 ? "neon" : "danger"}
            />
          </div>

          <div className="h-72 rounded-md border border-border bg-surface p-3">
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              Curva de equity
            </div>
            <ResponsiveContainer width="100%" height="92%">
              <LineChart data={result.equity}>
                <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" />
                <XAxis dataKey="i" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="pnl" stroke="var(--electric)" strokeWidth={2} dot={false} />
                <Line
                  type="monotone"
                  data={baseline.equity}
                  dataKey="pnl"
                  stroke="var(--muted-foreground)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-xs text-warning">
            ⚠ A expectância matemática de qualquer estratégia em sorteio uniforme é negativa.
            Resultados positivos isolados são ruído estatístico, não vantagem real.
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "neon" | "danger";
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "ticker mt-1 text-xl font-semibold",
          tone === "neon" && "text-neon",
          tone === "danger" && "text-danger",
        )}
      >
        {value}
      </div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
