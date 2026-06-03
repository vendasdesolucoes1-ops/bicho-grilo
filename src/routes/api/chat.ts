import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

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
          const gateway = createLovableAiGatewayProvider(lovableKey);
          model = gateway("google/gemini-3-flash-preview");
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
          return result.toUIMessageStreamResponse({ originalMessages: messages });
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
