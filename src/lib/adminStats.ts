import { fetchSheetGameRecords } from "./games";
import { sites as fallbackSites } from "@/data/sites";
import { getAllRatingRows, RatingRow } from "./ratings";

export type TopRatedEntry = {
  title: string;
  average: number;
  count: number;
};

export type AdminStats = {
  totalGames: number;
  sheetGamesCount: number;
  fallbackGamesCount: number;
  ratingsCount: number;
  uniqueVisitors: number;
  topRated: TopRatedEntry[];
  lastUpdated: string;
};

function buildTopRated(rows: RatingRow[]): TopRatedEntry[] {
  const map = new Map<string, { sum: number; count: number }>();
  rows.forEach((row) => {
    const site = row[0];
    const rating = Number(row[1]);
    if (!site || Number.isNaN(rating)) return;
    const current = map.get(site) ?? { sum: 0, count: 0 };
    current.sum += rating;
    current.count += 1;
    map.set(site, current);
  });

  return Array.from(map.entries())
    .map(([title, { sum, count }]) => ({
      title,
      count,
      average: Number((sum / count).toFixed(2)),
    }))
    .filter((entry) => entry.count > 0)
    .sort(
      (a, b) =>
        b.average - a.average ||
        b.count - a.count ||
        a.title.localeCompare(b.title),
    )
    .slice(0, 5);
}

export async function buildAdminStats(): Promise<AdminStats> {
  const [sheetGames, ratingRows] = await Promise.all([
    fetchSheetGameRecords().catch(() => []),
    getAllRatingRows().catch(() => []),
  ]);

  const fallbackCount = fallbackSites.length;
  const activeGames = sheetGames.length > 0 ? sheetGames.length : fallbackCount;
  const uniqueVisitors = new Set(
    ratingRows.map((row) => row[2]).filter((id): id is string => Boolean(id)),
  ).size;

  return {
    totalGames: activeGames,
    sheetGamesCount: sheetGames.length,
    fallbackGamesCount: fallbackCount,
    ratingsCount: ratingRows.length,
    uniqueVisitors,
    topRated: buildTopRated(ratingRows),
    lastUpdated: new Date().toISOString(),
  };
}
