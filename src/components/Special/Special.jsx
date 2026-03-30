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
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import ShareSlab from "../ShareSlab/ShareSlab";
import CommentSection from "../CommentSection/CommentSection";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

  const { data: session } = useSession();
  
  const videoRef = useRef(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const [customToast, setCustomToast] = useState(null);
  const [currentViews, setCurrentViews] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const hasCountedRef = useRef(false);

  const statusOptions = [
    "Watching",
    "On-Hold",
    "Plan to Watch",
    "Dropped",
    "Completed",
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);


  const handleSelect = async (status) => {
    if (!session) {
      console.warn("User not logged in. Cannot update watchlist.");
      showCustomToast("Please sign in to update your list.", "info");
      return;
    }

    setDropdownOpen(false);

    try {
      // ✅ FULLY CORRECT PAYLOAD (matches API exactly)
      const payload = {
        contentId: contentId, // main id
        contentKey: contentId, // for special videos (same is fine)

        status: status,

        title: video?.title || "Untitled",
        poster: video?.thumbnail || "",

        episodeNo: 1,
        episodeTitle: video?.title || "Untitled",

        totalDuration: videoDuration || 24 * 60, // fallback for iframe
      };

      console.log("SENDING PAYLOAD:", payload);

      const res = await fetch("/api/user/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("WATCHLIST RESPONSE:", res.status, data);

      if (!res.ok) {
        showCustomToast(data.message || "Failed to save.", "error");
      } else {
        setWatchlistStatus(status);
        showCustomToast(`Added to "${status}"`, "success");
      }
    } catch (error) {
      console.error("Watchlist POST Error:", error);
      showCustomToast("Something went wrong", error);
    }
  };

  /* ------------------ */
  /* CLOSE DROPDOWN */
  /* ------------------ */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ------------------ */
  /* OPTIONAL: GET VIDEO DURATION (only works if using <video>) */
  /* ------------------ */

  useEffect(() => {
    if (!videoRef?.current) return;

    const handleLoaded = () => {
      setVideoDuration(videoRef.current.duration || 0);
    };

    videoRef.current.addEventListener("loadedmetadata", handleLoaded);

    return () => {
      videoRef.current?.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    const interval = setInterval(() => {
      const vid = videoRef.current;

      if (vid.currentTime / vid.duration > 0.95) return;

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
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setVideoDuration(videoRef.current.duration);
              }
            }}
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

        {/* --- WATCHLIST BUTTON SECTION --- */}
        <div className="flex justify-end items-center min-h-[70px] mt-[-20px] p-2.5 w-full">
          {" "}
          {/* Centering wrapper */}
          <div className="relative w-fit" ref={dropdownRef}>
            {/* Add Button */}
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="add-button flex gap-x-2 px-6 max-[429px]:px-3 py-2 text-white items-center rounded-3xl font-medium text-lg max-[429px]:text-[15px] transition-all duration-300"
            >
              <FontAwesomeIcon
                icon={faPlus}
                className="text-[14px] mt-[1px]"
              />
              <p>Add to List</p>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="dropdown-menu absolute top-full mt-3 w-full min-w-[170px] bg-[#121212] border border-[#2a2a2a] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] z-50 overflow-hidden animate-slideDown">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleSelect(status)}
                    className="dropdown-item block w-full px-5 py-3 text-left text-sm font-medium text-gray-300 hover:text-white transition-all duration-200"
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* --- END WATCHLIST BUTTON SECTION --- */}

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