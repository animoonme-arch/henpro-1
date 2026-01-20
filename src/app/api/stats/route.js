import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoClient";
import dayjs from "dayjs"; // npm install dayjs

const CREATOR_COLLECTION = "creators";
const ADSTERRA_STATS_URL =
  "https://api3.adsterratools.com/publisher/stats.json";

/**
 * GET handler: Fetches Adsterra stats using creator's API key
 * BUT if username === "Sandeep" then override with:
 * placement_id = 25912166
 * api token = f7becce758687baa0a1fd8e200e2d4e4
 */
export async function GET(request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const username = session?.user?.username;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await connectDB();

    // Retrieve stored details
    const creator = await db
      .collection(CREATOR_COLLECTION)
      .findOne({ userId: userId }, { projection: { _id: 0, creatorApiKey: 1, placementId: 1 } });

    let apiKey = creator?.creatorApiKey;
    let placementId = creator?.placementId;

    // *****************************
    //    SPECIAL OVERRIDE FOR SANDEEP
    // *****************************
    if (username === "Sandeep") {                                      
      apiKey = "f7becce758687baa0a1fd8e200e2d4e4";
      placementId = 25912166;
    }

    if (!apiKey) { 
      return NextResponse.json(
        { message: "API Key missing. Complete monetization setup." },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = new URLSearchParams();

    // Default dates
    const startDate =
      searchParams.get("start_date") ||
      dayjs().subtract(6, "day").format("YYYY-MM-DD");
    const finishDate =
      searchParams.get("finish_date") || dayjs().format("YYYY-MM-DD");

    query.append("start_date", startDate);
    query.append("finish_date", finishDate);

    // Group by
    const groupBy =
      searchParams.getAll("group_by").length > 0
        ? searchParams.getAll("group_by")
        : ["date"];

    groupBy.forEach((g) => query.append("group_by[]", g));

    // Inject the placement ID (smart link)
    query.append("placement_ids[]", placementId);

    // Optional filters
    ["country", "domain"].forEach((param) => {
      if (searchParams.has(param)) {
        searchParams
          .getAll(param)
          .forEach((val) => query.append(param + "[]", val));
      }
    });

    const fetchUrl = `${ADSTERRA_STATS_URL}?${query.toString()}`;

    const adsterraResponse = await fetch(fetchUrl, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await adsterraResponse.json();

    if (adsterraResponse.ok) {
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json(data, { status: adsterraResponse.status });
    }
  } catch (err) {
    console.error("Internal Server Error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
