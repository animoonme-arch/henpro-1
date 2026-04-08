import { connectDB } from "@/lib/mongoClient";
import Advertize from "@/components/Advertize/Advertize";
import WatchWrapper from "@/components/Watch/WatchWrapper";

/* ---------------- FAILOVER FETCH ---------------- */
const apiDomains = [
  "https://api.hentaio.pro",
  "https://api2.hentaio.pro",
  "https://api3.hentaio.pro",
];

async function fetchWithFallback(path) {
  for (const domain of apiDomains) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${domain}${path}`, {
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeout);

      if (!res.ok) throw new Error(`Failed on ${domain}`);

      const text = await res.text();
      return JSON.parse(text);
    } catch (err) {
      console.error("API failed:", domain, path, err.message);
    }
  }

  return null;
}

/* ---------------- MONGO EPISODE STREAM ---------------- */
async function getEpisodeStreamFromDB(episodeId) {
  if (!episodeId || !episodeId.includes("episode")) return null;

  try {
    const db = await connectDB();
    return await db.collection("episodes").findOne(
      { episodeId },
      {
        projection: {
          _id: 0,
          videoUrl: 1,
          iframeSrc: 1,
          downloadUrl: 1,
        },
      }
    );
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
    title: `Watch ${title} Hentai Video Streams Online in 720p, 1080p HD - Hentaio`,
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
    "https://violentlinedexploit.com/ukqgqrv4n?key=acf2a1b713094b78ec1cc21761e9b149";

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

  /* -------- DATA FETCH (FIXED) -------- */

  try {
    if (id.includes("episode")) {
      /* ----- WATCH ----- */
      const watchJson = await fetchWithFallback(`/api/watch?id=${id}`);
      if (watchJson?.success) watchData = watchJson.data;

      /* ----- MONGO PATCH ----- */
      const mongoEpisode = await getEpisodeStreamFromDB(id);
      if (watchData && mongoEpisode) {
        watchData.videoUrl = mongoEpisode.videoUrl || null;
        watchData.iframeSrc = mongoEpisode.iframeSrc || "about:blank";
        watchData.downloadLink = mongoEpisode.downloadUrl || "#";
      }

      /* ----- INFO ----- */
      const seriesId =
        watchData?.seriesId || id.replace(/-episode-.*/, "-id-01");

      const infoJson = await fetchWithFallback(
        `/api/info?id=${seriesId}`
      );
      if (infoJson?.success) infoData = infoJson.data;
    } else {
      /* ----- INFO FIRST ----- */
      const infoJson = await fetchWithFallback(`/api/info?id=${id}`);
      if (infoJson?.success) infoData = infoJson.data;

      /* ----- FIRST EPISODE ----- */
      const firstEpisodeSlug = infoData?.episodes?.[0]?.slug;

      if (firstEpisodeSlug) {
        const watchJson = await fetchWithFallback(
          `/api/watch?id=${firstEpisodeSlug}`
        );

        if (watchJson?.success) watchData = watchJson.data;

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
      {/* <Advertize initialAdLink={dynamicAdLink} /> */}
    </>
  );
}