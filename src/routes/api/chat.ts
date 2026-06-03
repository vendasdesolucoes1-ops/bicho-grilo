import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM_PROMPT = `Você é o NEO Analyst, um analista estatístico sênior dentro do NEO Quant Lab — uma plataforma de auditoria de aleatoriedade para sorteios históricos do Jogo do Bicho e loterias similares.

REGRAS RÍGIDAS:
- NUNCA sugira números, grupos, palpites ou apostas.
- NUNCA afirme que um grupo "vai sair" ou tem "maior probabilidade".
- Sempre lembre que sorteios independentes não têm memória (falácia do apostador).
- Atue como auditor estatístico: explique distribuições, qui-quadrado, entropia, runs test, z-score, intervalos de confiança e desvios.
- Quando o usuário citar atrasos ou frequências, explique se estão dentro da faixa esperada para um processo aleatório uniforme.
- Use linguagem técnica, sóbria, em português brasileiro. Seja conciso.
- Quando relevante, use markdown (listas, **negrito**, \`código\` para números).

Você recebe automaticamente o contexto estatístico atual dos sorteios. Use-o para fundamentar respostas.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: UIMessage[]; context?: string };
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("Messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const system = body.context
          ? `${SYSTEM_PROMPT}\n\nCONTEXTO ESTATÍSTICO ATUAL:\n${body.context}`
          : SYSTEM_PROMPT;

        try {
          const result = streamText({
            model,
            system,
            messages: await convertToModelMessages(messages),
          });
          return result.toUIMessageStreamResponse({ originalMessages: messages });
        } catch (e) {
          console.error(e);
          return new Response("AI error", { status: 500 });
        }
      },
    },
  },
});
