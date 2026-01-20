import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoClient"; // adjust if your file is elsewhere

// ✅ GET - fetch share data
export async function GET(req) {
  try {
    const db = await connectDB();
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
    }

    const data = await db.collection("shares").findOne({ pageId });
    return NextResponse.json(data || { shares: {}, totalShares: 0 });
  } catch (err) {
    console.error("GET /api/share error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ POST - increment share count
export async function POST(req) {
  try {
    const db = await connectDB();
    const { pageId, platform } = await req.json();

    if (!pageId || !platform) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const result = await db.collection("shares").findOneAndUpdate(
      { pageId },
      {
        $inc: {
          [`shares.${platform}`]: 1,
          totalShares: 1,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json(result.value);
  } catch (err) {
    console.error("POST /api/share error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
