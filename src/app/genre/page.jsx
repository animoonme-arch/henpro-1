// app/series/page.js

import Advertize from "@/components/Advertize/Advertize";
import Genre from "@/components/Genre/Genre";
import { connectDB } from "@/lib/mongoClient"; // ✨ Import the DB connection utility

export default async function SeriesPage({ searchParams }) {
  const page = searchParams.page || 1;
  const genre = searchParams.genre;
  const creatorApiKey = searchParams.creator; // Get the creator API key

  // --- Start Creator Ad Link Logic ---
  const DEFAULT_AD_LINK =
    "https://capriceawelessaweless.com/ea/1c/79/ea1c798183baca79e1812cf43c17e87e.js";
  let dynamicAdLink = DEFAULT_AD_LINK;

  if (creatorApiKey) {
    let client;
    try {
      // 1. Connect to MongoDB
      const db = await connectDB();
      const collection = db.collection("creators");

      // 2. Fetch the creator data using the creatorApiKey
      // Note: No need for a separate fetch() call, we query the DB directly.
      const creatorData = await collection.findOne(
        { username: creatorApiKey },
        { projection: { adsterraSmartlink: 1, _id: 0 } } // Only retrieve the smartlink
      );

      // 3. Update the ad link if found
      if (creatorData && creatorData.adsterraSmartlink) {
        dynamicAdLink = creatorData.adsterraSmartlink;
      }
    } catch (error) {
      console.error("MongoDB fetch failed for creator:", creatorApiKey, error);
      // Fallback to default link
    }
    // No need to explicitly close the connection when using the module-scoped client pattern
  }
  // --- End Creator Ad Link Logic ---

  // --- Start Genre Data Fetch Logic ---
  const apiUrl = `https://api.henpro.fun/api/genre?genre=${genre}&page=${page}`;

  const res = await fetch(apiUrl, {
    next: { revalidate: 300 }, // revalidate every 5 min
  });

  if (!res.ok) {
    // Note: You might want to log the fetch error or handle it more gracefully
    throw new Error("Failed to fetch series");
  }

  const data = await res.json();
  // --- End Genre Data Fetch Logic ---

  return (
    <div className="page-wrapper">
      <Genre
        data={data || []}
        genre={genre}
        totalPages={data?.totalPages || 1}
        creator={creatorApiKey}
      />
      <Advertize initialAdLink={dynamicAdLink} />{" "}
      {/* Pass the link to the client component */}
    </div>
  );
}
