import { useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

interface InsightsProps {
  context: string;
}

export function InsightsModule({ context }: InsightsProps) {
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ context }),
      }),
  );
  const { messages, sendMessage, status, setMessages } = useChat({ transport });

  function generate() {
    setMessages([]);
    void sendMessage({
      text: "Gere um resumo executivo diário (5 a 7 frases) sobre o estado estatístico atual dos sorteios. Inclua: (1) compatibilidade com distribuição aleatória, (2) testes que merecem atenção, (3) interpretação sóbria do score de aleatoriedade, (4) aviso explícito de que sorteios independentes não permitem previsão. Use markdown com bullets.",
    });
  }

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const text = messages
    .filter((m) => m.role === "assistant")
    .map((m) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join(""))
    .join("\n\n");

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-4 w-4 text-neon" />
            Insights IA — Briefing Diário
          </h2>
          <p className="text-sm text-muted-foreground">
            Resumo automático gerado pelo NEO Analyst sobre o estado estatístico observado.
          </p>
        </div>
        <button
          onClick={generate}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded bg-electric px-3 py-1.5 text-xs font-semibold text-electric-foreground hover:brightness-110 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Regenerar
        </button>
      </header>

      <div className="rounded-md border border-border bg-surface p-5">
        {busy && !text && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> NEO Analyst auditando os dados…
          </div>
        )}
        <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
          {text}
        </div>
      </div>
    </div>
  );
}
