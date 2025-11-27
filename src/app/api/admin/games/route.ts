import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/adminAuth";
import { appendSheetGame, fetchSheetGameRecords } from "@/lib/games";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) return unauthorized();

  try {
    const games = await fetchSheetGameRecords();
    return NextResponse.json({ games });
  } catch (error) {
    console.error("Failed to fetch admin games:", error);
    return NextResponse.json(
      { error: "Unable to load games." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) return unauthorized();

  try {
    const { title, url, description } = await request.json();
    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required." },
        { status: 400 },
      );
    }

    await appendSheetGame({
      title: String(title),
      url: String(url),
      description: String(description ?? ""),
    });

    const games = await fetchSheetGameRecords();
    return NextResponse.json({ games }, { status: 201 });
  } catch (error) {
    console.error("Failed to create admin game:", error);
    return NextResponse.json(
      { error: "Unable to save game." },
      { status: 500 },
    );
  }
}
