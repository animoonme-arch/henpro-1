import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoClient";

const COLLECTION_NAME = "hanimelists";
const ITEMS_PER_PAGE = 12; // Define how many items per page

const VALID_STATUSES = [
  "Watching",
  "On-Hold",
  "Plan to Watch",
  "Dropped",
  "Completed",
];

/**
 * GET: Fetch a user's watchlist with pagination and optional status filter
 * Query: ?page=<number>&type=<status>
 */
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    // Return an empty list for unauthorized users instead of 401
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("type");
  const pageParam = searchParams.get("page");

  const page = parseInt(pageParam) || 1;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Build the MongoDB query filter
  const filter = { userId: session.user.id };
  if (statusFilter && VALID_STATUSES.includes(statusFilter)) {
    filter.status = statusFilter;
  }

  try {
    const db = await connectDB();
    const collection = db.collection(COLLECTION_NAME);

    // 1. Get the total count of items matching the filter
    const totalItems = await collection.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // 2. Fetch the paginated data
    // Sort by 'updatedAt' descending to show recently updated items first
    const items = await collection
      .find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .toArray();

    // 3. Return the structured response
    return NextResponse.json({
      data: items,
      page,
      totalPages,
      total: totalItems,
      perPage: ITEMS_PER_PAGE,
    });
  } catch (error) {
    console.error("DB Error on GET watchlist:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST: Add or update an item in the user's watchlist
 * Body: { contentId, status, title, poster, contentKey, episodeNo, episodeTitle, totalDuration }
 */
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const {
    contentId,
    status,
    title,
    poster,
    contentKey,
    episodeNo,
    episodeTitle,
    totalDuration,
  } = await request.json();

  if (!contentId) {
    return NextResponse.json(
      { message: "Missing contentId" },
      { status: 400 }
    );
  }

  if (status !== null && !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { message: "Invalid watchlist status" },
      { status: 400 }
    );
  }

  try {
    const db = await connectDB();
    const collection = db.collection(COLLECTION_NAME);

    if (status === null) {
      await collection.deleteOne({ userId: session.user.id, contentId });
      return NextResponse.json({
        message: "Item removed successfully",
        status: null,
      });
    } else {
      const filter = { userId: session.user.id, contentId };
      const updateDoc = {
        $set: {
          status,
          title,
          poster,
          lastEpisodeKey: contentKey,
          lastEpisodeNo: episodeNo,
          lastEpisodeTitle: episodeTitle,
          totalDuration,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      };

      await collection.updateOne(filter, updateDoc, { upsert: true });

      return NextResponse.json({
        message: "Watchlist updated successfully",
        status,
      });
    }
  } catch (error) {
    console.error("DB Error on POST watchlist:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove an item from the watchlist
 * Body: { contentId }
 */
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { contentId } = await request.json();

  if (!contentId) {
    return NextResponse.json(
      { message: "Missing contentId" },
      { status: 400 }
    );
  }

  try {
    const db = await connectDB();
    await db.collection(COLLECTION_NAME).deleteOne({
      userId: session.user.id,
      contentId,
    });

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("DB Error on DELETE watchlist:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}