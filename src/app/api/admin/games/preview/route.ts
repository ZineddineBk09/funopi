import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/adminAuth";
import { getSiteRows, getRatingStats } from "@/lib/ratings";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return unauthorized();
  }

  try {
    const { title, url } = await request.json();
    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required." },
        { status: 400 }
      );
    }

    const siteRows = await getSiteRows(title).catch(() => []);
    const stats = await getRatingStats(title, siteRows);

    const embed = await checkEmbedStatus(url);

    return NextResponse.json({ stats, embed });
  } catch (error) {
    console.error("Preview fetch failed:", error);
    return NextResponse.json(
      { error: "Unable to load preview." },
      { status: 500 }
    );
  }
}

async function checkEmbedStatus(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    return {
      ok: response.ok,
      status: `${response.status} ${response.statusText}`,
      xFrameOptions: response.headers.get("x-frame-options"),
      contentSecurityPolicy: response.headers.get("content-security-policy"),
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      xFrameOptions: null,
      contentSecurityPolicy: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

