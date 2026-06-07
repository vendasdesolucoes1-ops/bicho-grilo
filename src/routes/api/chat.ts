import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SYSTEM_PROMPT = `[IDENTIDADE]
Você é o NEO Analyst, auditor estatístico sênior do NEO Quant Lab.

[OBJETIVO]
Sua função exclusiva é auditar a aleatoriedade de sorteios históricos usando
métodos estatísticos: qui-quadrado, entropia, runs test, z-score,
intervalos de confiança e índices de dispersão.

[ESCOPO]
Para perguntas fora de auditoria estatística, oriente o usuário a reformular.
Quando o usuário perguntar sobre chances ou palpites, explique a falácia do
apostador e redirecione para a análise estatística objetiva.

[USO DO CONTEXTO]
Use os dados do CONTEXTO ESTATÍSTICO ATUAL para fundamentar todas as respostas.
Se o contexto estiver ausente ou vazio, responda: 'Ainda não há dados carregados.
Importe sorteios históricos para iniciar a análise.'

[EXEMPLO DE BOA RESPOSTA]
Usuário: O grupo 7 está atrasado há 15 sorteios. Vale a pena apostar?
Você: O atraso de 15 sorteios está dentro da faixa esperada. Com 25 grupos
uniformes, o intervalo médio entre saídas é 25 sorteios (desvio ~24.5).
Um atraso de 15 está a -0.4 sigma da média -- não há anomalia estatística.
Sorteios são eventos independentes; o passado não influencia o futuro.

Use linguagem técnica e sóbria em português brasileiro.`;

const CHAT_HISTORY_LIMIT = 20;

function unauthorized(message: string, status = 401) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function checkAiPlanAccess(request: Request): Promise<{ allowed: boolean; response?: Response }> {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return { allowed: true }; // misconfiguration shouldn't block chat in dev
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { allowed: false, response: unauthorized("Unauthorized: Bearer token required") };
  }
  const token = authHeader.slice("Bearer ".length);

  const authedClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data: claims, error: claimsError } = await authedClient.auth.getClaims(token);
  if (claimsError || !claims?.claims?.sub) {
    return { allowed: false, response: unauthorized("Unauthorized: Invalid token") };
  }

  const { data: profile } = await authedClient
    .from("neo_profiles")
    .select("tenant_id, neo_tenants(plan)")
    .eq("id", claims.claims.sub)
    .maybeSingle();

  const plan = (profile?.neo_tenants as unknown as { plan?: string } | null)?.plan ?? "free";
  if (plan === "free") {
    return {
      allowed: false,
      response: unauthorized("Plano atual não inclui acesso ao NEO Analyst. Faça upgrade para usar a IA.", 403),
    };
  }

  return { allowed: true };
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: UIMessage[]; context?: string };
        const allMessages = body.messages;
        if (!Array.isArray(allMessages)) {
          return new Response("Messages required", { status: 400 });
        }

        // C-03: cap the conversation history sent to the model — controls cost and
        // avoids "context length exceeded" errors on long conversations.
        const messages = allMessages.slice(-CHAT_HISTORY_LIMIT);

        // N-01: enforce AI access server-side (frontend-only checks can be bypassed via curl).
        const access = await checkAiPlanAccess(request);
        if (!access.allowed) return access.response!;

        const lovableKey = process.env.LOVABLE_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;

        let model;

        if (geminiKey) {
          const google = createGoogleGenerativeAI({ apiKey: geminiKey });
          model = google("gemini-2.5-flash");
        } else if (openaiKey) {
          const openai = createOpenAI({ apiKey: openaiKey });
          model = openai("gpt-4o-mini");
        } else if (lovableKey) {
          // AI-01: "-preview" models have no SLA and can be discontinued without notice.
          // Use the stable Gemini release in production.
          const gateway = createLovableAiGatewayProvider(lovableKey);
          model = gateway("google/gemini-2.0-flash");
        }

        if (!model) {
          console.warn("[API Chat] Nenhuma chave de IA encontrada. Retornando fallback.");
          // Fallback controlado para que a interface não quebre com 500
          // AI SDK useChat expects a stream. A simple plain text response with "0:..." simulates a data stream.
          return new Response(
            '0:"NEO Analyst indisponível. Configure uma chave de IA (GEMINI_API_KEY ou OPENAI_API_KEY) nas variáveis de ambiente para habilitar os insights automáticos."\n',
            {
              status: 200,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            }
          );
        }

        const system = body.context
          ? `${SYSTEM_PROMPT}\n\nCONTEXTO ESTATÍSTICO ATUAL:\n${body.context}`
          : SYSTEM_PROMPT;

        try {
          const result = streamText({
            model,
            system,
            messages: await convertToModelMessages(messages),
          });
          return result.toUIMessageStreamResponse({ originalMessages: allMessages });
        } catch (e) {
          console.error("[API Chat Error]", e);
          return new Response(
            '0:"Ocorreu um erro ao comunicar com o provedor de IA. Verifique os logs e os limites de cota da chave configurada."\n',
            {
              status: 200,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            }
          );
        }
      },
    },
  },
});
