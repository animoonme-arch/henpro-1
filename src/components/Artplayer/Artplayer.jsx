"use client";

import { useEffect, useRef } from "react";
import Artplayer from "artplayer";

export default function ArtPlayer({ url, poster }) {
  const artRef = useRef(null);

  useEffect(() => {
    const art = new Artplayer({
      container: artRef.current,
      url: url,
      poster: poster,
      autoplay: false,
      volume: 0.8,
      isLive: false,
      muted: false,
      autoSize: true,
      autoMini: true,
      screenshot: true,
      setting: true,
      playbackRate: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: true,
      playsInline: true,
      theme: "#ff9741",
    });

    return () => {
      if (art) art.destroy();
    };
  }, [url]);

  return <div ref={artRef} style={{ width: "100%", height: "100%" }} />;
}