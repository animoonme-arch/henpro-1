// app/series/page.js  (or app/search/page.js)

import { connectDB } from "@/lib/mongoClient";
import Advertize from "@/components/Advertize/Advertize";
import Search from "@/components/Search/Search";

export default async function SeriesPage({ searchParams }) {
  const q = searchParams.q || "";
  const creatorApiKey = searchParams.creator;

  /* ---------- Dynamic Ad Logic ---------- */

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

  /* ---------- Search Logic ---------- */

  const encodedQ = encodeURIComponent(q);

  const apiDomains = [
    "https://api.henpro.fun",
    "https://api2.henpro.fun",
    "https://api3.henpro.fun",
  ];

  const randomDomain =
    apiDomains[Math.floor(Math.random() * apiDomains.length)];

  const hanimeURL = `${randomDomain}/api/hanime-search?q=${encodedQ}`;
  const specialURL = `${randomDomain}/api/special-search?q=${encodedQ}`;

  let data = { results: [] };

  try {
    const [hanimeRes, specialRes] = await Promise.allSettled([
      fetch(hanimeURL, { next: { revalidate: 300 } }),
      fetch(specialURL, { next: { revalidate: 300 } }),
    ]);

    let hanimeResults = [];
    let specialResults = [];

    /* ---------- Hanime Results ---------- */

    if (hanimeRes.status === "fulfilled" && hanimeRes.value.ok) {
      const hanimeData = await hanimeRes.value.json();

      hanimeResults = (hanimeData.data || []).map((item) => ({
        id: item.id || item.slug,
        title: item.title,
        url: item.url,
        img: item.img || item.thumbnail,
        date: item.date || null,
        source: "hanime",
      }));
    }

    /* ---------- Special Results ---------- */

    if (specialRes.status === "fulfilled" && specialRes.value.ok) {
      const specialData = await specialRes.value.json();

      specialResults = (specialData.data || []).map((item) => ({
        id: item.slug,
        title: item.title,
        url: item.url,
        img: item.thumbnail,
        date: item.uploadDate || null,
        source: "special",
      }));
    }

    /* ---------- Balanced Distribution ---------- */

    let combinedResults = [];

    if (hanimeResults.length >= 3 && specialResults.length >= 2) {
      combinedResults = [
        ...hanimeResults.slice(0, 3),
        ...specialResults.slice(0, 2),
      ];
    } else if (hanimeResults.length >= 2 && specialResults.length >= 3) {
      combinedResults = [
        ...hanimeResults.slice(0, 2),
        ...specialResults.slice(0, 3),
      ];
    } else if (hanimeResults.length > 0 && specialResults.length > 0) {
      combinedResults = [...hanimeResults, ...specialResults].slice(0, 5);
    } else if (hanimeResults.length > 0) {
      combinedResults = hanimeResults.slice(0, 5);
    } else {
      combinedResults = specialResults.slice(0, 5);
    }

    data = {
      results: combinedResults,
    };
  } catch (err) {
    console.error("Search fetch error:", err);
  }

  /* ---------- Render ---------- */

  return (
    <div className="page-wrapper">
      <Search data={data || []} keyword={q} creator={creatorApiKey} />

      <Advertize initialAdLink={dynamicAdLink} />
    </div>
  );
}