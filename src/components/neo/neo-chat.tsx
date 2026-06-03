import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Brain, Loader2, RotateCcw, ListCollapse } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatHistorySidebar } from "./chat-history-sidebar";
import { useConversationMessages, useCreateConversation, useAppendMessage } from "@/hooks/use-conversations";

interface NeoChatProps {
  context: string;
}

const SUGGESTIONS = [
  "Os últimos 500 sorteios são estatisticamente aleatórios?",
  "Explique o atraso do grupo mais postergado.",
  "Qual a interpretação do qui-quadrado atual?",
  "O que significa o índice de dispersão observado?",
];

export function NeoChat({ context }: NeoChatProps) {
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch real messages if we have a conversation selected
  const { data: dbMessages } = useConversationMessages(currentConvId);
  const { mutateAsync: createConv } = useCreateConversation();
  const { mutateAsync: appendMsg } = useAppendMessage();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ context }),
      }),
    [context],
  );

  // Map db messages to ai-sdk format
  const initialMessages: UIMessage[] = useMemo(() => {
    if (!dbMessages) return [];
    return dbMessages.map(
      (m) =>
        ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          parts: [{ type: "text", text: m.content }],
        }) as UIMessage,
    );
  }, [dbMessages]);

  const { messages, sendMessage, status, setMessages, stop } = useChat({
    transport,
    onFinish: async (msg) => {
      // Quando a IA terminar de responder, persistimos a resposta.
      if (currentConvId) {
        await appendMsg({
          conversationId: currentConvId,
          role: "assistant",
          content: msg.message?.content ?? "",
        });
      }
    },
  });

  const busy = status === "submitted" || status === "streaming";

  // When initial messages change (switched conversation), update the chat UI state
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, setMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentConvId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    
    let convId = currentConvId;
    if (!convId) {
      // Create a new conversation if it's the first message
      const newConv = await createConv({ title: text.slice(0, 30) + "..." });
      setCurrentConvId(newConv.id);
      convId = newConv.id;
    }

    // Save user message to DB
    await appendMsg({
      conversationId: convId,
      role: "user",
      content: text.trim(),
    });

    void sendMessage({ text: text.trim() });
    setInput("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div className="flex h-full flex-col relative">
      {/* Sidebar de Histórico de Conversas fica injetada aqui e abre por cima do chat (no mobile) ou ao lado. */}
      <ChatHistorySidebar currentId={currentConvId} onSelect={setCurrentConvId} />

      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          {/* Button to toggle history if needed. For now the ChatHistorySidebar has its own trigger button for mobile. */}
          <div className="relative">
            <div className="h-2 w-2 rounded-full bg-neon" />
            <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-neon/60" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            NEO Analyst
          </span>
          <span className="ticker text-[10px] text-muted-foreground">v1.0 · stat-audit</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentConvId(null)}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-electric/20 hover:text-electric"
            title="Nova conversa"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-md border border-border bg-surface-elevated/60 p-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-electric">
                <Brain className="h-3 w-3" /> Briefing automático
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Recebi o contexto estatístico atual: histórico, frequências, atrasos e
                distribuição. Posso auditar a aleatoriedade dos dados e explicar desvios — mas{" "}
                <span className="text-foreground/90">nunca</span> sugiro apostas.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Sugestões
              </div>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="block w-full rounded border border-border bg-surface/40 px-3 py-2 text-left text-xs text-foreground/85 transition-all hover:border-electric/60 hover:bg-surface hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              return (
                <div
                  key={m.id}
                  className={cn(
                    "text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto max-w-[88%] rounded-md bg-electric/15 px-3 py-2 text-foreground"
                      : "max-w-full text-foreground/90",
                  )}
                >
                  {m.role === "assistant" && (
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-neon">
                      NEO Analyst
                    </div>
                  )}
                  <div className="whitespace-pre-wrap break-words">{text}</div>
                </div>
              );
            })}
            {status === "submitted" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Analisando dados…
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-border p-3"
      >
        <div className="relative rounded-md border border-border bg-surface focus-within:border-electric/70">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={2}
            placeholder="Pergunte sobre frequências, atrasos, distribuição…"
            className="w-full resize-none bg-transparent px-3 py-2.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          <button
            type={busy ? "button" : "submit"}
            onClick={busy ? () => stop() : undefined}
            disabled={!busy && !input.trim()}
            className={cn(
              "absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-md transition-all",
              busy
                ? "bg-danger/80 text-white hover:bg-danger"
                : "bg-electric text-electric-foreground hover:brightness-110 disabled:opacity-30",
            )}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          NEO Analyst não sugere apostas. Apenas auditoria estatística.
        </p>
      </form>
    </div>
  );
}
