import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoClient";

const VIEWS_COLLECTION = "hanimeViews";
const LOGS_COLLECTION = "hanimeViewLogs";

/**
 * ------------------------------------------------------
 * POST: Increment view count (ANTI-SPAM SAFE)
 * Body: { contentKey }
 * ------------------------------------------------------
 */
export async function POST(request) {
  try {
    const { contentKey } = await request.json();

    if (!contentKey) {
      return NextResponse.json(
        { message: "Missing contentKey" },
        { status: 400 },
      );
    }

    const db = await connectDB();
    const viewsCol = db.collection(VIEWS_COLLECTION);
    const logsCol = db.collection(LOGS_COLLECTION);

    // Get client IP (Cloudflare / Vercel safe)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // 24 hour window
    const VIEW_TTL = 24 * 60 * 60 * 1000;

    const alreadyViewed = await logsCol.findOne({
      contentKey,
      ip,
      createdAt: { $gt: new Date(Date.now() - VIEW_TTL) },
    });

    // If already counted → return current views WITHOUT increment
    if (alreadyViewed) {
      const existing = await viewsCol.findOne(
        { contentKey },
        { projection: { views: 1, _id: 0 } },
      );

      return NextResponse.json({
        views: existing?.views || 0,
        counted: false,
      });
    }

    // Log this view
    await logsCol.insertOne({
      contentKey,
      ip,
      createdAt: new Date(),
    });

    // Increment views atomically
    const result = await viewsCol.findOneAndUpdate(
      { contentKey },
      { $inc: { views: 1 } },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    return NextResponse.json({
      views: result.value.views,
      counted: true,
    });
  } catch (error) {
    console.error("DB Error on POST view:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * ------------------------------------------------------
 * GET: Fetch current view count
 * Query: ?contentKey=...
 * ------------------------------------------------------
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const contentKey = searchParams.get("contentKey");

    if (!contentKey) {
      return NextResponse.json(
        { message: "Missing contentKey" },
        { status: 400 },
      );
    }

    const db = await connectDB();
    const viewsCol = db.collection(VIEWS_COLLECTION);

    const content = await viewsCol.findOne(
      { contentKey },
      { projection: { views: 1, _id: 0 } },
    );

    return NextResponse.json(
      { views: content?.views || 0 },
      { status: 200 },
    );
  } catch (error) {
    console.error("DB Error on GET views:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
