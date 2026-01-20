import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoClient";

const COLLECTION_NAME = "watchProgress";

/**
 * GET: Fetches the full list of watch progress for the current user.
 * This endpoint is used by the 'Continue Watching' component.
 * It assumes all necessary display metadata (title, poster, totalDuration)
 * are stored directly on the watchProgress document via the POST route.
 */
export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  // 1. Authorization check
  if (!session?.user) {
    // Return 401 Unauthorized if the user is not logged in.
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await connectDB();

    // 2. Fetch all progress documents for the authenticated user
    // Sort by 'updatedAt' descending to show the most recently watched first.
    const progressList = await db
      .collection(COLLECTION_NAME)
      .find({
        userId: session.user.id,
      })
      .sort({ updatedAt: -1 }) // Sort by last updated time
      .toArray();

    // 3. Clean up data for the client
    // Ensure all documents have the necessary fields for the client-side progress calculation
    const adaptedList = progressList.map(item => ({
        contentKey: item.contentKey,
        userId: item.userId, // Although not needed by the client, good for debugging
        currentTime: item.currentTime || 0,
        // Crucial fields for client-side progress bar and display:
        totalDuration: item.totalDuration || 0, // **MUST** be present for progress bar
        title: item.title || 'Unknown Title',
        poster: item.poster || 'placeholder.jpg',
        parentContentId: item.parentContentId || null,
        episodeNo: item.episodeNo,
        // The client-side adapter in ContinueWatching.jsx will calculate percentage
        // based on these two fields.
    }));
    
    // Successfully return the list of items
    return NextResponse.json(adaptedList);

  } catch (error) {
    console.error("DB Error on GET progress list:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
