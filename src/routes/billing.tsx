import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Zap, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { requireAuth } from "@/lib/auth-guard";
import { UserMenu } from "@/components/neo/user-menu";
import { PLAN_LABELS, PLAN_COLORS } from "@/types/database";
import { cn } from "@/lib/utils";
import { usePlanLimits } from "@/hooks/use-plan-limits";

export const Route = createFileRoute("/billing")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [{ title: "Assinatura e Limites — NEO Quant Lab" }],
  }),
  component: BillingDashboard,
});

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const isDanger = percentage >= 90;
  const isWarning = percentage >= 75 && percentage < 90;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {used} / {limit < 999999 ? limit : "∞"}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface/80">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isDanger ? "bg-danger" : isWarning ? "bg-warning" : "bg-electric"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isDanger && limit < 999999 && (
        <p className="text-xs text-danger mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Você está próximo do limite.
        </p>
      )}
    </div>
  );
}

function BillingDashboard() {
  const { profile } = useAuth();
  const { data: limits, isLoading } = usePlanLimits();

  if (!profile) return null;

  const plan = profile.plan ?? "free";
  const planLabel = PLAN_LABELS[plan];
  const planColor = PLAN_COLORS[plan];

  return (
    <div className="flex min-h-screen flex-col bg-background scanline">
      <header className="z-10 flex items-center justify-between border-b border-border bg-surface/80 px-6 py-3 backdrop-blur">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-electric to-neon">
            <span className="ticker text-xs font-bold text-background">N</span>
          </div>
          <span className="font-semibold tracking-tight">NEO Quant Lab</span>
        </Link>
        <UserMenu />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Assinatura e Uso</h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe os limites da sua cota mensal e os recursos do seu plano.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_350px]">
          <div className="space-y-8">
            {/* Usage Limits */}
            <div className="rounded-xl border border-border bg-surface/40 p-6">
              <h2 className="mb-6 flex items-center gap-2 text-base font-medium">
                <Zap className="h-5 w-5 text-neon" /> Consumo do Ciclo Atual
              </h2>
              
              {isLoading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-10 bg-surface rounded" />
                  <div className="h-10 bg-surface rounded" />
                </div>
              ) : limits ? (
                <div className="space-y-8">
                  <UsageBar
                    label="Análises Salvas"
                    used={limits.analyses_used}
                    limit={limits.max_saved_analyses}
                  />
                  <UsageBar
                    label="Mensagens / Interações com IA"
                    used={limits.ai_queries_used}
                    limit={limits.max_ai_queries}
                  />
                </div>
              ) : (
                <p className="text-sm text-danger">Erro ao carregar limites do plano.</p>
              )}
            </div>

            {/* Features */}
            <div className="rounded-xl border border-border bg-surface/40 p-6">
              <h2 className="mb-6 text-base font-medium">Recursos Liberados</h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-neon" /> Heatmap Estatístico Avançado
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-neon" /> Simulador Monte Carlo
                  {plan === "free" && <span className="text-[10px] uppercase text-muted-foreground ml-2">(Limite 500k)</span>}
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-neon" /> Backtesting Histórico
                </li>
                <li className={cn("flex items-center gap-3 text-sm", plan === "free" ? "text-muted-foreground opacity-50" : "")}>
                  {plan === "free" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-neon" />} 
                  Exportação de Relatórios CSV
                  {plan === "free" && <span className="text-[10px] uppercase ml-2 px-1.5 py-0.5 rounded bg-surface border border-border text-foreground">Upgrade</span>}
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            {/* Current Plan Card */}
            <div className="rounded-xl border border-electric/30 bg-surface/40 p-6 relative overflow-hidden shadow-[0_0_40px_-15px_var(--electric)]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-electric/20 blur-3xl" />
              
              <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Seu Plano Atual
              </div>
              
              <div className="mb-6 flex items-baseline gap-2">
                <span className={cn("text-3xl font-bold uppercase tracking-tight ticker", planColor)}>
                  {planLabel}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                {plan === "free" ? "Ideal para testes e validações pontuais em sorteios." : "Você tem acesso premium à plataforma de quant analytics."}
              </p>

              {plan === "free" && (
                <button className="flex w-full items-center justify-center gap-2 rounded-md bg-electric px-4 py-2.5 text-sm font-semibold text-electric-foreground hover:brightness-110 transition-all">
                  <Sparkles className="h-4 w-4" /> Fazer Upgrade
                </button>
              )}
              {plan !== "free" && (
                <button className="flex w-full items-center justify-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-surface-hover transition-colors">
                  Gerenciar Faturamento
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
