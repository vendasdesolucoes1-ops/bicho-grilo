import { useState } from "react";
import { FolderHeart, ChevronRight, Search, Activity, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { useAnalyses, useDeleteAnalysis } from "@/hooks/use-analyses";
import { cn } from "@/lib/utils";

export function SavedAnalysesSidebar() {
  const [open, setOpen] = useState(false);
  const { data: analyses, isLoading } = useAnalyses();
  const { mutateAsync: deleteAnalysis } = useDeleteAnalysis();

  return (
    <>
      {/* Sidebar trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-md border border-r-0 border-border bg-surface/80 p-2 text-muted-foreground shadow-lg backdrop-blur hover:text-foreground hover:border-electric/50 transition-colors"
      >
        <FolderHeart className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-screen w-[320px] flex-col border-l border-border bg-surface shadow-2xl transition-transform duration-300 ease-in-out sm:w-[380px]",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <FolderHeart className="h-4 w-4 text-electric" />
            Minhas Análises
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar análises..."
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-4 text-sm focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric/30"
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-lg bg-background/50 border border-border/50 animate-pulse" />
              ))}
            </div>
          ) : analyses?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <FolderHeart className="mb-3 h-8 w-8 opacity-20" />
              <p className="text-sm">Nenhuma análise salva.</p>
              <p className="mt-1 text-xs">Suas análises aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses?.map((analysis) => {
                const results = analysis.results as any;
                const score = results?.audit_score ?? 0;
                const classif = results?.classification ?? "Normal";
                const isAnomalous = classif === "Anômalo";
                const isWarning = classif === "Atenção";

                return (
                  <div
                    key={analysis.id}
                    className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-background/60 p-4 transition-all hover:border-electric/40 hover:bg-surface"
                  >
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <h3 className="font-medium leading-tight text-sm text-foreground/90">
                        {analysis.title}
                      </h3>
                      <span
                        className={cn(
                          "flex shrink-0 items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ticker",
                          isAnomalous
                            ? "bg-danger/15 text-danger"
                            : isWarning
                            ? "bg-warning/15 text-warning"
                            : "bg-neon/15 text-neon"
                        )}
                      >
                        {score}
                      </span>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2 text-[10px] uppercase text-muted-foreground">
                      <span className="flex items-center gap-1 rounded bg-surface-hover px-1.5 py-0.5">
                        <Activity className="h-3 w-3" /> {analysis.draws_count} Sorteios
                      </span>
                      <span className="flex items-center gap-1 rounded bg-surface-hover px-1.5 py-0.5">
                        <Clock className="h-3 w-3" /> {new Date(analysis.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    {/* Lógica de Delete no Hover */}
                    <div className="absolute bottom-2 right-2 flex translate-y-8 gap-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnalysis(analysis.id);
                        }}
                        className="rounded bg-danger/10 p-1.5 text-danger hover:bg-danger hover:text-white transition-colors"
                        title="Deletar análise"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
