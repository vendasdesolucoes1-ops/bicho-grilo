import { supabase } from "@/integrations/supabase/client";

export interface DrawRecord {
  id: string;
  lottery: string;
  state: string;
  extraction: string;
  draw_date: string;
  group: number;
  animal: string;
  milhar: string | null;
  centena: string | null;
  dezena: string | null;
  created_at: string;
}

export interface ImportLog {
  id: string;
  source: string;
  records_imported: number;
  status: string;
  created_at: string;
}

export class DrawsRepository {
  /**
   * Retrieves draws from the 'neo.draws' table with optional limits.
   */
  static async getDraws(limit = 2000): Promise<DrawRecord[]> {
    const { data, error } = await supabase
      .schema("neo")
      .from("draws")
      .select("*")
      .order("draw_date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to fetch draws:", error);
      throw new Error(error.message);
    }
    return data as DrawRecord[];
  }

  /**
   * Bulk insert for draw records.
   */
  static async bulkInsertDraws(draws: Omit<DrawRecord, "id" | "created_at">[]): Promise<boolean> {
    const { error } = await supabase
      .schema("neo")
      .from("draws")
      .insert(draws);

    if (error) {
      console.error("Bulk insert draws error:", error);
      return false;
    }
    return true;
  }

  /**
   * Logs an import operation.
   */
  static async logImport(source: string, recordsImported: number, status: string): Promise<void> {
    const { error } = await supabase
      .schema("neo")
      .from("import_logs")
      .insert([{ source, records_imported: recordsImported, status }]);

    if (error) {
      console.error("Failed to log import:", error);
    }
  }
}
