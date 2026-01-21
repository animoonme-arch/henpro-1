import "./globals.css";
import Script from "next/script";

export default function AdLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Analytics is fine */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-64QSGGL3N5"
        />
      </head>

      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
