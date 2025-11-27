import type { BoredSite } from "@/data/sites";
import { sites as fallbackSites } from "@/data/sites";
import { sheets, SHEET_ID } from "./googleSheets";

const RANGE = "Games!A:C";

export type SheetGameRecord = BoredSite & {
  rowNumber: number;
};

const normalizeRow = (row: string[] = []) => {
  const [title, url, description] = row;
  return {
    title: (title ?? "").trim() || "Untitled Experience",
    url: (url ?? "").trim(),
    description:
      (description ?? "").trim() ||
      "A surprise distraction from the Funopi vault.",
  };
};

async function fetchSheetRows(): Promise<SheetGameRecord[]> {
  if (!SHEET_ID) {
    throw new Error("Missing GOOGLE_SHEET_ID environment variable.");
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });

  const rows = response.data.values ?? [];
  const [, ...dataRows] = rows;

  return dataRows
    .map((row, index) => {
      const normalized = normalizeRow(row);
      return {
        rowNumber: index + 2,
        ...normalized,
      };
    })
    .filter((entry) => entry.url.length > 0);
}

export async function fetchSheetGameRecords(): Promise<SheetGameRecord[]> {
  return fetchSheetRows();
}

export async function appendSheetGame(game: BoredSite) {
  if (!SHEET_ID) {
    throw new Error("Missing GOOGLE_SHEET_ID environment variable.");
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[game.title, game.url, game.description]],
    },
  });
}

export async function updateSheetGame(rowNumber: number, game: BoredSite) {
  if (!SHEET_ID) {
    throw new Error("Missing GOOGLE_SHEET_ID environment variable.");
  }

  const range = `Games!A${rowNumber}:C${rowNumber}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[game.title, game.url, game.description]],
    },
  });
}

export async function deleteSheetGame(rowNumber: number) {
  if (!SHEET_ID) {
    throw new Error("Missing GOOGLE_SHEET_ID environment variable.");
  }

  const range = `Games!A${rowNumber}:C${rowNumber}`;
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range,
  });
}

export async function loadGamesWithFallback(): Promise<{
  sites: BoredSite[];
  source: "sheet" | "fallback";
}> {
  try {
    const sheetSites = await fetchSheetRows();
    if (sheetSites.length) {
      return {
        sites: sheetSites.map(({ title, url, description }) => ({
          title,
          url,
          description,
        })),
        source: "sheet",
      };
    }
  } catch (error) {
    console.error("Failed to load games from sheet:", error);
  }

  return { sites: fallbackSites, source: "fallback" };
}
