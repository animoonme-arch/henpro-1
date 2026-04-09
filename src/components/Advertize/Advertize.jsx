"use client";

import React, { useEffect, useState } from "react";
import "./advertize.css";

export default function Advertize({ initialAdLink }) {
  const [time, setTime] = useState(new Date());
  const [showAd, setShowAd] = useState(false);

  const ls = typeof window !== "undefined" ? localStorage : null;

  // 🌟 Your external ad link
  const externalAd =
    "https://www.profitablecpmratenetwork.com/eqj1sm4h?key=8675fdb0638ddeb85b7967c8e40334e2";

  // 🌟 Internal link (comes from server)
  const internalAd = initialAdLink;

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);

    if (!ls) return;

    const lastDisplay = ls.getItem("lastDisplay");
    const lastDate = ls.getItem("lastDate");
    const lastHour = ls.getItem("lastHour");

    const currentDate = time.getDate();
    const currentHour = time.getHours();

    const lastDisplayDate = lastDisplay ? new Date(lastDisplay) : null;
    const secondsSinceLastDisplay = lastDisplayDate
      ? Math.floor((time - lastDisplayDate) / 1000)
      : Infinity;

    const shouldShowAd =
      secondsSinceLastDisplay >= 30 ||
      currentDate !== parseInt(lastDate) ||
      currentHour !== parseInt(lastHour);

    setShowAd(shouldShowAd);

    return () => clearInterval(interval);
  }, [time]);

  function handleAdClick() {
    if (!ls) return;

    // 🔥 Get toggle state (default = internal first)
    const lastType = ls.getItem("lastAdType") || "external";

    // 👇 Switch logic
    const nextType = lastType === "internal" ? "external" : "internal";

    const targetLink =
      nextType === "internal" ? internalAd : externalAd;

    // ✅ Save toggle
    ls.setItem("lastAdType", nextType);

    // track clicks
    const clickCount = parseInt(ls.getItem("adClickCount") || "0", 10) + 1;
    ls.setItem("adClickCount", clickCount.toString());

    ls.setItem("lastDisplay", new Date().toISOString());
    ls.setItem("lastDate", time.getDate().toString());
    ls.setItem("lastHour", time.getHours().toString());
    ls.setItem("truth", "false");

    window.open(targetLink, "_blank");
    setShowAd(false);
  }

  return (
    <div
      className="Advertize"
      style={{ zIndex: showAd ? 100 : -1 }}
      onClick={handleAdClick}
    ></div>
  );
}