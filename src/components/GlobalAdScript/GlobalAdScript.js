"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function GlobalAdScript() {
  const pathname = usePathname();

  // ❌ Do not load on ad-only page
  if (pathname === "/ad") return null;

  return (
    <Script
      strategy="afterInteractive"
      src="https://pl27309289.effectivegatecpm.com/d6/f8/e1/d6f8e16851504f20f1ccaadcdd965ee3.js"
    />
  );
}
