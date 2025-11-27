import { sheets, SHEET_ID } from "./googleSheets";

export type RatingStats = {
  average: number | null;
  count: number;
};

const RANGE = "UsersRatings!A:E";

export type RatingRow = [string, string, string?, string?, string?];

type AppendPayload = {
  site: string;
  rating: number;
  userId?: string | null;
  userAgent?: string | null;
};

async function fetchRatingRowsInternal(): Promise<RatingRow[]> {
  if (!SHEET_ID) {
    throw new Error("Missing GOOGLE_SHEET_ID environment variable.");
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });

  const rows = response.data.values ?? [];
  const [, ...dataRows] = rows;
  return dataRows as RatingRow[];
}

export async function getAllRatingRows(): Promise<RatingRow[]> {
  return fetchRatingRowsInternal();
}

function filterRowsBySite(rows: RatingRow[], site: string) {
  return rows.filter((row) => row[0] === site);
}

function calculateStats(rows: RatingRow[]): RatingStats {
  const ratings = rows
    .map((row) => Number(row[1]))
    .filter((value) => !Number.isNaN(value));

  if (!ratings.length) {
    return { average: null, count: 0 };
  }

  const sum = ratings.reduce((total, value) => total + value, 0);
  return {
    average: Number((sum / ratings.length).toFixed(2)),
    count: ratings.length,
  };
}

export function userHasRated(rows: RatingRow[], userId?: string | null) {
  if (!userId) return false;
  return rows.some((row) => row[2] === userId);
}

export async function getSiteRows(site: string) {
  const rows = await fetchRatingRowsInternal();
  return filterRowsBySite(rows, site);
}

export async function appendRating({
  site,
  rating,
  userId,
  userAgent,
}: AppendPayload) {
  if (!SHEET_ID) {
    throw new Error("Missing GOOGLE_SHEET_ID environment variable.");
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [site, rating, userId ?? "", userAgent ?? "", new Date().toISOString()],
      ],
    },
  });
}

export async function getRatingStats(
  site: string,
  rows?: RatingRow[],
): Promise<RatingStats> {
  if (rows) {
    return calculateStats(rows);
  }

  const siteRows = await getSiteRows(site);
  return calculateStats(siteRows);
}

export type RatingDetails = RatingStats & {
  userHasRated: boolean;
};

export async function getRatingDetails(
  site: string,
  userId?: string | null,
): Promise<RatingDetails> {
  const siteRows = await getSiteRows(site);
  return {
    ...(await getRatingStats(site, siteRows)),
    userHasRated: userHasRated(siteRows, userId),
  };
}
