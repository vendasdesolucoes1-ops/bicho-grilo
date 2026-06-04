import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut, User, CreditCard, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { PLAN_COLORS, PLAN_LABELS } from "@/types/database";

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const plan = profile?.plan ?? "free";
  const planLabel = PLAN_LABELS[plan];
  const planColor = PLAN_COLORS[plan];
  const displayName =
    profile?.display_name ?? profile?.tenant_name ?? user.email ?? "Usuário";


  return (
    <div className="relative">
      <button
        id="btn-user-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-border bg-surface/60 px-2.5 py-1.5 text-xs transition-all hover:border-electric/40"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-electric/30 to-neon/30 text-[10px] font-bold uppercase text-electric">
          {displayName.charAt(0)}
        </div>
        <span className="hidden sm:inline max-w-[100px] truncate text-foreground/80">
          {displayName}
        </span>
        <span className={cn("ticker text-[9px] uppercase font-bold", planColor)}>
          {planLabel}
        </span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1.5 w-52 rounded-lg border border-border bg-surface/95 shadow-xl backdrop-blur-xl">
            <div className="border-b border-border/60 px-3 py-3">
              <p className="text-xs font-medium">{displayName}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                {profile.tenant_name}
              </p>
              <span
                className={cn(
                  "mt-1.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ticker",
                  plan === "free" && "border-border text-muted-foreground",
                  plan === "starter" && "border-electric/40 text-electric",
                  plan === "pro" && "border-neon/40 text-neon",
                  plan === "elite" && "border-warning/40 text-warning",
                )}
              >
                Plano {planLabel}
              </span>
            </div>
            <div className="p-1">
              <Link
                to="/terminal"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-electric/10 hover:text-electric transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Terminal
              </Link>
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-electric/10 hover:text-electric transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                Minha Conta
              </Link>
              <Link
                to="/billing"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-electric/10 hover:text-electric transition-colors"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Assinatura
              </Link>
              <button
                id="btn-logout"
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors mt-1 border-t border-border/50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
