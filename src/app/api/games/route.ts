import { NextResponse } from "next/server";
import { loadGamesWithFallback } from "@/lib/games";

export async function GET() {
  const payload = await loadGamesWithFallback();
  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}
