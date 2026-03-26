import Special from "@/components/Special/Special";
import Advertize from "@/components/Advertize/Advertize";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = params;

  const res = await fetch(`https://api.hentaio.pro/api/special-watch/${slug}`, {
    next: { revalidate: 3600 },
  });

  const json = await res.json();
  const video = json.data;

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
      siteName: "HenPro",
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

export default async function Page({ params }) {
  const { slug } = params;

  const res = await fetch(`https://api.hentaio.pro/api/special-watch/${slug}`, {
    next: { revalidate: 3600 },
  });

  const json = await res.json();
  const video = json.data;

  const DEFAULT_AD_LINK =
    "https://violentlinedexploit.com/ukqgqrv4n?key=acf2a1b713094b78ec1cc21761e9b149";

  return (
    <div>
      <Special video={video} id={slug} />
      <Advertize initialAdLink={DEFAULT_AD_LINK} />
    </div>
  );
}