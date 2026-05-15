// Parse a comma-separated id list from a URL query value.
// Rejects non-strings, non-integers, zero and negatives.
export function csvToIds(v: unknown): number[] {
  if (typeof v !== "string" || !v) return [];
  return v
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
}
