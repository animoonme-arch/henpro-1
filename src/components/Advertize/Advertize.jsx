"use client";

import { useEffect, useRef } from "react";

export default function Advertize({ initialAdLink }) {
  const hasTriggered = useRef(false);

  const externalAd =
    "https://violentlinedexploit.com/ukqgqrv4n?key=acf2a1b713094b78ec1cc21761e9b149";

  const internalAd = initialAdLink;

  useEffect(() => {
    // ✅ preload script
    const script = document.createElement("script");
    script.src =
      "https://violentlinedexploit.com/c9/00/44/c90044a4242864685950f91240cbbb70.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const handleClick = () => {
      if (hasTriggered.current) return;
      hasTriggered.current = true;

      // pop will fire here (script already loaded)

      // start smartlink after 30s
      setTimeout(() => {
        let count = 0;

        const interval = setInterval(() => {
          if (count >= 3) {
            clearInterval(interval);
            return;
          }

          const link = count % 2 === 0 ? internalAd : externalAd;
          window.open(link, "_blank");

          count++;
        }, 30000);
      }, 30000);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [internalAd]);

  return null;
}