export const CURRENCY = "GBP";

export type { NormalizedBalance } from "./providers/types.js";

export function parseMoney(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const cleaned = value.replace(/[£,\s]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: CURRENCY,
  }).format(amount);
}

export function savingsRate(salary: number, savings: number): number {
  if (salary <= 0) return 0;
  return savings / salary;
}

export function debtToAssetRatio(assets: number, debt: number): number {
  if (assets <= 0) return debt > 0 ? 1 : 0;
  return debt / assets;
}

export function overheadRatio(salary: number, overheads: number): number {
  if (salary <= 0) return 0;
  return overheads / salary;
}

export function netWorth(assets: number, badDebt: number): number {
  return assets - badDebt;
}

export function fuzzyMatchName(
  query: string,
  candidates: string[],
): { match: string | null; candidates: string[] } {
  const q = query.trim().toLowerCase();
  const exact = candidates.find((c) => c.toLowerCase() === q);
  if (exact) return { match: exact, candidates: [exact] };

  const partial = candidates.filter((c) => c.toLowerCase().includes(q));
  if (partial.length === 1) return { match: partial[0]!, candidates: partial };

  const reverse = candidates.filter((c) => q.includes(c.toLowerCase()));
  if (reverse.length === 1) return { match: reverse[0]!, candidates: reverse };

  return { match: null, candidates: [...new Set([...partial, ...reverse])] };
}
