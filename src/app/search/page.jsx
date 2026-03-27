// app/search/page.js (or app/series/page.js)

import { connectDB } from "@/lib/mongoClient";
import Advertize from "@/components/Advertize/Advertize";
import Search from "@/components/Search/Search";

export default async function SeriesPage({ searchParams }) {
  const q = searchParams.q || "";
  const creatorApiKey = searchParams.creator;

  /* ------------------ */
  /* CREATOR AD LOGIC */
  /* ------------------ */

  const DEFAULT_AD_LINK =
    "https://violentlinedexploit.com/ukqgqrv4n?key=acf2a1b713094b78ec1cc21761e9b149";

  let dynamicAdLink = DEFAULT_AD_LINK;

  if (creatorApiKey) {
    try {
      const db = await connectDB();
      const collection = db.collection("creators");

      const creatorData = await collection.findOne(
        { username: creatorApiKey },
        { projection: { adsterraSmartlink: 1, _id: 0 } }
      );

      if (creatorData?.adsterraSmartlink) {
        dynamicAdLink = creatorData.adsterraSmartlink;
      }
    } catch (error) {
      console.error(
        "MongoDB fetch failed for creator on search page:",
        creatorApiKey,
        error
      );
    }
  }

  /* ------------------ */
  /* API FETCH (FIXED) */
  /* ------------------ */

  const apiDomains = [
    "https://api.hentaio.pro",
    "https://api2.hentaio.pro",
    "https://api3.hentaio.pro",
  ];

  const encodedQ = encodeURIComponent(q);

  let data = null;

  for (const domain of apiDomains) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(
        `${domain}/api/search?q=${encodedQ}`,
        {
          signal: controller.signal,
          next: { revalidate: 300 },
        }
      );

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Failed on ${domain}`);
      }

      data = await res.json();
      break; // ✅ stop on first success
    } catch (err) {
      console.error("Search API failed:", domain, err.message);
    }
  }

  /* ------------------ */
  /* FAIL SAFE */
  /* ------------------ */

  if (!data) {
    return (
      <div style={{ color: "white", padding: "40px" }}>
        Failed to load search results. Try again later.
      </div>
    );
  }

  /* ------------------ */
  /* RENDER */
  /* ------------------ */

  return (
    <div className="page-wrapper">
      <Search data={data || []} keyword={q} creator={creatorApiKey} />
      <Advertize initialAdLink={dynamicAdLink} />
    </div>
  );
}