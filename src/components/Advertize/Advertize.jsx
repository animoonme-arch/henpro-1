"use client";

import { useEffect, useRef, useState } from "react";
import "./advertize.css";

export default function Advertize({ initialAdLink }) {
  const [ready, setReady] = useState(false);
  const hasClicked = useRef(false);

  const externalAd =
    "https://violentlinedexploit.com/ukqgqrv4n?key=acf2a1b713094b78ec1cc21761e9b149";

  const internalAd = initialAdLink;

  /* ---------------- LOAD POP SCRIPT ---------------- */
  useEffect(() => {
    // prevent multiple loads
    if (sessionStorage.getItem("popLoaded")) {
      setReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://violentlinedexploit.com/c9/00/44/c90044a4242864685950f91240cbbb70.js";
    script.async = true;

    script.onload = () => {
      console.log("Ad script loaded");
      sessionStorage.setItem("popLoaded", "true");
      setReady(true);
    };

    document.body.appendChild(script);
  }, []);

  /* ---------------- CLICK HANDLER ---------------- */
  const handleClick = () => {
    if (!ready) return;

    // prevent multiple triggers per session
    if (hasClicked.current || sessionStorage.getItem("adStarted")) return;

    hasClicked.current = true;
    sessionStorage.setItem("adStarted", "true");

    console.log("User clicked → pop should fire");

    /* ---------------- SMARTLINK LOGIC ---------------- */
    setTimeout(() => {
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

        console.log("Smartlink fired:", count);
      }, 30000); // every 30 sec
    }, 30000); // start after 30 sec
  };

  /* ---------------- RENDER OVERLAY ---------------- */
  if (!ready) return null;

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        cursor: "pointer",
      }}
    />
  );
}