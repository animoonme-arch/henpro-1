// import Special from "@/components/Special/Special";
import Advertize from "@/components/Advertize/Advertize";
import SpeicalWrapper from "@/components/Special/SpeicalWrapper";

export const dynamic = "force-dynamic";

/* ------------------ */
/* FETCH WITH FAILOVER */
/* ------------------ */

const apiDomains = [
  "https://api.hentaio.pro",
  "https://api2.hentaio.pro",
  "https://api3.hentaio.pro",
];

async function fetchVideo(slug) {
  for (const domain of apiDomains) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(
        `${domain}/api/special-watch/${slug}`,
        {
          signal: controller.signal,
          next: { revalidate: 3600 },
        }
      );

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Failed on ${domain}`);
      }

      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error("Special API failed:", domain, err.message);
    }
  }

  return null; // all failed
}

/* ------------------ */
/* METADATA */
/* ------------------ */

export async function generateMetadata({ params }) {
  const { slug } = params;

  const video = await fetchVideo(slug);

  if (!video) {
    return {
      title: "Video not found",
      description: "This video could not be found.",
    };
  }

  const pageUrl = `https://hentaio.pro/special/${slug}`;

  return {
    title: video.title,
    description: video.description,

    alternates: {
      canonical: pageUrl,
    },

    openGraph: {
      title: video.title,
      description: video.description,
      url: pageUrl,
      siteName: "Hentaio",
      images: [
        {
          url: video.thumbnail,
          width: 1200,
          height: 630,
          alt: video.title,
        },
      ],
      type: "video.other",
      videos: [
        {
          url: video.customVideoURL,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: video.title,
      description: video.description,
      images: [video.thumbnail],
    },
  };
}

/* ------------------ */
/* PAGE */
/* ------------------ */

export default async function Page({ params }) {
  const { slug } = params;

  const video = await fetchVideo(slug);

  const DEFAULT_AD_LINK =
    "https://violentlinedexploit.com/ukqgqrv4n?key=acf2a1b713094b78ec1cc21761e9b149";

  if (!video) {
    return (
      <div style={{ color: "white", padding: "40px" }}>
        Failed to load video. Please try again later.
      </div>
    );
  }

  return (
    <div>
      <SpeicalWrapper video={video} id={slug} />
      <Advertize initialAdLink={DEFAULT_AD_LINK} />
    </div>
  );
}