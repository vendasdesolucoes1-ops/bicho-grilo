import type { Draw, GroupStat } from "@/lib/lottery-data";
import { chiSquare, dispersionIndex, entropy, randomnessScore, runsTest } from "@/lib/lottery-data";
import { cn } from "@/lib/utils";

interface AuditProps {
  draws: Draw[];
  stats: GroupStat[];
}

export function AuditModule({ draws, stats }: AuditProps) {
  const chi = chiSquare(stats);
  const h = entropy(stats);
  const maxH = Math.log2(25);
  const runs = runsTest(draws);
  const disp = dispersionIndex(stats);
  const audit = randomnessScore(draws, stats);

  const cls =
    audit.classification === "Normal"
      ? "text-neon border-neon/40 bg-neon/5"
      : audit.classification === "Atenção"
        ? "text-warning border-warning/40 bg-warning/5"
        : "text-danger border-danger/40 bg-danger/5";

  return (
    <div className="space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Auditoria de Aleatoriedade</h2>
          <p className="text-sm text-muted-foreground">
            Bateria de testes estatísticos sobre {draws.length.toLocaleString()} sorteios.
          </p>
        </div>
        <div className={cn("rounded-md border px-4 py-3 text-right", cls)}>
          <div className="text-[10px] uppercase tracking-wider opacity-80">Randomness Score</div>
          <div className="ticker text-3xl font-bold">{audit.score}</div>
          <div className="text-xs font-semibold uppercase">{audit.classification}</div>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <TestCard
          name="Chi-Square"
          value={chi.value.toFixed(2)}
          target={`gl=${chi.df}, esperado ≈ 24`}
          ok={Math.abs(chi.value - 24) < 12}
          p={chi.pApprox.toFixed(3)}
        />
        <TestCard
          name="Entropia (Shannon)"
          value={h.toFixed(3)}
          target={`máx ${maxH.toFixed(3)} bits`}
          ok={h / maxH > 0.98}
        />
        <TestCard
          name="Runs Test"
          value={`Z=${runs.z.toFixed(2)}`}
          target={`obs=${runs.runs}, esp=${runs.expected.toFixed(0)}`}
          ok={Math.abs(runs.z) < 1.96}
        />
        <TestCard
          name="Índice de Dispersão"
          value={disp.toFixed(3)}
          target="≈ 1.0 para Poisson"
          ok={Math.abs(disp - 1) < 0.5}
        />
        <TestCard
          name="Uniformidade"
          value={`${((1 - Math.abs(chi.value - 24) / 100) * 100).toFixed(1)}%`}
          target="Desvio sobre uniforme"
          ok={Math.abs(chi.value - 24) < 18}
        />
        <TestCard
          name="Frequência"
          value={`${stats.length} grupos`}
          target={`min=${Math.min(...stats.map((s) => s.frequency))} max=${Math.max(...stats.map((s) => s.frequency))}`}
          ok
        />
      </div>

      <div className="rounded-md border border-border bg-surface p-4 text-sm leading-relaxed">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-electric">
          Interpretação
        </div>
        <p className="text-muted-foreground">
          Os testes acima medem o quão próxima a sequência observada está de um processo
          puramente aleatório uniforme. <span className="text-foreground">Não</span> existe método
          estatístico capaz de prever o próximo resultado de um sorteio independente — esta
          auditoria serve para detectar anomalias na fonte de dados, não para gerar palpites.
        </p>
      </div>
    </div>
  );
}

function TestCard({
  name,
  value,
  target,
  ok,
  p,
}: {
  name: string;
  value: string;
  target: string;
  ok: boolean;
  p?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {name}
        </div>
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            ok ? "bg-neon shadow-[0_0_8px_var(--neon)]" : "bg-danger shadow-[0_0_8px_var(--danger)]",
          )}
        />
      </div>
      <div className="ticker mt-2 text-2xl font-semibold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{target}</div>
      {p && <div className="mt-1 text-[10px] text-muted-foreground">p ≈ {p}</div>}
    </div>
  );
}
