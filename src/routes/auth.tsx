import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowRight,
  Brain,
  Eye,
  EyeOff,
  FlaskConical,
  LineChart,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { redirectIfAuthenticated } from "@/lib/auth-guard";

// ─── Route ─────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) ?? "/terminal",
  }),
  beforeLoad: redirectIfAuthenticated,
  head: () => ({
    meta: [
      { title: "NEO Quant Lab — Entrar" },
      { name: "description", content: "Acesse o terminal de análise estatística quantitativa." },
    ],
  }),
  component: AuthPage,
});

// ─── Schemas ───────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const signupSchema = z
  .object({
    displayName: z.string().min(2, "Mínimo 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

// ─── Page ──────────────────────────────────────────────────────────────────

function AuthPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const [tab, setTab] = useState<"login" | "signup">("login");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left: Branding panel */}
      <aside className="hidden lg:flex lg:w-[46%] flex-col justify-between relative overflow-hidden bg-surface border-r border-border/60 p-12">
        {/* Grid background */}
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-[0.14] [mask-image:radial-gradient(ellipse_at_60%_40%,black_30%,transparent_75%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-electric/8 via-transparent to-neon/5" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-electric to-neon shadow-[0_0_24px_-4px_var(--electric)]">
            <span className="ticker text-sm font-bold text-background">N</span>
          </div>
          <span className="font-semibold tracking-tight">NEO Quant Lab</span>
        </Link>

        <div className="relative space-y-10">
          <div className="space-y-4">
            <span className="text-[11px] uppercase tracking-[0.22em] text-electric">
              Quantitative Intelligence Engine
            </span>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight">
              Estatística real.
              <br />
              <span className="bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
                Sem achismos.
              </span>
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
              Audite distribuições, execute simulações Monte Carlo e valide hipóteses com apoio de IA —
              tudo em um terminal quantitativo.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: FlaskConical, text: "Chi-Quadrado, Entropia e Runs Test integrados" },
              { icon: LineChart, text: "Backtesting histórico com PnL e drawdown" },
              { icon: Brain, text: "Monte Carlo com até 100k simulações" },
              { icon: Sparkles, text: "NEO Analyst — IA que explica, não prevê" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/60">
                  <Icon className="h-3.5 w-3.5 text-electric" />
                </div>
                {text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-neon" />
              Não faz previsões
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-electric" />
              Evidência estatística
            </span>
          </div>
        </div>

        <p className="relative text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} NEO Quant Lab · Plataforma experimental
        </p>
      </aside>

      {/* Right: Auth form */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-electric to-neon">
              <span className="ticker text-xs font-bold text-background">N</span>
            </div>
            <span className="font-semibold">NEO Quant Lab</span>
          </Link>

          {/* Tabs */}
          <div>
            <div className="flex rounded-lg border border-border bg-surface/60 p-1">
              <TabButton active={tab === "login"} onClick={() => setTab("login")}>
                Entrar
              </TabButton>
              <TabButton active={tab === "signup"} onClick={() => setTab("signup")}>
                Criar conta
              </TabButton>
            </div>
          </div>

          {/* Forms */}
          {tab === "login" ? (
            <LoginForm redirectTo={redirectTo} />
          ) : (
            <SignupForm redirectTo={redirectTo} onLoginClick={() => setTab("login")} />
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Tab Button ────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all",
        active
          ? "bg-electric text-electric-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

// ─── Login Form ────────────────────────────────────────────────────────────

function LoginForm({ redirectTo }: { redirectTo: string }) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setServerError(null);
    const { error } = await signIn(data.email, data.password);
    if (error) {
      setServerError("E-mail ou senha inválidos.");
      return;
    }
    navigate({ to: redirectTo as "/terminal" });
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Bem-vindo de volta</h2>
        <p className="text-sm text-muted-foreground">
          Entre com sua conta para acessar o terminal.
        </p>
      </div>

      {serverError && (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {serverError}
        </div>
      )}

      <div className="space-y-4">
        <FormField
          label="E-mail"
          id="login-email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="block text-sm font-medium">
            Senha
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className={cn(
                "w-full rounded-md border bg-surface/60 px-3 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric/40 transition-all",
                form.formState.errors.password
                  ? "border-danger focus:ring-danger/40"
                  : "border-border focus:border-electric",
              )}
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
          )}
        </div>
      </div>

      <button
        id="btn-login-submit"
        type="submit"
        disabled={isSubmitting}
        className="group w-full inline-flex items-center justify-center gap-2 rounded-md bg-electric px-4 py-3 text-sm font-semibold text-electric-foreground shadow-[0_0_30px_-6px_var(--electric)] hover:brightness-110 disabled:opacity-60 transition-all"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Entrando…
          </>
        ) : (
          <>
            Entrar no Terminal
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}

// ─── Signup Form ───────────────────────────────────────────────────────────

function SignupForm({
  redirectTo,
  onLoginClick,
}: {
  redirectTo: string;
  onLoginClick: () => void;
}) {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { displayName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setServerError(null);
    const { error } = await signUp(data.email, data.password, data.displayName);
    if (error) {
      if (error.includes("already registered")) {
        setServerError("Este e-mail já possui uma conta. Faça login.");
      } else {
        setServerError(error);
      }
      return;
    }
    setSuccess(true);
    // If Supabase email confirmation is disabled, redirect immediately
    setTimeout(() => navigate({ to: redirectTo as "/terminal" }), 1500);
  });

  const isSubmitting = form.formState.isSubmitting;

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neon/10 border border-neon/30">
          <Sparkles className="h-6 w-6 text-neon" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Conta criada!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Redirecionando para o terminal…
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Criar conta gratuita</h2>
        <p className="text-sm text-muted-foreground">
          Comece no plano Free — sem cartão.
        </p>
      </div>

      {serverError && (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {serverError}
        </div>
      )}

      <div className="space-y-4">
        <FormField
          label="Seu nome"
          id="signup-name"
          type="text"
          placeholder="João Silva"
          autoComplete="name"
          error={form.formState.errors.displayName?.message}
          {...form.register("displayName")}
        />

        <FormField
          label="E-mail"
          id="signup-email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />

        <div className="space-y-1.5">
          <label htmlFor="signup-password" className="block text-sm font-medium">
            Senha
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              className={cn(
                "w-full rounded-md border bg-surface/60 px-3 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric/40 transition-all",
                form.formState.errors.password
                  ? "border-danger focus:ring-danger/40"
                  : "border-border focus:border-electric",
              )}
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
          )}
        </div>

        <FormField
          label="Confirmar senha"
          id="signup-confirm"
          type="password"
          placeholder="Repita a senha"
          autoComplete="new-password"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register("confirmPassword")}
        />
      </div>

      <button
        id="btn-signup-submit"
        type="submit"
        disabled={isSubmitting}
        className="group w-full inline-flex items-center justify-center gap-2 rounded-md bg-electric px-4 py-3 text-sm font-semibold text-electric-foreground shadow-[0_0_30px_-6px_var(--electric)] hover:brightness-110 disabled:opacity-60 transition-all"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Criando conta…
          </>
        ) : (
          <>
            Criar conta gratuita
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Plataforma experimental. Não realiza previsões de apostas.
      </p>
    </form>
  );
}

// ─── Reusable FormField ────────────────────────────────────────────────────

const FormField = ({
  label,
  id,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium">
      {label}
    </label>
    <input
      id={id}
      className={cn(
        "w-full rounded-md border bg-surface/60 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-electric/40 transition-all",
        error ? "border-danger focus:ring-danger/40" : "border-border focus:border-electric",
      )}
      {...props}
    />
    {error && <p className="text-xs text-danger">{error}</p>}
  </div>
);
