import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoClient";

const COLLECTION_NAME = "watchProgress";

/**
 * GET: Fetches watch progress for a video.
 * Query: ?contentKey=<video-id>
 */
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const contentKey = searchParams.get("contentKey");

  if (!contentKey) {
    return NextResponse.json(
      { message: "Missing contentKey" },
      { status: 400 }
    );
  }

  try {
    const db = await connectDB();
    const progress = await db.collection(COLLECTION_NAME).findOne({
      userId: session.user.id,
      contentKey: contentKey,
    });

    // Successfully return the watch progress data, including the totalDuration
    return NextResponse.json({
      currentTime: progress?.currentTime || 0,
      totalDuration: progress?.totalDuration || 0,
      title: progress?.title || null,
      poster: progress?.poster || null,
      parentContentId: progress?.parentContentId || null,
      episodeNo: progress?.episodeNo,
    });
  } catch (error) {
    console.error("DB Error on GET progress:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST: Saves/Updates watch progress and metadata.
 * Body: { contentKey, currentTime, totalDuration, title, poster, parentContentId }
 */
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const {
    contentKey,
    currentTime,
    totalDuration, // Destructure the new field
    title,
    poster,
    parentContentId,
    episodeNo,
  } = await request.json();

  // Validate all required fields, including totalDuration
  if (
    !contentKey ||
    currentTime === undefined ||
    totalDuration === undefined ||
    !title ||
    !poster
  ) {
    return NextResponse.json(
      {
        message:
          "Missing required metadata (contentKey, currentTime, totalDuration, title, poster)",
      },
      { status: 400 }
    );
  }

  try {
    const db = await connectDB();

    const updateData = {
      currentTime: Number(currentTime),
      totalDuration: Number(totalDuration), // Save duration to the database
      title: title,
      poster: poster,
      parentContentId: parentContentId || null,
      episodeNo: episodeNo,
      updatedAt: new Date(),
    };

    await db
      .collection(COLLECTION_NAME)
      .updateOne(
        { userId: session.user.id, contentKey: contentKey },
        { $set: updateData },
        { upsert: true }
      );

    return NextResponse.json({ message: "Progress saved successfully" });
  } catch (error) {
    console.error("DB Error on POST progress:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Clears progress.
 * Body: { contentKey }
 */
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { contentKey } = await request.json();

  if (!contentKey) {
    return NextResponse.json(
      { message: "Missing contentKey" },
      { status: 400 }
    );
  }

  try {
    const db = await connectDB();
    await db.collection(COLLECTION_NAME).deleteOne({
      userId: session.user.id,
      contentKey: contentKey,
    });

    return NextResponse.json({ message: "Progress cleared successfully" });
  } catch (error) {
    console.error("DB Error on DELETE progress:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
