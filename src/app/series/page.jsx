// app/series/page.js (or app/page.js, based on your structure)

// Assuming connectDB is set up in "@/lib/mongoClient"
import { connectDB } from "@/lib/mongoClient";
import Advertize from "@/components/Advertize/Advertize";
// import Navbar from "@/components/Navbar/Navbar"; // Kept since it's in the original import list
import Series from "@/components/Series/Series";

export default async function SeriesPage({ searchParams }) {
  const page = searchParams.page || 1;
  const creatorApiKey = searchParams.creator; // ✨ Get the creator API key

  // --- Start Dynamic Ad Link Logic ---
  const DEFAULT_AD_LINK =
    "https://violentlinedexploit.com/ukqgqrv4n?key=acf2a1b713094b78ec1cc21761e9b149";
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
        // Project to only include the smartlink
        { projection: { adsterraSmartlink: 1, _id: 0 } }
      );

      // 3. Update the ad link if found
      if (creatorData && creatorData.adsterraSmartlink) {
        dynamicAdLink = creatorData.adsterraSmartlink;
      }
    } catch (error) {
      console.error(
        "MongoDB fetch failed for creator on main series page:",
        creatorApiKey,
        error
      );
      // Fallback to DEFAULT_AD_LINK
    }
  }
  // --- End Dynamic Ad Link Logic ---

  // --- Standard Series Data Fetch Logic ---
    const apiDomains = [
    "https://api.henpro.fun",
    "https://api2.henpro.fun",
    "https://api3.henpro.fun",
  ];

  const randomDomain =
    apiDomains[Math.floor(Math.random() * apiDomains.length)];
  const apiUrl = `${randomDomain}/api/series?page=${page}`;

  const res = await fetch(apiUrl, {
    next: { revalidate: 300 }, // revalidate every 5 min
  });

  if (!res.ok) {
    throw new Error("Failed to fetch series");
  }

  const data = await res.json();
  // --- End Standard Series Data Fetch Logic ---

  return (
    <div className="page-wrapper">
      <Series data={data || []} totalPages={data?.totalPages || 1} creator={creatorApiKey}/>
      {/* 🌟 Pass the dynamic ad link to the Advertize component */}
      <Advertize initialAdLink={dynamicAdLink} />
    </div>
  );
}
