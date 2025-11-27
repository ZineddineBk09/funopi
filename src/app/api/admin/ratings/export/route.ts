import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/adminAuth";
import { getAllRatingRows } from "@/lib/ratings";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await getAllRatingRows().catch(() => []);
    const header = "Site,Rating,VisitorId,UserAgent,Timestamp\n";
    const body = rows
      .map((row) =>
        [row[0], row[1], row[2], row[3], row[4]].map(csvEscape).join(","),
      )
      .join("\n");

    const csv = header + body;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="ratings-export-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to export ratings:", error);
    return NextResponse.json(
      { error: "Unable to export ratings." },
      { status: 500 },
    );
  }
}

function csvEscape(value?: string | number | null) {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}
