import { connectDB } from "@/lib/mongoClient";
import Advertize from "@/components/Advertize/Advertize";
import WatchWrapper from "@/components/Watch/WatchWrapper";

/* ---------------- SAFE FETCH ---------------- */
async function safeFetchJSON(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    return JSON.parse(text);
  } catch (err) {
    console.error("safeFetchJSON failed:", url, err);
    return null;
  }
}

/* ---------------- MONGO EPISODE STREAM ---------------- */
async function getEpisodeStreamFromDB(episodeId) {
  // 🔒 HARD GUARD
  if (!episodeId || !episodeId.includes("episode")) return null;

  try {
    const db = await connectDB();
    const episode = await db.collection("episodes").findOne(
      { episodeId }, // ← EXACT MATCH with your DB
      {
        projection: {
          _id: 0,
          videoUrl: 1,
          iframeSrc: 1,
          downloadUrl: 1,
        },
      }
    );

    return episode || null;
  } catch (err) {
    console.error("Mongo episode fetch failed:", err);
    return null;
  }
}

/* ---------------- METADATA ---------------- */
export async function generateMetadata({ params }) {
  const title = params.id
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `Watch ${title} Hentai Video Streams Online in 720p, 1080p HD - Henpro`,
    description:
      "Enjoy your unlimited hentai & anime collection. Stream high quality 720p / 1080p HD hentai videos for free.",
  };
}

/* ---------------- PAGE ---------------- */
export default async function Page({ params, searchParams }) {
  const id = params.id;
  const creatorApiKey = searchParams.creator;

  let watchData = null;
  let infoData = null;

  /* -------- AD LINK -------- */
  const DEFAULT_AD_LINK =
    "https://www.effectivegatecpm.com/z67nn0nfnb?key=047c39737c61fbc71ce51ba3d9ff8923";
  let dynamicAdLink = DEFAULT_AD_LINK;

  if (creatorApiKey) {
    try {
      const db = await connectDB();
      const creator = await db.collection("creators").findOne(
        { username: creatorApiKey },
        { projection: { adsterraSmartlink: 1, _id: 0 } }
      );

      if (creator?.adsterraSmartlink) {
        dynamicAdLink = creator.adsterraSmartlink;
      }
    } catch (err) {
      console.error("Creator lookup failed:", err);
    }
  }

  /* -------- DATA FETCH -------- */
  try {
    if (id.includes("episode")) {
      /* ----- WATCH API ----- */
      const watchJson = await safeFetchJSON(
        `https://api.henpro.fun/api/watch?id=${id}`
      );

      if (watchJson?.success) watchData = watchJson.data;

      /* ----- PATCH STREAM FROM MONGO ----- */
      const mongoEpisode = await getEpisodeStreamFromDB(id);

      if (watchData && mongoEpisode) {
        watchData.videoUrl = mongoEpisode.videoUrl || null;
        watchData.iframeSrc = mongoEpisode.iframeSrc || "about:blank";
        watchData.downloadLink = mongoEpisode.downloadUrl || "#";
      }

      /* ----- INFO API ----- */
      const seriesId =
        watchData?.seriesId || id.replace(/-episode-.*/, "-id-01");

      const infoJson = await safeFetchJSON(
        `https://api.henpro.fun/api/info?id=${seriesId}`
      );

      if (infoJson?.success) infoData = infoJson.data;
    } else {
      /* ----- INFO FIRST ----- */
      const infoJson = await safeFetchJSON(
        `https://api.henpro.fun/api/info?id=${id}`
      );

      if (infoJson?.success) infoData = infoJson.data;

      /* ----- AUTO LOAD FIRST EPISODE ----- */
      const firstEpisodeSlug = infoData?.episodes?.[0]?.slug;

      if (firstEpisodeSlug) {
        const watchJson = await safeFetchJSON(
          `https://api.henpro.fun/api/watch?id=${firstEpisodeSlug}`
        );

        if (watchJson?.success) watchData = watchJson.data;

        /* ----- PATCH FROM MONGO (EPISODE ONLY) ----- */
        if (firstEpisodeSlug.includes("episode")) {
          const mongoEpisode =
            await getEpisodeStreamFromDB(firstEpisodeSlug);

          if (watchData && mongoEpisode) {
            watchData.videoUrl = mongoEpisode.videoUrl;
            watchData.iframeSrc = mongoEpisode.iframeSrc;
            watchData.downloadLink = mongoEpisode.downloadUrl || "#";
          }
        }
      }
    }
  } catch (err) {
    console.error("Watch / Info fetch error:", err);
  }

  /* -------- FALLBACK -------- */
  if (!watchData && !infoData) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Video Unavailable</h1>
        <p className="text-gray-500">
          Sorry, we couldn’t load this video. Please try again later.
        </p>
      </div>
    );
  }

  /* -------- RENDER -------- */
  return (
    <>
      <WatchWrapper
        watchData={watchData}
        infoData={infoData}
        id={id}
        creator={creatorApiKey}
      />
      <Advertize initialAdLink={dynamicAdLink} />
    </>
  );
}
