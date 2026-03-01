"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function GlobalAdScript() {
  const pathname = usePathname();

  // ❌ Do not load on ad-only page
  if (pathname === "/ad") return null;

  return (
    <></>
    // <Script
    //   strategy="afterInteractive"
    //   src="https://violentlinedexploit.com/ea/1c/79/ea1c798183baca79e1812cf43c17e87e.js"
    // />
  );
}
