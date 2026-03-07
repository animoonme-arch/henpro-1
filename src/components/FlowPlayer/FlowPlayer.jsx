"use client";

import { useEffect, useRef } from "react";
import "@flowplayer/player/flowplayer.css";

export default function FlowPlayer({ url, poster }) {
  const playerRef = useRef(null);

  useEffect(() => {
    let fp;

    async function init() {
      const flowplayer = (await import("@flowplayer/player")).default;

      fp = flowplayer(playerRef.current, {
        src: url,
        poster: poster,
        autoplay: false,
        controls: true,
      });
    }

    init();

    return () => {
      if (fp) fp.destroy();
    };
  }, [url, poster]);

  return (
    <div
      ref={playerRef}
      style={{
        width: "100%",
        aspectRatio: "16/9",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
}