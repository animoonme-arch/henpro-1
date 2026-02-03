// app/series/page.js (or app/release/page.js, based on your routing)

// Assuming connectDB is set up in "@/lib/mongoClient"
import { connectDB } from "@/lib/mongoClient";
import Advertize from "@/components/Advertize/Advertize";
import Release from "@/components/Release/Release";

export default async function SeriesPage({ searchParams }) {
  const page = searchParams.page || 1;
  const year = searchParams.year;
  const creatorApiKey = searchParams.creator; // ✨ Get the creator API key

  // --- Start Dynamic Ad Link Logic ---
  const DEFAULT_AD_LINK =
    "https://www.effectivegatecpm.com/z67nn0nfnb?key=047c39737c61fbc71ce51ba3d9ff8923";
  let dynamicAdLink = DEFAULT_AD_LINK;

  if (creatorApiKey) {
    try {
      // 1. Connect to MongoDB
      const db = await connectDB();
      // Assuming your collection is named 'creators'
      const collection = db.collection("creators");

      // 2. Fetch the creator data
      const creatorData = await collection.findOne(
        { username: creatorApiKey },
        // Project to only include the smartlink for efficiency
        { projection: { adsterraSmartlink: 1, _id: 0 } }
      );

      // 3. Update the ad link if found
      if (creatorData && creatorData.adsterraSmartlink) {
        dynamicAdLink = creatorData.adsterraSmartlink;
      }
    } catch (error) {
      console.error("MongoDB fetch failed for creator:", creatorApiKey, error);
      // It will fall back to DEFAULT_AD_LINK
    }
  }
  // --- End Dynamic Ad Link Logic ---

  // --- Standard Data Fetch Logic ---
  const apiUrl = `https://api.henpro.fun/api/year?year=${year}&page=${page}`;

  const res = await fetch(apiUrl, {
    next: { revalidate: 300 }, // revalidate every 5 min
  });

  if (!res.ok) {
    throw new Error("Failed to fetch series by year");
  }

  const data = await res.json();
  // --- End Standard Data Fetch Logic ---

  return (
    <div className="page-wrapper">
      <Release
        data={data || []}
        year={year}
        totalPages={data?.totalPages || 1}
        creator={creatorApiKey}
      />
      {/* 🌟 Pass the dynamic ad link to the Advertize component */}
      {/* <Advertize initialAdLink={dynamicAdLink} /> */}
    </div>
  );
}
