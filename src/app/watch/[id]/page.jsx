// app/watch/[id]/page.js
import { connectDB } from "@/lib/mongoClient";
import Advertize from "@/components/Advertize/Advertize";
import WatchWrapper from "@/components/Watch/WatchWrapper";

// --- Safe fetch helper ---
async function safeFetchJSON(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();

    try {
      const data = JSON.parse(text);
      return data;
    } catch (e) {
      console.error(`Expected JSON from ${url}, got HTML or invalid JSON:`, text);
      return null;
    }
  } catch (err) {
    console.error(`Fetch failed for ${url}:`, err);
    return null;
  }
}

// --- Metadata generation ---
export async function generateMetadata({ params }) {
  function capitalizeWords(str) {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const formattedTitle = capitalizeWords(params.id);

  return {
    title: `Watch ${formattedTitle} Hentai Video Streams Online in 720p , 1080p HD - Henpro`,
    description: `Enjoy your unlimited hentai & anime collection. We are the definitive source for the best curated 720p / 1080p HD hentai videos, viewable by mobile phone and tablet, for free.`,
  };
}

// --- Main page component ---
export default async function Page({ params, searchParams }) {
  const id = params.id;
  const creatorApiKey = searchParams.creator;

  let watchData = null;
  let infoData = null;

  // --- Dynamic Ad Link ---
  const DEFAULT_AD_LINK =
    "https://www.effectivegatecpm.com/z67nn0nfnb?key=047c39737c61fbc71ce51ba3d9ff8923";
  let dynamicAdLink = DEFAULT_AD_LINK;

  if (creatorApiKey) {
    try {
      const db = await connectDB();
      const collection = db.collection("creators");
      const creatorData = await collection.findOne(
        { username: creatorApiKey },
        { projection: { adsterraSmartlink: 1, _id: 0 } }
      );
      if (creatorData?.adsterraSmartlink) dynamicAdLink = creatorData.adsterraSmartlink;
    } catch (err) {
      console.error("MongoDB fetch failed for creator:", creatorApiKey, err);
    }
  }

  // --- Fetch Watch & Info ---
  try {
    if (id.includes("episode")) {
      // Fetch watch data first
      const watchJson = await safeFetchJSON(`https://api.henpro.fun/api/watch?id=${id}`);
      if (watchJson?.success) watchData = watchJson.data;

      // Derive series ID
      const seriesId = watchData?.seriesId || id.replace(/-episode-.*/, "-id-01");
      const infoJson = await safeFetchJSON(`https://api.henpro.fun/api/info?id=${seriesId}`);
      if (infoJson?.success) infoData = infoJson.data;

    } else {
      // Fetch info first
      const infoJson = await safeFetchJSON(`https://api.henpro.fun/api/info?id=${id}`);
      if (infoJson?.success) infoData = infoJson.data;

      const firstEpisodeSlug = infoData?.episodes?.[0]?.slug;
      if (firstEpisodeSlug) {
        const watchJson = await safeFetchJSON(`https://api.henpro.fun/api/watch?id=${firstEpisodeSlug}`);
        if (watchJson?.success) watchData = watchJson.data;
      }
    }
  } catch (err) {
    console.error("Error fetching watch/info data:", err);
  }

  // --- Render fallback UI if no data ---
  if (!watchData && !infoData) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Video Unavailable</h1>
        <p className="text-gray-500">
          Sorry, we couldn’t load this video. Please try refreshing the page or check back later.
        </p>
      </div>
    );
  }

  return (
    <>
      <WatchWrapper watchData={watchData} infoData={infoData} id={id} creator={creatorApiKey} />
      <Advertize initialAdLink={dynamicAdLink} />
    </>
  );
}
