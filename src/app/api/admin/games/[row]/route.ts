import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/adminAuth";
import {
  deleteSheetGame,
  fetchSheetGameRecords,
  updateSheetGame,
} from "@/lib/games";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PUT(
  request: Request,
  { params }: { params: { row: string } },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) return unauthorized();

  const rowNumber = Number(params.row);
  if (!Number.isInteger(rowNumber) || rowNumber < 2) {
    return NextResponse.json({ error: "Invalid row number." }, { status: 400 });
  }

  try {
    const { title, url, description } = await request.json();
    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required." },
        { status: 400 },
      );
    }

    await updateSheetGame(rowNumber, {
      title: String(title),
      url: String(url),
      description: String(description ?? ""),
    });

    const games = await fetchSheetGameRecords();
    return NextResponse.json({ games });
  } catch (error) {
    console.error("Failed to update admin game:", error);
    return NextResponse.json(
      { error: "Unable to update game." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { row: string } },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) return unauthorized();

  const rowNumber = Number(params.row);
  if (!Number.isInteger(rowNumber) || rowNumber < 2) {
    return NextResponse.json({ error: "Invalid row number." }, { status: 400 });
  }

  try {
    await deleteSheetGame(rowNumber);
    const games = await fetchSheetGameRecords();
    return NextResponse.json({ games });
  } catch (error) {
    console.error("Failed to delete admin game:", error);
    return NextResponse.json(
      { error: "Unable to delete game." },
      { status: 500 },
    );
  }
}
