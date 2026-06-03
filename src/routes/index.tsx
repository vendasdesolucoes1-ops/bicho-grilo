import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Database,
  FlaskConical,
  Gauge,
  LineChart as LineChartIcon,
  PlayCircle,
  Sparkles,
  TerminalSquare,
  XCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { computeGroupStats, generateDraws, randomnessScore } from "@/lib/lottery-data";
import { GroupHeatmap } from "@/components/neo/group-heatmap";
import { useAuth } from "@/contexts/auth-context";
import { UserMenu } from "@/components/neo/user-menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEO Quant Lab — Inteligência Quantitativa para Eventos Aleatórios" },
      {
        name: "description",
        content:
          "Transforme dados aleatórios em inteligência visual. Audite distribuições, execute simulações e valide hipóteses estatísticas com apoio de IA.",
      },
      { property: "og:title", content: "NEO Quant Lab" },
      {
        property: "og:description",
        content:
          "Plataforma avançada de análise estatística, auditoria de aleatoriedade e simulação probabilística.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <Hero />
      <Problem />
      <Features />
      <AISection />
      <DashboardShowcase />
      <Differential />
      <EdgeScore />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* -------------------- NAV -------------------- */
function Nav() {
  const { profile } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/70 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-electric to-neon shadow-[0_0_20px_-4px_var(--electric)]">
            <span className="ticker text-xs font-bold text-background">N</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold tracking-tight">NEO Quant Lab</span>
            <span className="ticker text-[10px] text-muted-foreground">v1.0</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#recursos" className="hover:text-foreground transition-colors">
            Recursos
          </a>
          <a href="#ia" className="hover:text-foreground transition-colors">
            IA
          </a>
          <a href="#dashboard" className="hover:text-foreground transition-colors">
            Plataforma
          </a>
          <a href="#edge" className="hover:text-foreground transition-colors">
            Edge Score
          </a>
        </nav>
        
        {profile ? (
          <UserMenu />
        ) : (
          <Link
            to="/terminal"
            className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-surface/60 px-3.5 py-1.5 text-xs font-medium text-foreground backdrop-blur hover:border-electric hover:text-electric transition-all"
          >
            Entrar no Terminal
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </header>
  );
}

/* -------------------- HERO -------------------- */
function Hero() {
  const draws = useMemo(() => generateDraws(600, 42), []);
  const stats = useMemo(() => computeGroupStats(draws), [draws]);
  const audit = useMemo(() => randomnessScore(draws, stats), [draws, stats]);

  return (
    <section className="relative overflow-hidden pt-28 pb-24">
      {/* Grid background */}
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      {/* Gradient blooms */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-electric/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[500px] w-[600px] rounded-full bg-neon/5 blur-[160px]" />
      <Particles />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon" />
              </span>
              Quantitative Intelligence Engine
            </div>

            <h1 className="font-sans text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-[68px]">
              Transforme dados aleatórios em{" "}
              <span className="bg-gradient-to-br from-electric via-electric to-neon bg-clip-text text-transparent">
                inteligência visual.
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Audite distribuições, execute simulações, valide hipóteses estatísticas e explore
              milhares de eventos históricos com apoio de IA.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/terminal"
                className="group inline-flex items-center gap-2 rounded-md bg-electric px-5 py-3 text-sm font-semibold text-electric-foreground shadow-[0_0_30px_-6px_var(--electric)] hover:brightness-110 transition-all"
              >
                Entrar no Terminal
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#dashboard"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/40 px-5 py-3 text-sm font-medium text-foreground backdrop-blur hover:border-foreground/40 transition-all"
              >
                <PlayCircle className="h-4 w-4" />
                Ver Demonstração
              </a>
            </div>

            <div className="flex items-center gap-6 pt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-neon" /> Não faz previsões
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-neon" /> Evidência estatística
              </span>
              <span className="hidden md:flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-neon" /> IA analítica
              </span>
            </div>
          </div>

          {/* Right — dashboard mock */}
          <HeroDashboard stats={stats} audit={audit} />
        </div>
      </div>
    </section>
  );
}

function HeroDashboard({
  stats,
  audit,
}: {
  stats: ReturnType<typeof computeGroupStats>;
  audit: ReturnType<typeof randomnessScore>;
}) {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-electric/20 via-transparent to-neon/10 opacity-60 blur-2xl" />
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface/70 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border/70 bg-background/60 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-neon/80" />
          </div>
          <div className="ticker text-[10px] text-muted-foreground">
            neo://terminal · audit{" "}
            <span className="text-neon">{audit.score}/100</span>
          </div>
          <div className="flex items-center gap-1 ticker text-[10px] text-neon">
            <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_var(--neon)]" />
            LIVE
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 p-4">
          <div className="col-span-3 space-y-3">
            <div className="rounded-md border border-border/60 bg-background/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Heatmap · 25 grupos
                </span>
                <span className="ticker text-[10px] text-electric">Z-normalized</span>
              </div>
              <GroupHeatmap stats={stats} />
            </div>
            <MiniSparkline />
          </div>
          <div className="col-span-2 space-y-3">
            <MiniGauge score={audit.score} />
            <MiniStat label="Chi²" value={audit.chi.value.toFixed(1)} sub={`df=${audit.chi.df}`} />
            <MiniStat
              label="Entropia"
              value={audit.entropy.toFixed(3)}
              sub={`máx ${audit.maxEntropy.toFixed(2)}`}
              tone="neon"
            />
            <MiniStat
              label="Runs Z"
              value={audit.runs.z.toFixed(2)}
              sub={`obs ${audit.runs.runs}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniSparkline() {
  const pts = useMemo(() => {
    const arr: number[] = [];
    let v = 50;
    for (let i = 0; i < 48; i++) {
      v += (Math.sin(i / 3) + (Math.random() - 0.5)) * 4;
      arr.push(Math.max(10, Math.min(90, v)));
    }
    return arr;
  }, []);
  const w = 100, h = 28;
  const d = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - (p / 100) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Dispersão temporal
        </span>
        <span className="ticker text-[10px] text-neon">+2.4σ</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full">
        <defs>
          <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--electric)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--electric)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} L${w},${h} L0,${h} Z`} fill="url(#spark)" />
        <path d={d} fill="none" stroke="var(--electric)" strokeWidth="0.8" />
      </svg>
    </div>
  );
}

function MiniGauge({ score }: { score: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c * 0.75;
  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-3 text-center">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        Randomness
      </div>
      <div className="relative mx-auto mt-1 h-20 w-20">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-[135deg]">
          <circle cx="50" cy="50" r={r} stroke="var(--grid)" strokeWidth="6" fill="none"
            strokeDasharray={`${c * 0.75} ${c}`} strokeLinecap="round" />
          <circle cx="50" cy="50" r={r} stroke="var(--neon)" strokeWidth="6" fill="none"
            strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="ticker text-xl font-bold">{score}</span>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  tone = "electric",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "electric" | "neon";
}) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <span className={cn("h-1.5 w-1.5 rounded-full", tone === "neon" ? "bg-neon" : "bg-electric")} />
      </div>
      <div className="ticker mt-0.5 text-base font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        d: 8 + Math.random() * 12,
        s: 0.4 + Math.random() * 0.8,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-electric/40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.s * 2}px`,
            height: `${p.s * 2}px`,
            filter: "blur(0.5px)",
            animation: `floatY ${p.d}s ease-in-out ${i * 0.3}s infinite alternate`,
          }}
        />
      ))}
      <style>{`@keyframes floatY { from { transform: translateY(0) } to { transform: translateY(-30px) } }`}</style>
    </div>
  );
}

/* -------------------- PROBLEM -------------------- */
function Problem() {
  const cards = [
    { icon: BarChart3, label: "Frequência", text: "Quantas vezes algo realmente apareceu." },
    { icon: LineChartIcon, label: "Distribuição", text: "Como os eventos se espalham no tempo." },
    { icon: Activity, label: "Probabilidade", text: "O que a matemática diz, não a intuição." },
    { icon: Brain, label: "Interpretação por IA", text: "Tradução estatística em linguagem clara." },
  ];
  return (
    <section className="relative border-t border-border/60 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[11px] uppercase tracking-[0.22em] text-electric">
            O problema dos padrões
          </span>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            O cérebro humano foi feito para encontrar padrões.
            <br />
            <span className="text-muted-foreground">Nem todos eles existem.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            A maioria das pessoas interpreta frequência, atraso e repetição como sinais
            preditivos. NEO Quant Lab foi criado para separar percepção de evidência — medindo,
            testando e validando hipóteses com estatística real.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="group relative overflow-hidden rounded-xl border border-border bg-surface/40 p-5 backdrop-blur transition-all hover:border-electric/60 hover:-translate-y-0.5"
              >
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-electric/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <Icon className="h-5 w-5 text-electric" />
                <div className="mt-4 text-sm font-semibold">{c.label}</div>
                <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------- FEATURES -------------------- */
function Features() {
  const features = [
    {
      icon: BarChart3,
      title: "Heatmap Inteligente",
      text: "Visualize a distribuição dos grupos em tempo real com normalização por Z-score.",
    },
    {
      icon: LineChartIcon,
      title: "Backtesting",
      text: "Teste estratégias históricas contra milhares de registros com PnL e drawdown.",
    },
    {
      icon: Activity,
      title: "Monte Carlo",
      text: "Execute até 100.000 simulações para mapear distribuições de resultado.",
    },
    {
      icon: FlaskConical,
      title: "Auditoria Estatística",
      text: "Chi-Square, Entropia de Shannon, Uniformidade e Runs Test em uma bateria única.",
    },
    {
      icon: Sparkles,
      title: "NEO Analyst",
      text: "Assistente de IA especializado em interpretação estatística — não em previsão.",
    },
    {
      icon: Database,
      title: "Explorador de Dados",
      text: "Pesquise, filtre, agrupe e exporte milhares de eventos históricos em CSV.",
    },
  ];
  return (
    <section id="recursos" className="relative border-t border-border/60 py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="text-[11px] uppercase tracking-[0.22em] text-electric">
              Plataforma
            </span>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Um laboratório quantitativo completo.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Cada módulo foi desenhado para responder uma única pergunta: o que os dados realmente
            mostram?
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative bg-background p-7 transition-all hover:bg-surface/60"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface group-hover:border-electric/60 group-hover:shadow-[0_0_24px_-8px_var(--electric)] transition-all">
                  <Icon className="h-4 w-4 text-electric" />
                </div>
                <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                <ArrowRight className="absolute right-6 top-7 h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------- AI -------------------- */
function AISection() {
  return (
    <section id="ia" className="relative border-t border-border/60 py-28">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <div className="absolute -inset-6 rounded-2xl bg-gradient-to-br from-neon/10 to-electric/15 blur-3xl" />
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface/70 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border/70 bg-background/60 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-electric to-neon">
                  <Sparkles className="h-3 w-3 text-background" />
                </div>
                <span className="text-xs font-medium">NEO Analyst</span>
              </div>
              <span className="ticker text-[10px] text-neon">online</span>
            </div>
            <div className="space-y-3 p-4">
              <div className="ml-auto max-w-[80%] rounded-xl rounded-tr-sm border border-electric/30 bg-electric/10 px-3.5 py-2.5 text-sm">
                O grupo 17 está acima da média?
              </div>
              <div className="max-w-[88%] rounded-xl rounded-tl-sm border border-border bg-background/60 px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
                O grupo apresenta frequência <span className="text-electric">superior ao esperado</span>{" "}
                (Z = +1.42), porém o desvio <span className="text-neon">não é estatisticamente
                significativo</span> ao nível α = 0.05. Comportamento consistente com flutuação
                amostral em processo aleatório.
                <div className="mt-2 flex gap-1.5">
                  <span className="ticker rounded bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    p ≈ 0.156
                  </span>
                  <span className="ticker rounded bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    n = 600
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
                <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
                analisando distribuição…
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <span className="text-[11px] uppercase tracking-[0.22em] text-electric">
            Inteligência analítica
          </span>
          <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            A IA não faz previsões.
            <br />
            <span className="bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
              Ela traduz matemática complexa em linguagem simples.
            </span>
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            NEO Analyst auditora cada hipótese contra distribuições teóricas, identifica
            anomalias significativas e explica o resultado com vocabulário que qualquer pessoa
            entende — sem promessas, sem palpites.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              "Interpretação contextual de Z-scores e p-valores",
              "Detecção de viés amostral e clusters anômalos",
              "Tradução de jargão estatístico para linguagem natural",
              "Recusa explícita de previsões sobre eventos independentes",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neon" />
                <span className="text-foreground/90">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------- DASHBOARD SHOWCASE -------------------- */
function DashboardShowcase() {
  return (
    <section id="dashboard" className="relative border-t border-border/60 py-28">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <span className="text-[11px] uppercase tracking-[0.22em] text-electric">
          Terminal quantitativo
        </span>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          Densidade de dados. Clareza de leitura.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground">
          Heatmaps, matrizes, simulações Monte Carlo, backtests e scores de evidência reunidos em
          uma interface única — pensada para análise contínua.
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-7xl px-6">
        <div className="relative">
          <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-electric/20 via-transparent to-neon/15 blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/70 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border/70 bg-background/60 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <TerminalSquare className="h-3.5 w-3.5 text-electric" />
                <span className="text-xs font-medium">NEO Quant Lab · Terminal</span>
              </div>
              <div className="ticker text-[10px] text-muted-foreground hidden sm:block">
                heatmap · matrix · montecarlo · backtest · audit
              </div>
              <span className="ticker text-[10px] text-neon">live</span>
            </div>
            <div className="grid grid-cols-1 gap-px bg-border/70 md:grid-cols-3">
              <MockPanel title="Heatmap 5×5" tone="electric">
                <MockHeatmap />
              </MockPanel>
              <MockPanel title="Monte Carlo · 50k" tone="neon">
                <MockDistribution />
              </MockPanel>
              <MockPanel title="Backtest · Equity" tone="warning">
                <MockEquity />
              </MockPanel>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 bg-background/60 px-4 py-3 text-[11px] ticker text-muted-foreground">
              <span>chi² 22.4 · entropia 4.61/4.64 · runs Z -0.31</span>
              <span>
                evidence score <span className="text-neon">87/100</span>
              </span>
              <span>2.041 draws auditados</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockPanel({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "electric" | "neon" | "warning";
  children: React.ReactNode;
}) {
  const dot =
    tone === "electric" ? "bg-electric" : tone === "neon" ? "bg-neon" : "bg-warning";
  return (
    <div className="bg-background/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {title}
          </span>
        </div>
        <span className="ticker text-[10px] text-muted-foreground">▲ 2.4%</span>
      </div>
      {children}
    </div>
  );
}

function MockHeatmap() {
  const cells = useMemo(
    () => Array.from({ length: 25 }, () => 0.2 + Math.random() * 0.8),
    [],
  );
  return (
    <div className="grid grid-cols-5 gap-1">
      {cells.map((v, i) => {
        const h = v < 0.5 ? 25 + v * 100 : 75 + (v - 0.5) * 140;
        const l = 0.45 + v * 0.2;
        const c = 0.12 + v * 0.16;
        return (
          <div
            key={i}
            className="aspect-square rounded border border-border/30"
            style={{ backgroundColor: `oklch(${l} ${c} ${h})` }}
          />
        );
      })}
    </div>
  );
}

function MockDistribution() {
  const bars = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 22; i++) {
      const x = (i - 11) / 4;
      arr.push(Math.exp(-x * x) * 100);
    }
    return arr;
  }, []);
  const max = Math.max(...bars);
  return (
    <div className="flex h-28 items-end gap-[3px]">
      {bars.map((b, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${(b / max) * 100}%`,
            background: `linear-gradient(to top, var(--neon), var(--electric))`,
            opacity: 0.45 + (b / max) * 0.55,
          }}
        />
      ))}
    </div>
  );
}

function MockEquity() {
  const pts = useMemo(() => {
    const arr: number[] = [];
    let v = 40;
    for (let i = 0; i < 60; i++) {
      v += (Math.random() - 0.45) * 4;
      arr.push(Math.max(5, Math.min(95, v)));
    }
    return arr;
  }, []);
  const w = 100, h = 80;
  const d = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - (p / 100) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-28 w-full">
      <defs>
        <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--warning)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--warning)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill="url(#eq)" />
      <path d={d} fill="none" stroke="var(--warning)" strokeWidth="1" />
    </svg>
  );
}

/* -------------------- DIFFERENTIAL -------------------- */
function Differential() {
  const trad = ["Achismos", "Padrões subjetivos", "Interpretação emocional", "Crenças sem teste"];
  const neo = [
    "Testes estatísticos formais",
    "Simulações Monte Carlo",
    "Evidência quantitativa",
    "IA analítica e sóbria",
  ];
  return (
    <section className="relative border-t border-border/60 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[11px] uppercase tracking-[0.22em] text-electric">Diferencial</span>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Mais ciência. <span className="text-muted-foreground">Menos superstição.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface/30 p-7">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <XCircle className="h-4 w-4 text-danger" />
              Métodos tradicionais
            </div>
            <ul className="mt-5 space-y-3">
              {trad.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-danger/70" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-electric/40 bg-gradient-to-br from-electric/[0.06] to-neon/[0.06] p-7">
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-electric/20 blur-3xl" />
            <div className="relative flex items-center gap-2 text-sm font-semibold">
              <Zap className="h-4 w-4 text-electric" />
              NEO Quant Lab
            </div>
            <ul className="relative mt-5 space-y-3">
              {neo.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neon" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- EDGE SCORE -------------------- */
function EdgeScore() {
  const target = 78;
  const [score, setScore] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          let v = 0;
          const id = setInterval(() => {
            v += 2;
            if (v >= target) {
              v = target;
              clearInterval(id);
            }
            setScore(v);
          }, 18);
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const r = 110;
  const c = 2 * Math.PI * r;
  const arc = c * 0.75;
  const offset = arc - (score / 100) * arc;

  return (
    <section id="edge" ref={ref} className="relative border-t border-border/60 py-28">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <span className="text-[11px] uppercase tracking-[0.22em] text-electric">
          Indicador proprietário
        </span>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          <Gauge className="mr-3 inline h-9 w-9 text-electric align-middle" />
          Edge Score
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground">
          Um indicador proprietário que mede o nível de evidência estatística presente em um
          conjunto de dados — de 0 (nenhuma evidência) a 100 (forte evidência estatística).
        </p>

        <div className="relative mx-auto mt-12 h-72 w-72">
          <div className="absolute inset-0 rounded-full bg-electric/10 blur-3xl" />
          <svg viewBox="0 0 280 280" className="relative h-full w-full -rotate-[135deg]">
            <defs>
              <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--electric)" />
                <stop offset="100%" stopColor="var(--neon)" />
              </linearGradient>
            </defs>
            <circle cx="140" cy="140" r={r} stroke="var(--grid)" strokeWidth="14" fill="none"
              strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
            <circle cx="140" cy="140" r={r} stroke="url(#edgeGrad)" strokeWidth="14" fill="none"
              strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.05s linear", filter: "drop-shadow(0 0 12px var(--electric))" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="ticker text-6xl font-bold tracking-tight">
              {score}
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-neon">
              Forte evidência
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4 text-xs">
          <div className="rounded-md border border-border bg-surface/40 p-3">
            <div className="ticker text-lg font-semibold">0–33</div>
            <div className="text-muted-foreground">Sem evidência</div>
          </div>
          <div className="rounded-md border border-warning/40 bg-warning/5 p-3">
            <div className="ticker text-lg font-semibold text-warning">34–66</div>
            <div className="text-muted-foreground">Sinal moderado</div>
          </div>
          <div className="rounded-md border border-neon/40 bg-neon/5 p-3">
            <div className="ticker text-lg font-semibold text-neon">67–100</div>
            <div className="text-muted-foreground">Evidência forte</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- FINAL CTA -------------------- */
function FinalCTA() {
  return (
    <section className="relative border-t border-border/60 py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric/15 blur-[140px]" />
      </div>
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
          Veja os dados antes de
          <br />
          <span className="bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
            acreditar nos padrões.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
          Transforme observação em análise. Transforme análise em evidência.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/terminal"
            className="group inline-flex items-center gap-2 rounded-md bg-electric px-6 py-3.5 text-sm font-semibold text-electric-foreground shadow-[0_0_40px_-6px_var(--electric)] hover:brightness-110 transition-all"
          >
            Acessar o NEO Quant Lab
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------- FOOTER -------------------- */
function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface/30 py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-electric to-neon">
                <span className="ticker text-xs font-bold text-background">N</span>
              </div>
              <span className="font-semibold tracking-tight">NEO Quant Lab</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Desenvolvido para análise estatística e pesquisa quantitativa. Não realiza previsões
              nem recomenda apostas.
            </p>
          </div>
          <FooterCol title="Plataforma" links={[["Terminal", "/terminal"]]} />
          <FooterCol title="Recursos" links={[["Heatmap", "#recursos"], ["Backtesting", "#recursos"], ["Monte Carlo", "#recursos"], ["Edge Score", "#edge"]]} />
          <FooterCol title="Documentação" links={[["Metodologia", "#ia"], ["FAQ", "#"], ["Contato", "#"]]} />
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-[11px] text-muted-foreground md:flex-row md:items-center">
          <span className="ticker">© {new Date().getFullYear()} NEO Quant Lab · v1.0.0</span>
          <span>Plataforma experimental · análise estatística · pesquisa quantitativa</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            {href.startsWith("/") ? (
              <Link to={href} className="text-foreground/80 hover:text-electric transition-colors">
                {label}
              </Link>
            ) : (
              <a href={href} className="text-foreground/80 hover:text-electric transition-colors">
                {label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
