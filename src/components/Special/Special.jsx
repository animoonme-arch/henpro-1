"use client";

import Link from "next/link";
import "./special.css";
import {
  FaCheckCircle,
  FaEye,
  FaInfoCircle,
  FaPlay,
  FaTimesCircle,
} from "react-icons/fa";

import Navbar from "../Navbar/Navbar";
import Footer from "../footer/Footer";
import { SessionProvider } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import ShareSlab from "../ShareSlab/ShareSlab";
import CommentSection from "../CommentSection/CommentSection";

export const dynamic = "force-dynamic";

/* ------------------ */
/* TOAST */
/* ------------------ */

const CustomToast = ({ message, type, onClose }) => {
  let Icon = FaInfoCircle;

  if (type === "success") Icon = FaCheckCircle;
  if (type === "error") Icon = FaTimesCircle;

  return (
    <div className={`custom-toast custom-toast-${type}`}>
      <div className="toast-icon-message">
        <Icon />
        <p>{message}</p>
      </div>

      <button onClick={onClose} className="toast-close-btn">
        <AiOutlineClose />
      </button>
    </div>
  );
};

/* ------------------ */
/* COMPONENT */
/* ------------------ */

export default function Special({ video, id }) {
  const contentId = id;

  const videoRef = useRef(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const [customToast, setCustomToast] = useState(null);
  const [currentViews, setCurrentViews] = useState(null);

  const hasCountedRef = useRef(false);

  const showCustomToast = (message, type = "info") => {
    setCustomToast({ message, type });

    setTimeout(() => {
      setCustomToast(null);
    }, 4000);
  };

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch(`/api/progress?contentKey=${contentId}`);

        if (!res.ok) return;

        const data = await res.json();

        if (videoRef.current && data.currentTime > 0) {
          videoRef.current.currentTime = data.currentTime;
        }
      } catch (err) {
        console.error("Load progress error:", err);
      } finally {
        setInitialLoaded(true);
      }
    };

    if (contentId) loadProgress();
  }, [contentId]);

  useEffect(() => {
    if (!initialLoaded) return;

    if (vid.currentTime / vid.duration > 0.95) return;

    const interval = setInterval(() => {
      const vid = videoRef.current;

      if (!vid || vid.paused || vid.currentTime < 2) return;

      fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentKey: contentId,
          currentTime: vid.currentTime,
          totalDuration: vid.duration,
          title: video.title,
          poster: video.thumbnail,
          parentContentId: null,
          episodeNo: null,
        }),
      }).catch(() => { });
    }, 5000); // every 5 sec

    return () => clearInterval(interval);
  }, [initialLoaded, contentId, video]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const vid = videoRef.current;
      if (!vid) return;

      navigator.sendBeacon(
        "/api/progress",
        JSON.stringify({
          contentKey: contentId,
          currentTime: vid.currentTime,
          totalDuration: vid.duration,
          title: video.title,
          poster: video.thumbnail,
        })
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [contentId, video]);
  /* ------------------ */
  /* VIEW SYSTEM */
  /* ------------------ */

  useEffect(() => {
    if (!contentId || hasCountedRef.current) return;

    hasCountedRef.current = true;

    const trackAndFetch = async () => {
      try {

        // increment view
        await fetch("/api/views", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contentKey: contentId,
          }),
        });

        // fetch updated count
        const res = await fetch(`/api/views?contentKey=${contentId}`);

        if (res.ok) {
          const data = await res.json();
          setCurrentViews(data.views ?? 0);
        }

      } catch (err) {
        console.error("View system error:", err);
      }
    };

    trackAndFetch();

  }, [contentId]);

  /* ------------------ */
  /* PREVIEW VIDEO */
  /* ------------------ */

  const playPreview = (e) => {
    const vid = e.currentTarget.querySelector("video");

    if (!vid) return;

    if (!vid.src) vid.src = vid.dataset.src;

    vid.play().catch(() => { });
  };

  const stopPreview = (e) => {
    const vid = e.currentTarget.querySelector("video");

    if (!vid) return;

    vid.pause();
    vid.currentTime = 0;
  };

  /* ------------------ */
  /* SAFETY CHECK */
  /* ------------------ */

  if (!video) {
    return <div style={{ padding: "40px", color: "white" }}>Loading...</div>;
  }

  return (
    <SessionProvider>
      <Navbar now={true} />

      {customToast && (
        <CustomToast
          message={customToast.message}
          type={customToast.type}
          onClose={() => setCustomToast(null)}
        />
      )}

      <div className="special-container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 0",
            backgroundColor: "#201f31",
          }}
        >
          <iframe
            src="/ad"
            title="Sponsored Ad"
            scrolling="no"

            referrerPolicy="no-referrer-when-downgrade"
            style={{
              width: "100%",
              maxWidth: "728px",
              height: "90px",
              border: "none",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#201f31",
            }}
          />
        </div>

        {/* VIDEO PLAYER */}

        <div className="player-wrapper">
          <video
            ref={videoRef}
            className="video-player"
            controls
            preload="metadata"
            poster={video?.thumbnail}
          >
            <source src={video.customVideoURL} type="video/mp4" />
          </video>
        </div>

        {/* VIEWS */}

        {currentViews !== null && (
          <div className="video-views">
            <FaEye className="view-icon" />
            {currentViews.toLocaleString()} views
          </div>
        )}

        {/* TITLE */}

        <h1 className="video-title">{video.title}</h1>

        {/* META */}

        <div className="meta">
          <span>Artist: {video.artist}</span>

          <span>
            Upload:{" "}
            {video.uploadDate
              ? new Date(video.uploadDate).toDateString()
              : "Unknown"}
          </span>
        </div>

        {/* CHARACTERS */}

        <div className="characters">
          {Array.isArray(video.characters) &&
            video.characters.map((char, i) => (
              <span key={i} className="character">
                {char.name}
              </span>
            ))}
        </div>

        {/* TAGS */}

        <div className="tags">
          {Array.isArray(video.tags) &&
            video.tags.slice(0, 25).map((tag, i) => (
              <span key={i} className="tag">
                {tag.name}
              </span>
            ))}
        </div>

        {/* RELATED */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 0",
            backgroundColor: "#201f31",
          }}
        >
          <iframe
            src="/ad"
            title="Sponsored Ad"
            scrolling="no"

            referrerPolicy="no-referrer-when-downgrade"
            style={{
              width: "100%",
              maxWidth: "728px",
              height: "90px",
              border: "none",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#201f31",
            }}
          />
        </div>

        <h2 className="related-title">Related Videos</h2>

        <div className="related-grid">
          {Array.isArray(video.related) &&
            video.related.map((item, i) => {

              let slug = "";

              try {
                slug = new URL(item.link).pathname.replace(/\/$/, "");
              } catch {
                slug = "";
              }

              const internal = `/special${slug}`;

              const previewVideo = item.thumbnail
                ?.replace(/-\d+x\d+\.webp$/, ".mp4")
                ?.split("/")
                ?.pop();

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
                      loading="lazy"
                    />

                    <video
                      className="hover-preview"
                      muted
                      loop
                      playsInline
                      preload="none"
                      data-src={previewSrc}
                    />

                    <div className="overlay">
                      <FaPlay />
                    </div>

                    <span className="duration">{item.duration}</span>

                  </div>

                  <p className="related-name">{item.title}</p>
                </Link>
              );
            })}
        </div>

        {/* SHARE */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 0",
            backgroundColor: "#201f31",
          }}
        >
          <iframe
            src="/ad"
            title="Sponsored Ad"
            scrolling="no"

            referrerPolicy="no-referrer-when-downgrade"
            style={{
              width: "100%",
              maxWidth: "728px",
              height: "90px",
              border: "none",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#201f31",
            }}
          />
        </div>

        <ShareSlab
          pageId={id}
          url={`https://henpro.fun/special/${id}`}
          title={video.title}
          pageName="this hentai"
        />

        {/* COMMENTS */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 0",
            backgroundColor: "#201f31",
          }}
        >
          <iframe
            src="/ad"
            title="Sponsored Ad"
            scrolling="no"

            referrerPolicy="no-referrer-when-downgrade"
            style={{
              width: "100%",
              maxWidth: "728px",
              height: "90px",
              border: "none",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#201f31",
            }}
          />
        </div>

        {contentId && (
          <CommentSection
            contentId={contentId}
            showToast={showCustomToast}
          />
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 0",
            backgroundColor: "#201f31",
          }}
        >
          <iframe
            src="/ad"
            title="Sponsored Ad"
            scrolling="no"

            referrerPolicy="no-referrer-when-downgrade"
            style={{
              width: "100%",
              maxWidth: "728px",
              height: "90px",
              border: "none",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#201f31",
            }}
          />
        </div>

      </div>

      <Footer />
    </SessionProvider>
  );
}