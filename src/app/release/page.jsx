// app/release/page.js (or app/series/page.js)

import { connectDB } from "@/lib/mongoClient";
import Advertize from "@/components/Advertize/Advertize";
import Release from "@/components/Release/Release";

export default async function SeriesPage({ searchParams }) {
  const page = searchParams.page || 1;
  const year = searchParams.year;
  const creatorApiKey = searchParams.creator;

  /* ------------------ */
  /* DYNAMIC AD LOGIC */
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
        "MongoDB fetch failed for creator:",
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

  let data = null;

  for (const domain of apiDomains) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(
        `${domain}/api/year?year=${year}&page=${page}`,
        {
          signal: controller.signal,
          next: { revalidate: 300 }, // cache 5 min
        }
      );

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Failed on ${domain}`);
      }

      data = await res.json();
      break; // ✅ stop on first success
    } catch (err) {
      console.error("API failed:", domain, err.message);
    }
  }

  /* ------------------ */
  /* FAIL SAFE */
  /* ------------------ */

  if (!data) {
    return (
      <div style={{ color: "white", padding: "40px" }}>
        Failed to load data. Please try again later.
      </div>
    );
  }

  /* ------------------ */
  /* RENDER */
  /* ------------------ */

  return (
    <div className="page-wrapper">
      <Release
        data={data || []}
        year={year}
        totalPages={data?.totalPages || 1}
        creator={creatorApiKey}
      />

      <Advertize initialAdLink={dynamicAdLink} />
    </div>
  );
}