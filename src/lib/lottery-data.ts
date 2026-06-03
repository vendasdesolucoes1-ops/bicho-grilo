// Mock historical draws for the Jogo do Bicho-style 25-group system.
// Deterministic pseudo-random for reproducibility.

export const GROUPS = Array.from({ length: 25 }, (_, i) => i + 1);

export const ANIMALS: Record<number, string> = {
  1: "Avestruz", 2: "Águia", 3: "Burro", 4: "Borboleta", 5: "Cachorro",
  6: "Cabra", 7: "Carneiro", 8: "Camelo", 9: "Cobra", 10: "Coelho",
  11: "Cavalo", 12: "Elefante", 13: "Galo", 14: "Gato", 15: "Jacaré",
  16: "Leão", 17: "Macaco", 18: "Porco", 19: "Pavão", 20: "Peru",
  21: "Touro", 22: "Tigre", 23: "Urso", 24: "Veado", 25: "Vaca",
};

export type Draw = {
  id: string | number;
  date: string; // ISO
  group: number;
  state: string;
  lottery: string;
  extraction: string;
};

export type GroupStat = {
  group: number;
  animal: string;
  frequency: number;
  pct: number;
  delay: number; // draws since last appearance
  zScore: number;
  score: number; // 0-100
};

export function computeGroupStats(draws: Draw[]): GroupStat[] {
  const n = draws.length;
  const counts = new Map<number, number>();
  const lastSeen = new Map<number, number>();
  for (const g of GROUPS) counts.set(g, 0);

  draws.forEach((d, idx) => {
    counts.set(d.group, (counts.get(d.group) ?? 0) + 1);
    lastSeen.set(d.group, idx);
  });

  const expected = n / 25;
  const variance = expected * (24 / 25);
  const std = Math.sqrt(variance);

  return GROUPS.map((g) => {
    const f = counts.get(g) ?? 0;
    const last = lastSeen.get(g) ?? -1;
    const delay = last < 0 ? n : n - 1 - last;
    const z = std > 0 ? (f - expected) / std : 0;
    const score = isNaN(z) ? 50 : Math.max(0, Math.min(100, Math.round(50 + z * 20)));
    return {
      group: g,
      animal: ANIMALS[g],
      frequency: f,
      pct: n > 0 ? (f / n) * 100 : 0,
      delay,
      zScore: z,
      score,
    };
  });
}

export function chiSquare(stats: GroupStat[]): { value: number; df: number; pApprox: number } {
  const total = stats.reduce((s, x) => s + x.frequency, 0);
  const expected = total / 25;
  if (expected === 0) return { value: 0, df: 24, pApprox: 1 };
  
  const chi = stats.reduce((s, x) => s + Math.pow(x.frequency - expected, 2) / expected, 0);
  // Rough approximation of p-value via Wilson–Hilferty
  const df = 24;
  const z = Math.cbrt(chi / df) - (1 - 2 / (9 * df));
  const denom = Math.sqrt(2 / (9 * df));
  const zScore = z / denom;
  const p = 1 - normCdf(zScore);
  return { value: chi, df, pApprox: isNaN(p) ? 1 : p };
}

export function entropy(stats: GroupStat[]): number {
  const total = stats.reduce((s, x) => s + x.frequency, 0) || 1;
  let h = 0;
  for (const s of stats) {
    const p = s.frequency / total;
    if (p > 0) h -= p * Math.log2(p);
  }
  return h; // max log2(25) ~ 4.644
}

export function runsTest(draws: Draw[]): { runs: number; expected: number; z: number } {
  if (draws.length === 0) return { runs: 0, expected: 0, z: 0 };
  
  // Convert to above/below median group (12.5)
  const seq = draws.map((d) => (d.group > 12 ? 1 : 0));
  let runs = 1;
  for (let i = 1; i < seq.length; i++) if (seq[i] !== seq[i - 1]) runs++;
  const n1 = seq.filter((x) => x === 1).length;
  const n2 = seq.length - n1;
  
  if (n1 + n2 === 0) return { runs: 0, expected: 0, z: 0 };
  
  const expected = (2 * n1 * n2) / (n1 + n2) + 1;
  const variance =
    (2 * n1 * n2 * (2 * n1 * n2 - n1 - n2)) /
    (Math.pow(n1 + n2, 2) * (n1 + n2 - 1));
  const z = (runs - expected) / Math.sqrt(variance || 1);
  return { runs, expected, z: isNaN(z) ? 0 : z };
}

export function dispersionIndex(stats: GroupStat[]): number {
  const vals = stats.map((s) => s.frequency);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
  return mean > 0 ? variance / mean : 0;
}

function erf(x: number) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}
function normCdf(z: number) { return 0.5 * (1 + erf(z / Math.SQRT2)); }

export function randomnessScore(draws: Draw[], stats: GroupStat[]) {
  const chi = chiSquare(stats);
  const h = entropy(stats);
  const maxH = Math.log2(25);
  const runs = runsTest(draws);

  // Each subscore 0-100 (100 = perfectly random)
  const chiSub = Math.max(0, Math.min(100, 100 - Math.abs(chi.value - 24) * 2));
  const entSub = Math.max(0, Math.min(100, (h / maxH) * 100));
  const runsSub = Math.max(0, Math.min(100, 100 - Math.abs(runs.z) * 25));

  const score = Math.round((chiSub + entSub + runsSub) / 3);
  let classification: "Normal" | "Atenção" | "Anômalo" = "Normal";
  if (score < 50) classification = "Anômalo";
  else if (score < 75) classification = "Atenção";

  return { score, classification, chi, entropy: h, maxEntropy: maxH, runs };
}
