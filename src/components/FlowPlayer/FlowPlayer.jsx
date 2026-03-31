"use client";

import { useEffect, useRef } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

export default function PlyrPlayer({ url, poster }) {
  const videoRef = useRef(null);
// 
  useEffect(() => {
    const player = new Plyr(videoRef.current, {
      controls: [
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "fullscreen"
      ]
    });

    return () => {
      if (player) player.destroy();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      poster={poster}
      style={{
        width: "100%",
        borderRadius: "12px",
      }}
    >
      <source src={url} type="video/mp4" />
    </video>
  );
}