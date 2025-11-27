import { NextResponse } from "next/server";
import {
  appendRating,
  getRatingDetails,
  getSiteRows,
  userHasRated,
} from "@/lib/ratings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const site = searchParams.get("site");
  const userId = searchParams.get("userId");

  if (!site) {
    return NextResponse.json(
      { error: "Missing site parameter." },
      { status: 400 }
    );
  }

  try {
    const stats = await getRatingDetails(site, userId);
    return NextResponse.json(stats, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET /api/ratings error", error);
    return NextResponse.json(
      { error: "Unable to fetch rating." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { site, rating, userId } = await request.json();

    if (!site || typeof site !== "string") {
      return NextResponse.json(
        { error: "Invalid site value." },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Missing user identifier." },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5." },
        { status: 400 }
      );
    }

    const siteRows = await getSiteRows(site);
    if (userHasRated(siteRows, userId)) {
      return NextResponse.json(
        { error: "You already rated this site.", userHasRated: true },
        { status: 409 }
      );
    }

    await appendRating({
      site,
      rating: numericRating,
      userId,
      userAgent: request.headers.get("user-agent"),
    });

    const stats = await getRatingDetails(site, userId);
    return NextResponse.json(stats, { status: 201 });
  } catch (error) {
    console.error("POST /api/ratings error", error);
    return NextResponse.json(
      { error: "Unable to save rating." },
      { status: 500 }
    );
  }
}

