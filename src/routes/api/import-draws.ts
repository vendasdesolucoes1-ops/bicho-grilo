import { createFileRoute } from "@tanstack/react-router";
import { DrawsRepository, type DrawRecord } from "@/lib/repositories/draws.repository";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/api/import-draws")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Em um sistema real, exigimos autenticação antes do processamento.
          // Como estamos no Server, podemos injetar as validações na request.
          // await requireAuth(); 
          
          const body = await request.json();
          if (!body || !Array.isArray(body.draws)) {
            return new Response(JSON.stringify({ error: "Invalid payload. Expected { draws: [] }" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            });
          }

          const rawDraws = body.draws as any[];
          
          // Mapear e higienizar os dados antes da inserção
          const drawsToInsert: Omit<DrawRecord, "id" | "created_at">[] = rawDraws.map(d => ({
            lottery: String(d.lottery || "PT"),
            state: String(d.state || "RJ"),
            extraction: String(d.extraction || "1º Prêmio"),
            draw_date: new Date(d.date || d.draw_date).toISOString(),
            group: Number(d.group),
            animal: String(d.animal || ""),
            milhar: d.milhar ? String(d.milhar) : null,
            centena: d.centena ? String(d.centena) : null,
            dezena: d.dezena ? String(d.dezena) : null,
          }));

          // Quebrar em chunks para inserção massiva (ex: 5000 records por vez no Supabase)
          // Para este boilerplate inicial, usamos Bulk Insert direto do Repository.
          const success = await DrawsRepository.bulkInsertDraws(drawsToInsert);

          if (!success) {
            await DrawsRepository.logImport("API /api/import-draws", 0, "FAILED");
            return new Response(JSON.stringify({ error: "Failed to insert draws" }), {
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
          }

          // Registrar importação
          await DrawsRepository.logImport("API /api/import-draws", drawsToInsert.length, "SUCCESS");

          return new Response(JSON.stringify({ 
            success: true, 
            message: `Successfully imported ${drawsToInsert.length} draws.` 
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });

        } catch (err: any) {
          console.error("Import API Error:", err);
          return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});
