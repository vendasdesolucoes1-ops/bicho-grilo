import { createFileRoute, Link } from "@tanstack/react-router";
import { User, Shield, CreditCard, Calendar, Mail, Building, Key } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { requireAuth } from "@/lib/auth-guard";
import { UserMenu } from "@/components/neo/user-menu";
import { PLAN_LABELS, PLAN_COLORS } from "@/types/database";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [{ title: "Minha Conta — NEO Quant Lab" }],
  }),
  component: AccountDashboard,
});

function AccountDashboard() {
  const { profile } = useAuth();

  if (!profile) return null;

  const plan = profile.plan ?? "free";
  const planLabel = PLAN_LABELS[plan];
  const planColor = PLAN_COLORS[plan];
  
  const createdDate = new Date(profile.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

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

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Configurações da Conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie seu perfil e informações organizacionais.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            {/* Perfil */}
            <div className="rounded-xl border border-border bg-surface/40 p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-electric">
                <User className="h-4 w-4" /> Perfil Pessoal
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome de Exibição</label>
                  <div className="mt-1 flex h-10 w-full items-center rounded-md border border-border bg-background px-3 text-sm">
                    {profile.display_name ?? "Não informado"}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cargo / Papel</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-electric/10 px-2.5 py-0.5 text-xs font-medium text-electric">
                      <Shield className="mr-1.5 h-3 w-3" />
                      {profile.role.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Organização */}
            <div className="rounded-xl border border-border bg-surface/40 p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-neon">
                <Building className="h-4 w-4" /> Tenant / Organização
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome da Organização</label>
                  <div className="mt-1 flex h-10 w-full items-center rounded-md border border-border bg-background px-3 text-sm">
                    {profile.tenant_name ?? "Organização Padrão"}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tenant ID (Interno)</label>
                  <div className="mt-1 flex h-10 w-full items-center rounded-md border border-border bg-background/50 px-3 text-xs font-mono text-muted-foreground">
                    {profile.tenant_id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Card de Assinatura Resumido */}
            <div className="rounded-xl border border-border bg-surface/40 p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-electric/10 blur-2xl" />
              
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <CreditCard className="h-4 w-4" /> Assinatura Atual
              </div>
              
              <div className="space-y-4">
                <div className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase ticker border", planColor, "bg-background")}>
                  Plano {planLabel}
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> Membro desde
                  </div>
                  <div className="text-sm font-medium">{createdDate}</div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Link
                    to="/billing"
                    className="flex w-full items-center justify-center rounded-md bg-electric/10 px-4 py-2 text-sm font-medium text-electric hover:bg-electric/20 transition-colors"
                  >
                    Gerenciar Assinatura
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
