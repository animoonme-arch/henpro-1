"use client";

import { useEffect, useRef } from "react";

export default function Advertize({ initialAdLink }) {
  const hasTriggeredPop = useRef(false);
  const smartlinkStarted = useRef(false);

  const externalAd =
    "https://violentlinedexploit.com/ukqgqrv4n?key=acf2a1b713094b78ec1cc21761e9b149";

  const internalAd = initialAdLink;

  useEffect(() => {
    const handleFirstClick = () => {
      if (hasTriggeredPop.current) return;

      hasTriggeredPop.current = true;

      // 🔥 Load Adsterra script ONLY once
      const script = document.createElement("script");
      script.src =
        "https://violentlinedexploit.com/c9/00/44/c90044a4242864685950f91240cbbb70.js";
      script.async = true;
      document.body.appendChild(script);

      // 🔥 Start smartlink AFTER 30s
      setTimeout(() => {
        if (smartlinkStarted.current) return;
        smartlinkStarted.current = true;

        let count = 0;

        const interval = setInterval(() => {
          if (count >= 3) {
            clearInterval(interval);
            return;
          }

          // alternate links
          const link = count % 2 === 0 ? internalAd : externalAd;

          window.open(link, "_blank");
          count++;
        }, 30000);

      }, 30000);

      document.removeEventListener("click", handleFirstClick);
    };

    document.addEventListener("click", handleFirstClick);

    return () => {
      document.removeEventListener("click", handleFirstClick);
    };
  }, [internalAd]);

  return null;
}