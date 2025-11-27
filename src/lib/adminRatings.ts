import { getAllRatingRows, RatingRow } from "./ratings";

export type SiteRatingSummary = {
  title: string;
  average: number | null;
  count: number;
  lastRatingAt: string | null;
};

function buildSummaries(rows: RatingRow[]): SiteRatingSummary[] {
  const map = new Map<
    string,
    { sum: number; count: number; lastRatingAt: string | null }
  >();

  rows.forEach((row) => {
    const [title, rating, , , timestamp] = row;
    const numericRating = Number(rating);
    if (!title || Number.isNaN(numericRating)) return;
    const current = map.get(title) ?? {
      sum: 0,
      count: 0,
      lastRatingAt: null as string | null,
    };
    current.sum += numericRating;
    current.count += 1;
    if (timestamp) {
      if (!current.lastRatingAt || timestamp > current.lastRatingAt) {
        current.lastRatingAt = timestamp;
      }
    }
    map.set(title, current);
  });

  return Array.from(map.entries()).map(([title, info]) => ({
    title,
    count: info.count,
    average:
      info.count > 0 ? Number((info.sum / info.count).toFixed(2)) : null,
    lastRatingAt: info.lastRatingAt ?? null,
  }));
}

export async function buildSiteRatingSummaries(): Promise<SiteRatingSummary[]> {
  const rows = await getAllRatingRows().catch(() => []);
  return buildSummaries(rows).sort(
    (a, b) =>
      (b.average ?? 0) - (a.average ?? 0) ||
      b.count - a.count ||
      (b.lastRatingAt ?? "").localeCompare(a.lastRatingAt ?? "")
  );
}

