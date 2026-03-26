import "./globals.css";
import Script from "next/script";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Hanimetv";
const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN || "https://henpro.fun";

const isPro = siteName.toLowerCase().includes("pro");
const base = isPro ? "Hen" : "Hanime";
const accent = isPro ? "Pro" : "TV";

const fullSiteName = `${siteName}`;

export const metadata = {
  metadataBase: new URL(domain),

  title: {
    default: `${fullSiteName} - Watch Hentai Online`,
    template: `%s | ${fullSiteName}`,
  },

  description: `Watch uncensored hentai online in HD quality at ${fullSiteName}. Stream the latest hentai episodes, classic anime hentai, and exclusive videos in 720p and 1080p.`,

  keywords: [
    "hentai",
    "watch hentai online",
    "uncensored hentai",
    "hentai streaming",
    "anime hentai",
    `${fullSiteName}`,
  ],

  openGraph: {
    title: `${fullSiteName} - Watch Hentai Online`,
    description: `Watch the latest uncensored hentai videos online in HD at ${fullSiteName}.`,
    url: domain,
    siteName: fullSiteName,
    type: "website",
    images: [
      {
        url: "/pearl.png",
        width: 1200,
        height: 630,
        alt: `${fullSiteName} preview`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${fullSiteName} - Watch Hentai Online`,
    description: `Watch hentai online in HD quality at ${fullSiteName}.`,
    images: ["/pearl.png"],
  },

  alternates: {
    canonical: domain,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-64QSGGL3N5"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-64QSGGL3N5');
            `,
          }}
        />
      </head>

      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}