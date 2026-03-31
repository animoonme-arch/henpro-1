"use client";
import { MdClosedCaption, MdClosedCaptionDisabled } from "react-icons/md";
import { FaClock, FaPlay } from "react-icons/fa";
import "./RecentEpisodes.css";
import Link from "next/link";

// 

export default function RecentEpisodes({ recentEpi = [], creator }) {
  const normalize = (s) => (s || "").toString().toUpperCase().trim();

  const labelClass = (label) => {
    const l = normalize(label);
    if (l === "RAW") return "dabel-raw";
    if (l === "SUB") return "dabel-sub";
    if (l === "CEN" || l === "CENSORED") return "dabel-cen";
    if (l === "UNC" || l === "UNCENSORED") return "dabel-unc";
    return "dabel-default";
  };

  return (
    <div className="decent-container">
      <h2 className="decent-heading">
        <span>Recent Episodes</span>
      </h2>

      <div className="decent-grid">
        {recentEpi.map((ep) => (
          <Link key={ep.link} href={`/${ep.link}${creator ? `?creator=${encodeURIComponent(creator)}` : ""}`} className="decent-card">
            <div className="image-container">
              <img src={ep.poster} alt={ep.seriesName} className="poster" />

              {/* Overlay + Play Icon */}
              <div className="decent-overlay">
                <FaPlay className="decent-play-icon" />
              </div>

              {/* Top Tag — CEN / UNC */}
              {ep.censoredLabel && (
                <span
                  className={`dabel-tag top ${labelClass(ep.censoredLabel)}`}
                >
                  {ep.censoredLabel}
                </span>
              )}

              {/* Bottom Tag — SUB / RAW */}
              {ep.rawLabel && (
                <span className={`dabel-tag bottom ${labelClass(ep.rawLabel)}`}>
                  {ep.rawLabel === "SUB" ? (
                    <MdClosedCaption className="inline-icon" size={16} />
                  ) : (
                    <MdClosedCaptionDisabled
                      className="inline-icon"
                      size={16}
                    />
                  )}
                  {ep.rawLabel}
                </span>
              )}
            </div>

            <div className="info">
              <h3 className="series-name">{ep.seriesName}</h3>
              <div className="meta">
                <p className="episode-title">{ep.episodeTitle}</p>
                <p className="upload-time">
                  <FaClock />
                  <span>{ep.uploadTime}</span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
