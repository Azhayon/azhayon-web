import type { MyRating } from "@/lib/api-types";

export function formatRatingSummary(average: number, count: number): string {
  if (!Number.isFinite(average) || !Number.isInteger(count) || count < 1) {
    return "No ratings yet";
  }

  return `${average.toFixed(1)} out of 5 (${count} ${count === 1 ? "rating" : "ratings"})`;
}

/** Whether star number `n` is drawn filled: up to the hovered star, or else up to the saved score. */
export function starFilled(n: number, hover: number | null, score: number | null): boolean {
  return n <= (hover ?? score ?? 0);
}

/** Reads the answer of /api/rating/[slug]. Null when signed out, missing or not in the shape we know. */
export function parseMyRating(json: unknown): MyRating | null {
  if (typeof json !== "object" || json === null) {
    return null;
  }

  const rating = (json as { rating?: unknown }).rating;

  if (typeof rating !== "object" || rating === null) {
    return null;
  }

  const { score, average, count } = rating as Record<string, unknown>;

  const scoreOk = score === null || (typeof score === "number" && Number.isInteger(score) && score >= 1 && score <= 5);
  const averageOk = typeof average === "number" && Number.isFinite(average) && average >= 0 && average <= 5;
  const countOk = typeof count === "number" && Number.isInteger(count) && count >= 0;

  return scoreOk && averageOk && countOk ? { score: score as number | null, average, count } : null;
}