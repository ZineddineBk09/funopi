import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/adminAuth";
import { getAllRatingRows } from "@/lib/ratings";

const MAX_ROWS = 25;

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const site = searchParams.get("site");
  if (!site) {
    return NextResponse.json(
      { error: "Missing site parameter." },
      { status: 400 }
    );
  }

  try {
    const rows = await getAllRatingRows().catch(() => []);
    const filtered = rows
      .filter((row) => row[0] === site)
      .sort((a, b) => {
        const tsA = a[4] ?? "";
        const tsB = b[4] ?? "";
        return tsB.localeCompare(tsA);
      })
      .slice(0, MAX_ROWS);

    const ratings = filtered.map((row) => ({
      rating: Number(row[1]) || 0,
      userId: maskIdentifier(row[2]),
      userAgent: snippet(row[3]),
      timestamp: row[4] ?? null,
    }));

    return NextResponse.json({ ratings });
  } catch (error) {
    console.error("Failed to load rating details:", error);
    return NextResponse.json(
      { error: "Unable to load rating details." },
      { status: 500 }
    );
  }
}

function maskIdentifier(id?: string | null) {
  if (!id) return "—";
  if (id.length <= 4) return `${id[0]}***`;
  return `${id.slice(0, 4)}…${id.slice(-2)}`;
}

function snippet(value?: string | null) {
  if (!value) return "—";
  return value.length > 80 ? `${value.slice(0, 77)}…` : value;
}

