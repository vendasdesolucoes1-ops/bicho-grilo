import { useState } from "react";
import { MessageSquare, ChevronRight, Search, Plus, Trash2, Clock } from "lucide-react";
import { useConversations, useCreateConversation, useDeleteConversation } from "@/hooks/use-conversations";
import { cn } from "@/lib/utils";

export function ChatHistorySidebar({
  currentId,
  onSelect,
}: {
  currentId?: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const { data: conversations, isLoading } = useConversations();
  const { mutateAsync: create } = useCreateConversation();
  const { mutateAsync: deleteConv } = useDeleteConversation();

  const handleNew = async () => {
    try {
      const conv = await create({ title: "Nova Conversa" });
      onSelect(conv.id);
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute left-0 top-1/2 z-30 -translate-x-full -translate-y-1/2 rounded-l-md border border-r-0 border-border bg-surface/80 p-2 text-muted-foreground shadow-lg backdrop-blur hover:text-foreground hover:border-electric/50 transition-colors lg:hidden"
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      {/* For desktop, maybe a small button top right inside NeoChat header instead of outside. Or floating button like saved analyses. */}
      {/* We will render a button inside NeoChat header to open this, so we export an open method or use a generic button here. */}
      
      {/* Panel */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[320px] flex-col border-r border-border bg-surface shadow-2xl transition-transform duration-300 ease-in-out sm:w-[350px]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <MessageSquare className="h-4 w-4 text-electric" />
            Histórico de Chats
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <button
            onClick={handleNew}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-md bg-electric/10 px-4 py-2 text-sm font-medium text-electric hover:bg-electric/20 transition-colors"
          >
            <Plus className="h-4 w-4" /> Nova Conversa
          </button>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar histórico..."
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-4 text-sm focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric/30"
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-background/50 border border-border/50 animate-pulse" />
              ))}
            </div>
          ) : conversations?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <MessageSquare className="mb-3 h-8 w-8 opacity-20" />
              <p className="text-sm">Nenhum chat anterior.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations?.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelect(conv.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "group relative cursor-pointer overflow-hidden rounded-lg border p-3 transition-all",
                    currentId === conv.id
                      ? "border-electric/40 bg-electric/5"
                      : "border-border bg-background/60 hover:border-electric/40 hover:bg-surface"
                  )}
                >
                  <h3 className="font-medium text-sm text-foreground/90 pr-8 truncate">
                    {conv.title ?? "Conversa sem título"}
                  </h3>
                  
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(conv.updated_at).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConv(conv.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-danger/10 p-1.5 text-danger opacity-0 hover:bg-danger hover:text-white transition-all group-hover:opacity-100"
                    title="Apagar conversa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
