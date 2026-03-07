"use client";

import Link from "next/link";
import "./special.css";
import { FaPlay } from "react-icons/fa";

export const dynamic = "force-dynamic";

export default function PageClient({ video }) {

  const playPreview = (e) => {
    const vid = e.currentTarget.querySelector("video");
    if (!vid) return;

    if (!vid.src) vid.src = vid.dataset.src;
    vid.play().catch(() => {});
  };

  const stopPreview = (e) => {
    const vid = e.currentTarget.querySelector("video");
    if (!vid) return;

    vid.pause();
    vid.currentTime = 0;
  };

  return (
    <div className="special-container">

      {/* VIDEO PLAYER */}
      <div className="player-wrapper">
        <video
          className="video-player"
          controls
          preload="metadata"
          poster={video.thumbnail}
        >
          <source src={video.customVideoURL} type="video/mp4" />
        </video>
      </div>

      {/* TITLE */}
      <h1 className="video-title">{video.title}</h1>

      {/* META */}
      <div className="meta">
        <span>Artist: {video.artist}</span>
        <span>Upload: {new Date(video.uploadDate).toDateString()}</span>
      </div>

      {/* CHARACTERS */}
      <div className="characters">
        {video.characters?.map((char, i) => (
          <span key={i} className="character">
            {char.name}
          </span>
        ))}
      </div>

      {/* TAGS */}
      <div className="tags">
        {video.tags?.slice(0, 25).map((tag, i) => (
          <span key={i} className="tag">
            {tag.name}
          </span>
        ))}
      </div>

      {/* RELATED */}
      <h2 className="related-title">Related Videos</h2>

      <div className="related-grid">

        {video.related?.map((item, i) => {

          const slug = new URL(item.link).pathname.replace(/\/$/, "");
          const internal = `/special${slug}`;

          const previewVideo = item.thumbnail
            .replace(/-\d+x\d+\.webp$/, ".mp4")
            .split("/")
            .pop();

          const previewSrc = `https://3dhq1.org/video/3d/${previewVideo}`;

          return (
            <Link
              key={i}
              href={internal}
              className="related-card"
              onMouseEnter={playPreview}
              onMouseLeave={stopPreview}
              onTouchStart={playPreview}
            >

              <div className="thumb">

                <img
                  src={item.thumbnail}
                  alt={item.title}
                />

                {/* hover preview */}
                <video
                  className="hover-preview"
                  muted
                  loop
                  playsInline
                  preload="none"
                  data-src={previewSrc}
                />

                {/* overlay */}
                <div className="overlay">
                  <FaPlay />
                </div>

                {/* duration */}
                <span className="duration">
                  {item.duration}
                </span>

              </div>

              <p className="related-name">
                {item.title}
              </p>

            </Link>
          );
        })}
      </div>
    </div>
  );
}