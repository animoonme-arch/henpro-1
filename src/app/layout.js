import "./globals.css";
import Script from "next/script";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Hanimetv";

export const metadata = {
  title: `Watch Free Hentai Video Streams Online in 720p , 1080p HD - ${siteName}`,
  description: `Enjoy your unlimited hentai & anime
          collection. We are the definitive source for the best curated 720p /
          1080p HD hentai videos, viewable by mobile phone and tablet, for free.`,
  verification: {
    google: "x0aiWAODNGU-1UA2FXyORfyme9uWJir7mIMu8AMmLm4",
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
          strategy="afterInteractive"
          src="https://pl27309289.effectivegatecpm.com/d6/f8/e1/d6f8e16851504f20f1ccaadcdd965ee3.js"
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

      <body
        className="antialiased"
        style={{
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Cantarell, 'Noto Sans', Arial, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
