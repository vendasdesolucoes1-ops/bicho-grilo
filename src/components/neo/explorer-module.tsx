import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import type { Draw } from "@/lib/lottery-data";

interface ExplorerProps {
  draws: Draw[];
}

export function ExplorerModule({ draws }: ExplorerProps) {
  const [group, setGroup] = useState<string>("");
  const [lottery, setLottery] = useState<string>("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return draws
      .slice()
      .reverse()
      .filter((d) => {
        if (group && d.group !== Number(group)) return false;
        if (lottery && d.lottery !== lottery) return false;
        if (query && !`${d.id} ${d.state} ${d.lottery} ${d.group}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      })
      .slice(0, 500);
  }, [draws, group, lottery, query]);

  function exportCSV() {
    const header = "id,date,group,state,lottery,extraction\n";
    const body = filtered
      .map((d) => `${d.id},${d.date},${d.group},${d.state},${d.lottery},"${d.extraction}"`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "neo-quant-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Explorador de Dados</h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length.toLocaleString()} de {draws.length.toLocaleString()} sorteios
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 rounded bg-electric px-3 py-1.5 text-xs font-semibold text-electric-foreground hover:brightness-110"
        >
          <Download className="h-3 w-3" /> CSV
        </button>
      </header>

      <div className="flex flex-wrap gap-2 rounded-md border border-border bg-surface p-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar id, estado…"
            className="w-full rounded bg-background px-7 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-electric"
          />
        </div>
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="rounded bg-background px-2 py-1.5 text-xs"
        >
          <option value="">Todos grupos</option>
          {Array.from({ length: 25 }, (_, i) => i + 1).map((g) => (
            <option key={g} value={g}>
              Grupo {String(g).padStart(2, "0")}
            </option>
          ))}
        </select>
        <select
          value={lottery}
          onChange={(e) => setLottery(e.target.value)}
          className="rounded bg-background px-2 py-1.5 text-xs"
        >
          <option value="">Todas loterias</option>
          {["PT", "PTM", "PTV", "PTN", "Federal"].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border border-border bg-surface overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-surface-elevated">
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Grupo</th>
                <th className="px-3 py-2">Loteria</th>
                <th className="px-3 py-2">UF</th>
                <th className="px-3 py-2">Prêmio</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-border/50 ticker hover:bg-accent/40">
                  <td className="px-3 py-1.5">{d.id}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {new Date(d.date).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="rounded bg-electric/10 px-2 py-0.5 font-semibold text-electric">
                      {String(d.group).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">{d.lottery}</td>
                  <td className="px-3 py-1.5">{d.state}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{d.extraction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
