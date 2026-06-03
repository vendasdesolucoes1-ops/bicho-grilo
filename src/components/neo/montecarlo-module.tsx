import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

function simulate(runs: number, draws: number) {
  // Bet on one group each draw; payout 18:1, stake 1, prob 1/25
  const results: number[] = [];
  for (let r = 0; r < runs; r++) {
    let bal = 0;
    for (let d = 0; d < draws; d++) {
      if (Math.random() < 1 / 25) bal += 17;
      else bal -= 1;
    }
    results.push(bal);
  }
  return results;
}

export function MonteCarloModule() {
  const [runs, setRuns] = useState(10000);
  const [draws, setDraws] = useState(200);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    hist: { bucket: number; count: number }[];
    survival: { x: number; p: number }[];
    pProfit: number;
    pLoss: number;
    mean: number;
    p05: number;
    p95: number;
  } | null>(null);

  function run() {
    setBusy(true);
    setTimeout(() => {
      const data = simulate(runs, draws);
      data.sort((a, b) => a - b);
      const min = data[0];
      const max = data[data.length - 1];
      const buckets = 40;
      const step = Math.max(1, (max - min) / buckets);
      const hist: { bucket: number; count: number }[] = [];
      for (let i = 0; i < buckets; i++) {
        const lo = min + i * step;
        const hi = lo + step;
        const count = data.filter((v) => v >= lo && v < hi).length;
        hist.push({ bucket: Math.round(lo), count });
      }
      const survival = data.map((v, i) => ({ x: v, p: 1 - i / data.length }));
      const pProfit = data.filter((v) => v > 0).length / data.length;
      const pLoss = data.filter((v) => v < 0).length / data.length;
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      setResult({
        hist,
        survival: survival.filter((_, i) => i % Math.max(1, Math.floor(data.length / 200)) === 0),
        pProfit,
        pLoss,
        mean,
        p05: data[Math.floor(data.length * 0.05)],
        p95: data[Math.floor(data.length * 0.95)],
      });
      setBusy(false);
    }, 50);
  }

  return (
    <div className="space-y-4 p-4">
      <header>
        <h2 className="text-lg font-semibold">Simulação Monte Carlo</h2>
        <p className="text-sm text-muted-foreground">
          Cada simulação aposta em um único grupo por sorteio. Distribuição esperada de resultados
          em N execuções independentes.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-surface p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Runs</span>
          {[10000, 50000, 100000].map((n) => (
            <button
              key={n}
              onClick={() => setRuns(n)}
              className={cn(
                "rounded px-3 py-1 text-xs font-mono",
                runs === n ? "bg-electric text-electric-foreground" : "bg-accent",
              )}
            >
              {n.toLocaleString()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Sorteios/run
          </span>
          {[50, 200, 500].map((n) => (
            <button
              key={n}
              onClick={() => setDraws(n)}
              className={cn(
                "rounded px-3 py-1 text-xs font-mono",
                draws === n ? "bg-electric text-electric-foreground" : "bg-accent",
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          onClick={run}
          disabled={busy}
          className="ml-auto inline-flex items-center gap-2 rounded bg-neon px-4 py-1.5 text-xs font-semibold text-neon-foreground hover:brightness-110 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
          Simular
        </button>
      </div>

      {result && (
        <>
          <div className="grid gap-3 md:grid-cols-5">
            <Stat label="Chance lucro" value={`${(result.pProfit * 100).toFixed(1)}%`} tone="neon" />
            <Stat label="Chance prejuízo" value={`${(result.pLoss * 100).toFixed(1)}%`} tone="danger" />
            <Stat label="Resultado médio" value={result.mean.toFixed(1)} tone={result.mean >= 0 ? "neon" : "danger"} />
            <Stat label="P05 (pior 5%)" value={result.p05.toFixed(0)} tone="danger" />
            <Stat label="P95 (melhor 5%)" value={result.p95.toFixed(0)} tone="neon" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Distribuição de resultados">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.hist}>
                  <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" />
                  <XAxis dataKey="bucket" stroke="var(--muted-foreground)" fontSize={10} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                  />
                  <defs>
                    <linearGradient id="distGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--electric)" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="var(--electric)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="count" stroke="var(--electric)" fill="url(#distGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Curva de sobrevivência">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.survival}>
                  <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" />
                  <XAxis dataKey="x" stroke="var(--muted-foreground)" fontSize={10} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="p" stroke="var(--neon)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "neon" | "danger" }) {
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
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="h-72 rounded-md border border-border bg-surface p-3">
      <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="h-[88%]">{children}</div>
    </div>
  );
}
