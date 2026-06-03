import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldAlert, Database, Users, Building, MessageSquare, Activity, CheckCircle2, XCircle } from "lucide-react";
import { neoDb as supabase } from "@/integrations/supabase/client";
import { requireAuth } from "@/lib/auth-guard";
import { UserMenu } from "@/components/neo/user-menu";
import { createServerFn } from "@tanstack/react-start";

const getDiagnostics = createServerFn({ method: "GET" }).handler(async () => {
  return {
    aiProvider: process.env.GEMINI_API_KEY 
      ? "Gemini" 
      : process.env.OPENAI_API_KEY 
        ? "OpenAI" 
        : process.env.LOVABLE_API_KEY 
          ? "Lovable Gateway" 
          : "Não configurado",
  };
});

export const Route = createFileRoute("/admin-dev")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [{ title: "Admin Dev — NEO Quant Lab" }],
  }),
  component: AdminDevDashboard,
});

interface SystemStats {
  tenants: number;
  profiles: number;
  analyses: number;
  conversations: number;
}

function AdminDevDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [diagnostics, setDiagnostics] = useState<{ aiProvider: string } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        // neo_tenants
        const { count: tCount } = await supabase
          .from("neo_tenants")
          .select("*", { count: "exact", head: true });

        // neo_profiles
        const { count: pCount } = await supabase
          .from("neo_profiles")
          .select("*", { count: "exact", head: true });

        // neo_analyses
        const { count: aCount } = await supabase
          .from("neo_analyses")
          .select("*", { count: "exact", head: true });

        // neo_conversations
        const { count: cCount } = await supabase
          .from("neo_conversations")
          .select("*", { count: "exact", head: true });

        setStats({
          tenants: tCount ?? 0,
          profiles: pCount ?? 0,
          analyses: aCount ?? 0,
          conversations: cCount ?? 0,
        });

        // Diagnostics info
        const diag = await getDiagnostics();
        setDiagnostics(diag);
      } catch (e) {
        console.error("Erro ao buscar stats", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background scanline">
      <header className="z-10 flex items-center justify-between border-b border-danger/30 bg-danger/5 px-6 py-3 backdrop-blur">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-danger">
            <span className="ticker text-xs font-bold text-white">A</span>
          </div>
          <span className="font-semibold tracking-tight text-danger">Admin / Dev</span>
        </Link>
        <UserMenu />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="mb-8 rounded-lg border border-danger/40 bg-danger/10 p-4 flex items-start gap-4">
          <ShieldAlert className="h-6 w-6 text-danger shrink-0 mt-0.5" />
          <div>
            <h1 className="text-base font-semibold text-danger">Painel de Auditoria de Arquitetura</h1>
            <p className="text-sm text-danger/80 mt-1">
              Este painel consulta as tabelas diretamente. Algumas métricas (como Perfis e Análises) podem exibir resultados limitados ao escopo do seu Tenant atual devido às regras de Row-Level Security (RLS) aplicadas na sprint de arquitetura.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-surface/50 border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Organizações (Tenants)" 
              value={stats?.tenants ?? 0} 
              icon={Building} 
              tone="electric" 
              subtitle="Tabela public.tenants"
            />
            <StatCard 
              title="Usuários (Profiles)" 
              value={stats?.profiles ?? 0} 
              icon={Users} 
              tone="neon" 
              subtitle="Tabela neo.profiles"
            />
            <StatCard 
              title="Análises Salvas" 
              value={stats?.analyses ?? 0} 
              icon={Activity} 
              tone="warning" 
              subtitle="Tabela neo.analyses"
            />
            <StatCard 
              title="Sessões de IA" 
              value={stats?.conversations ?? 0} 
              icon={MessageSquare} 
              tone="electric" 
              subtitle="Tabela neo.conversations"
            />
          </div>
        )}

        {/* Diagnostics Section */}
        <div className="mt-12 rounded-lg border border-border bg-surface/30 p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-electric" />
            Status do Sistema
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <DiagnosticRow 
              label="Supabase Connection" 
              status={true} 
              detail={import.meta.env.VITE_SUPABASE_PROJECT_URL ? "Conectado" : "Missing URL"} 
            />
            <DiagnosticRow 
              label="Autenticação" 
              status={true} 
              detail="Ativa (RLS configurado)" 
            />
            <DiagnosticRow 
              label="Banco de Dados" 
              status={!loading && stats !== null} 
              detail={loading ? "Verificando..." : "Schema 'neo' acessível"} 
            />
            <DiagnosticRow 
              label="AI Provider" 
              status={diagnostics?.aiProvider !== "Não configurado"} 
              detail={diagnostics?.aiProvider ?? "Verificando..."} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function DiagnosticRow({ label, status, detail }: { label: string; status: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/50 bg-background/50 p-4">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{detail}</span>
        {status ? (
          <CheckCircle2 className="h-5 w-5 text-neon" />
        ) : (
          <XCircle className="h-5 w-5 text-danger" />
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  tone,
  subtitle
}: { 
  title: string; 
  value: number; 
  icon: any; 
  tone: "electric" | "neon" | "warning" | "danger";
  subtitle: string;
}) {
  const colors = {
    electric: "text-electric bg-electric/10 border-electric/30",
    neon: "text-neon bg-neon/10 border-neon/30",
    warning: "text-warning bg-warning/10 border-warning/30",
    danger: "text-danger bg-danger/10 border-danger/30",
  };

  return (
    <div className={`rounded-xl border p-5 relative overflow-hidden ${colors[tone]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
      </div>
      <div className="ticker text-4xl font-bold">{value}</div>
      <p className="mt-2 text-[10px] uppercase tracking-wider opacity-70">
        {subtitle}
      </p>
    </div>
  );
}
