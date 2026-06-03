import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Database,
  FlaskConical,
  LineChart as LineChartIcon,
  LogOut,
  Save,
  Sparkles,
  TerminalSquare,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ANIMALS,
  computeGroupStats,
  dispersionIndex,
  randomnessScore,
  type Draw,
} from "@/lib/lottery-data";
import { useDraws } from "@/hooks/use-draws";
import { GroupHeatmap } from "@/components/neo/group-heatmap";
import { StatCard } from "@/components/neo/stat-card";
import { NeoChat } from "@/components/neo/neo-chat";
import { BacktestModule } from "@/components/neo/backtest-module";
import { MonteCarloModule } from "@/components/neo/montecarlo-module";
import { AuditModule } from "@/components/neo/audit-module";
import { ExplorerModule } from "@/components/neo/explorer-module";
import { InsightsModule } from "@/components/neo/insights-module";
import { requireAuth } from "@/lib/auth-guard";
import { useAuth } from "@/contexts/auth-context";
import { useSaveAnalysis } from "@/hooks/use-analyses";

import { UserMenu } from "@/components/neo/user-menu";
import { SavedAnalysesSidebar } from "@/components/neo/saved-analyses-sidebar";

export const Route = createFileRoute("/terminal")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "NEO Quant Lab — Terminal de Análise Estatística" },
      {
        name: "description",
        content:
          "Plataforma experimental de auditoria estatística de sorteios. Heatmaps, backtests, Monte Carlo e IA analista. Não é uma plataforma de apostas.",
      },
      { property: "og:title", content: "NEO Quant Lab" },
      {
        property: "og:description",
        content: "Terminal quantitativo de auditoria estatística para sorteios históricos.",
      },
    ],
  }),
  component: NeoQuantLab,
});

type TabId = "terminal" | "backtest" | "montecarlo" | "audit" | "insights" | "explorer";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "terminal", label: "Terminal", icon: TerminalSquare },
  { id: "backtest", label: "Backtest", icon: LineChartIcon },
  { id: "montecarlo", label: "Monte Carlo", icon: Activity },
  { id: "audit", label: "Auditoria", icon: FlaskConical },
  { id: "insights", label: "Insights IA", icon: Sparkles },
  { id: "explorer", label: "Explorador", icon: Database },
];

function NeoQuantLab() {
  const [tab, setTab] = useState<TabId>("terminal");
  const [lottery, setLottery] = useState("PT");
  const [state, setState] = useState("RJ");
  const [period, setPeriod] = useState("90d");
  const [extraction, setExtraction] = useState("Todas");
  const [selected, setSelected] = useState<number | null>(null);

  const periodMap: Record<string, number> = { "7d": 50, "30d": 200, "90d": 600, all: 2000 };
  const limit = periodMap[period] ?? 600;
  
  const { data: drawsData, isLoading } = useDraws(limit);
  const draws = useMemo(() => {
    if (!drawsData) return [];
    return drawsData.map((d) => ({
      id: d.id,
      date: d.draw_date,
      group: d.group,
      state: d.state,
      lottery: d.lottery,
      extraction: d.extraction,
    }));
  }, [drawsData]);

  const stats = useMemo(() => computeGroupStats(draws), [draws]);
  const audit = useMemo(() => randomnessScore(draws, stats), [draws, stats]);

  const sortedByFreq = [...stats].sort((a, b) => b.frequency - a.frequency);
  const sortedByDelay = [...stats].sort((a, b) => b.delay - a.delay);
  const mostFrequent = sortedByFreq[0] ?? { group: 17, frequency: 0, animal: "" };
  const mostDelayed = sortedByDelay[0] ?? { group: 23, delay: 0, animal: "" };
  const last = draws[draws.length - 1];
  const dispersion = dispersionIndex(stats);

  const chatContext = useMemo(() => {
    const sortedByFreq = [...stats].sort((a, b) => b.frequency - a.frequency);
    const sortedByDelay = [...stats].sort((a, b) => b.delay - a.delay);
    const top = sortedByFreq.slice(0, 5).map((s) => `G${s.group}=${s.frequency}`).join(", ");
    const delayed = sortedByDelay.slice(0, 5).map((s) => `G${s.group}(${s.delay})`).join(", ");
    return [
      `Loteria=${lottery}, Estado=${state}, Período=${period}, Extração=${extraction}`,
      `Sorteios analisados: ${draws.length}`,
      `Último sorteio: grupo ${last?.group ?? '?'} (${ANIMALS[last?.group ?? 1]})`,
      `Top frequência: ${top}`,
      `Mais atrasados: ${delayed}`,
      `Score de aleatoriedade: ${audit.score}/100 (${audit.classification})`,
      `Chi-square=${audit.chi.value.toFixed(2)} (df=24), Entropia=${audit.entropy.toFixed(3)}/${audit.maxEntropy.toFixed(3)} bits, Runs Z=${audit.runs.z.toFixed(2)}`,
      `Índice de dispersão: ${dispersion.toFixed(3)}`,
    ].join("\n");
  }, [draws.length, stats, audit, lottery, state, period, extraction, dispersion, last?.group]);

  const selectedStat = selected ? stats.find((s) => s.group === selected) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background scanline">
      {/* Header */}
      <header className="z-10 flex items-center justify-between border-b border-border bg-surface/80 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-electric to-neon">
              <span className="ticker text-xs font-bold text-background">N</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold tracking-tight">NEO Quant Lab</span>
                <span className="ticker text-[10px] text-muted-foreground">v1.0.0</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Statistical Audit Terminal
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all",
                    active
                      ? "bg-electric/15 text-electric shadow-[inset_0_0_0_1px_var(--electric)]"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Audit score badge */}
          <div className="flex items-center gap-3 text-[11px] ticker text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3 text-neon" />
              <span className="text-neon">LIVE</span>
            </span>
            <span className="hidden sm:inline">SCORE</span>
            <span
              className={cn(
                "ticker rounded px-2 py-0.5 font-semibold",
                audit.classification === "Normal" && "bg-neon/15 text-neon",
                audit.classification === "Atenção" && "bg-warning/15 text-warning",
                audit.classification === "Anômalo" && "bg-danger/15 text-danger",
              )}
            >
              {audit.score}
            </span>
          </div>

          {/* Save analysis button (visible on terminal tab) */}
          {tab === "terminal" && (
            <SaveAnalysisButton
              draws={draws}
              audit={audit}
              filters={{ lottery, state, period, extraction }}
            />
          )}

          {/* User menu */}
          <UserMenu />
        </div>
      </header>

      {/* Saved Analyses Sidebar */}
      <SavedAnalysesSidebar />

      {/* Mobile tab bar */}
      <nav className="flex items-center gap-1 overflow-x-auto border-b border-border bg-surface/60 px-2 py-1.5 md:hidden">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 rounded px-3 py-1 text-xs font-medium",
                active ? "bg-electric text-electric-foreground" : "text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Main */}
      <main className="flex-1">
        {tab === "terminal" ? (
          <div className="grid grid-cols-1 gap-px bg-border lg:grid-cols-[280px_1fr_360px]">
            {/* LEFT — Filters + Stats */}
            <aside className="space-y-4 bg-background p-4">
              <section>
                <SectionLabel>Filtros</SectionLabel>
                <div className="space-y-2">
                  <FilterSelect label="Loteria" value={lottery} onChange={setLottery} options={["PT", "PTM", "PTV", "PTN", "Federal"]} />
                  <FilterSelect label="Estado" value={state} onChange={setState} options={["RJ", "SP", "MG", "BA", "RS", "PR"]} />
                  <FilterSelect label="Período" value={period} onChange={setPeriod} options={[
                    ["7d", "Últimos 7 dias"],
                    ["30d", "Últimos 30 dias"],
                    ["90d", "Últimos 90 dias"],
                    ["all", "Histórico completo"],
                  ]} />
                  <FilterSelect label="Extração" value={extraction} onChange={setExtraction} options={["Todas", "1º Prêmio", "2º Prêmio", "3º Prêmio", "4º Prêmio", "5º Prêmio"]} />
                </div>
              </section>

              <section>
                <SectionLabel>Métricas</SectionLabel>
                <div className="grid grid-cols-1 gap-2">
                  <StatCard
                    label="Total de sorteios"
                    value={draws.length.toLocaleString()}
                    hint={`base analisada: ${draws.length.toLocaleString()}`}
                  />
                  <StatCard
                    label="Último resultado"
                    value={String(last?.group ?? "-").padStart(2, "0")}
                    hint={`${ANIMALS[last?.group ?? 1]} · ${new Date(last?.date ?? Date.now()).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`}
                    tone="electric"
                  />
                  <StatCard
                    label="Mais frequente"
                    value={`G${String(mostFrequent.group).padStart(2, "0")}`}
                    hint={`${mostFrequent.animal} · ${mostFrequent.frequency} (${mostFrequent.pct.toFixed(1)}%)`}
                    tone="neon"
                  />
                  <StatCard
                    label="Mais atrasado"
                    value={`G${String(mostDelayed.group).padStart(2, "0")}`}
                    hint={`${mostDelayed.animal} · ${mostDelayed.delay} sorteios`}
                    tone="warning"
                  />
                  <StatCard
                    label="Índice de dispersão"
                    value={dispersion.toFixed(3)}
                    hint="≈ 1.0 para Poisson"
                  />
                </div>
              </section>
            </aside>

            {/* CENTER — Heatmap + Matrix */}
            <section className="space-y-4 bg-background p-4">
              <div className="rounded-md border border-border bg-surface/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                      <BarChart3 className="h-3.5 w-3.5 text-electric" />
                      Heatmap dos 25 grupos
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Verde = frequente, vermelho = raro. Score 0-100 normalizado pelo Z-score.
                    </p>
                  </div>
                  <Legend />
                </div>
                <GroupHeatmap stats={stats} onSelect={setSelected} selected={selected} />
              </div>

              {selectedStat && (
                <div className="rounded-md border border-electric/40 bg-electric/5 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-electric">
                        Grupo selecionado
                      </div>
                      <div className="ticker text-3xl font-bold">
                        {String(selectedStat.group).padStart(2, "0")}{" "}
                        <span className="text-base font-normal text-muted-foreground">
                          {selectedStat.animal}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-3 text-xs">
                    <Field label="Frequência" value={selectedStat.frequency} />
                    <Field label="% do total" value={`${selectedStat.pct.toFixed(2)}%`} />
                    <Field label="Atraso" value={`${selectedStat.delay}`} />
                    <Field label="Z-score" value={selectedStat.zScore.toFixed(2)} />
                  </div>
                  <p className="mt-3 rounded border border-warning/30 bg-warning/5 px-3 py-2 text-[11px] text-warning">
                    Atrasos e frequências passadas <strong>não</strong> alteram a probabilidade do
                    próximo sorteio em um processo aleatório.
                  </p>
                </div>
              )}

              <div className="rounded-md border border-border bg-surface/40 p-4">
                <SectionLabel>Matriz 5×5 interativa</SectionLabel>
                <div className="grid grid-cols-5 gap-1">
                  {stats.map((s) => (
                    <button
                      key={s.group}
                      onClick={() => setSelected(s.group)}
                      className={cn(
                        "rounded border border-border/50 bg-surface px-2 py-2 text-left transition-all hover:border-electric",
                        selected === s.group && "border-electric ring-1 ring-electric/40",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="ticker text-xs font-bold">
                          {String(s.group).padStart(2, "0")}
                        </span>
                        <span
                          className={cn(
                            "ticker text-[10px]",
                            s.score > 60 && "text-neon",
                            s.score < 40 && "text-danger",
                          )}
                        >
                          {s.score}
                        </span>
                      </div>
                      <div className="mt-1 grid grid-cols-2 gap-x-1 text-[10px] text-muted-foreground">
                        <span>f:{s.frequency}</span>
                        <span>a:{s.delay}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* RIGHT — NEO Analyst */}
            <aside className="bg-background lg:h-[calc(100vh-50px)] lg:sticky lg:top-[50px]">
              <NeoChat context={chatContext} />
            </aside>
          </div>
        ) : tab === "backtest" ? (
          <BacktestModule draws={draws} stats={stats} />
        ) : tab === "montecarlo" ? (
          <MonteCarloModule />
        ) : tab === "audit" ? (
          <AuditModule draws={draws} stats={stats} />
        ) : tab === "insights" ? (
          <InsightsModule context={chatContext} />
        ) : (
          <ExplorerModule draws={draws} />
        )}
      </main>

      <footer className="border-t border-border bg-surface/60 px-4 py-2 text-[10px] text-muted-foreground ticker flex items-center justify-between">
        <span>
          NEO Quant Lab · plataforma experimental de análise estatística · NÃO realiza previsões
          nem recomenda apostas
        </span>
        <span className="hidden sm:inline">{draws.length.toLocaleString()} draws · audit {audit.score}/100</span>
      </footer>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded bg-background/60 p-2">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="ticker mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | [string, string])[];
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded border border-border bg-surface px-2 py-1.5 text-xs focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric/40"
      >
        {options.map((o) => {
          const [v, l] = Array.isArray(o) ? o : [o, o];
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
      <span>Raro</span>
      <div
        className="h-2 w-24 rounded-full"
        style={{
          background:
            "linear-gradient(to right, oklch(0.5 0.22 25), oklch(0.75 0.17 75), oklch(0.85 0.22 145))",
        }}
      />
      <span>Frequente</span>
    </div>
  );
}

// ─── Save Analysis Button ───────────────────────────────────────────────────

function SaveAnalysisButton({
  draws,
  audit,
  filters,
}: {
  draws: Draw[];
  audit: ReturnType<typeof randomnessScore>;
  filters: { lottery: string; state: string; period: string; extraction: string };
}) {
  const { mutateAsync: save, isPending } = useSaveAnalysis();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await save({
        title: `${filters.lottery} · ${filters.state} · ${filters.period}`,
        filters,
        results: {
          draws_count: draws.length,
          audit_score: audit.score,
          classification: audit.classification,
          chi: audit.chi,
          entropy: audit.entropy,
          max_entropy: audit.maxEntropy,
          runs: audit.runs,
          dispersion: 0,
          top_groups: [],
        },
        draws_count: draws.length,
        audit_score: audit.score,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  return (
    <button
      id="btn-save-analysis"
      onClick={handleSave}
      disabled={isPending || saved}
      title="Salvar análise atual"
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all",
        saved
          ? "border-neon/40 bg-neon/10 text-neon"
          : "border-border bg-surface/60 text-muted-foreground hover:border-electric/40 hover:text-electric",
      )}
    >
      <Save className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{saved ? "Salvo!" : "Salvar"}</span>
    </button>
  );
}

