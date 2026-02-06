// import GlobalAdScript from "@/components/GlobalAdScript/GlobalAdScript";
import GlobalAdScript from "@/components/GlobalAdScript/GlobalAdScript";
import "./globals.css";
import Script from "next/script";
// import GlobalAdScript from "@/components/GlobalAdScript";

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
        {/* 🔥 Conditional global ad */}
        <GlobalAdScript />
        {children}
      </body>
    </html>
  );
}
