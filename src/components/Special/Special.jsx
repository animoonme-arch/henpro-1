"use client";

import Link from "next/link";
import "./special.css";
import { FaCheckCircle, FaEye, FaInfoCircle, FaPlay, FaTimesCircle } from "react-icons/fa";
import Navbar from "../Navbar/Navbar";
import Footer from "../footer/Footer";
import { SessionProvider } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import ShareSlab from "../ShareSlab/ShareSlab";
import CommentSection from "../CommentSection/CommentSection";

export const dynamic = "force-dynamic";

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

const useViewTracker = (progressContentKey) => {
  const isViewTracked = useRef(false);

  const trackView = useCallback(() => {
    // Only track if the progressContentKey is available and we haven't tracked it yet
    if (!progressContentKey || isViewTracked.current) return;

    // Set ref immediately to prevent subsequent calls
    isViewTracked.current = true;

    // Send request to your new view tracking API endpoint
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progressContentKey }),
    })
      .then((res) => {
        if (!res.ok) {
          console.warn("View tracking failed on API side.");
        }
      })
      .catch((e) => {
        console.error("Failed to send view tracking request:", e);
      });
  }, [progressContentKey]);

  return { trackView };
};


export default function Special({ video, id }) {
  const [customToast, setCustomToast] = useState(null);

  const contentId = id;

  let progressContentKey = contentId;

  // 🔑 VIEW TRACKING: Integrate tracker hook
  const { trackView } = useViewTracker(progressContentKey);

  const showCustomToast = (message, type = "info") => {
    setCustomToast({ message, type });
    setTimeout(() => {
      setCustomToast(null);
    }, 4000); // Toast disappears after 4 seconds
  };

  // State initialization (using the initial watchData or null)
  const [currentViews, setCurrentViews] = useState(null);

  // 2. Define the function to fetch views using the calculated contentId
  const hasCountedRef = useRef(false);

  // Increment ONCE
  useEffect(() => {
    if (!contentId || hasCountedRef.current) return;
    hasCountedRef.current = true;

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentKey: contentId }),
    });
  }, [contentId]);

  // Fetch views
  const fetchLatestViews = useCallback(async () => {
    if (!contentId) return;

    const res = await fetch(`/api/views?contentKey=${contentId}`);
    if (res.ok) {
      const data = await res.json();
      setCurrentViews(data.views ?? 0);
    }
    trackView()
  }, [contentId, trackView]);

  useEffect(() => {
    fetchLatestViews();
  }, [fetchLatestViews]);


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

        {/* VIDEO PLAYER */}
        <div className="player-wrapper">
          <video
            className="video-player"
            controls
            preload="metadata"
            poster={video?.thumbnail}
          >
            <source src={video.customVideoURL} type="video/mp4" />
          </video>
          {currentViews !== null && (
            <div className="video-views">
              <FaEye className="view-icon" />
              {currentViews.toLocaleString()} views
            </div>
          )}
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
        <ShareSlab
          pageId={id}
          url={`https://henpro.fun/special/${id}`}
          title={video.title}
          pageName="this hentai"

        />
        <CommentSection contentId={contentId} showToast={showCustomToast} />
      </div>


      <Footer />
    </SessionProvider>
  );
}