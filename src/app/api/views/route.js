// /app/api/views/route.js (ADD THE GET METHOD)

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoClient";

const CONTENT_COLLECTION_NAME = "hanimeViews"; // Assuming you have a collection for content metadata

// --- POST METHOD (Increment View) ---
export async function POST(request) {
  // ... (Your existing POST logic to increment views)
  const { contentKey } = await request.json();

  if (!contentKey) {
    return NextResponse.json(
      { message: "Missing contentKey" },
      { status: 400 },
    );
  }

  try {
    const db = await connectDB();
    const collection = db.collection(CONTENT_COLLECTION_NAME);

    await collection.updateOne(
      { contentKey: contentKey },
      { $inc: { views: 1 } },
      { upsert: true },
    );

    // It's good practice to fetch the new count after incrementing
    const updatedContent = await collection.findOne(
      { contentKey: contentKey },
      { projection: { views: 1, _id: 0 } },
    );

    return NextResponse.json(
      {
        message: "View recorded successfully",
        views: updatedContent?.views || 1, // Return the updated count immediately
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DB Error on POST view:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// --- 🔑 NEW: GET METHOD (Retrieve Current View Count) ---
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const contentKey = searchParams.get("contentKey");

  if (!contentKey) {
    return NextResponse.json(
      { message: "Missing contentKey" },
      { status: 400 },
    );
  }

  try {
    const db = await connectDB();
    const collection = db.collection(CONTENT_COLLECTION_NAME);

    const content = await collection.findOne(
      { contentKey: contentKey },
      { projection: { views: 1, _id: 0 } }, // Only retrieve the views field
    );

    // Return the views count, defaulting to 0 if not found
    return NextResponse.json({ views: content?.views || 0 }, { status: 200 });
  } catch (error) {
    console.error("DB Error on GET views:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
