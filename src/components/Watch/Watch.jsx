// components/Watch/WatchPageClient.jsx
"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import {
  FaHeart,
  FaPlus,
  FaCheck,
  FaPencilAlt,
  FaClock,
  FaTimes,
  FaPause,
  FaPlay,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa"; // 🔑 Import icons for the watchlist button

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
// ⭐️ IMPORT useSearchParams
import Link from "next/link";
// import { useSearchParams } from "next/navigation";
import "./Watch.css";
import RelatedGrid from "../Related/Related";
import Loading from "@/app/watch/[id]/load";
import ShareSlab from "../ShareSlab/ShareSlab";
import VideoSection from "../VideoSection/VideoSection";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AiOutlineClose } from "react-icons/ai";
import { useSession } from "next-auth/react";
import CommentSection from "../CommentSection/CommentSection";
import Footer from "../footer/Footer";

// Helper function to convert duration string (e.g., "15 min") to seconds
const durationToSeconds = (durationStr) => {
  if (!durationStr || typeof durationStr !== "string") return 0;
  const matches = durationStr.match(/(\d+)\s*(h|min|m|s)/g);
  let totalSeconds = 0;

  if (matches) {
    matches.forEach((match) => {
      const parts = match.trim().match(/(\d+)\s*(h|min|m|s)/);
      if (parts && parts.length >= 3) {
        const numValue = parseInt(parts[1], 10);
        const unit = parts[2];

        if (unit.startsWith("h")) {
          totalSeconds += numValue * 3600;
        } else if (unit.startsWith("min") || unit === "m") {
          totalSeconds += numValue * 60;
        } else if (unit === "s") {
          totalSeconds += numValue;
        }
      }
    });
  }
  return totalSeconds > 0 ? totalSeconds : 0;
};

// 🔑 Watchlist Status Mappings
const mapStatusToDisplay = {
  Watching: { text: "Watching", icon: <FaPlay /> },
  Completed: { text: "Completed", icon: <FaCheck /> },
  "Plan to Watch": { text: "Plan to Watch", icon: <FaClock /> },
  Dropped: { text: "Dropped", icon: <FaTimes /> },
  "On Hold": { text: "On Hold", icon: <FaPause /> },
};

// --- Default new status when adding to list ---
const defaultNewStatus = "Watching";

// Define the Custom Toast Component
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

const useViewTracker = (contentKey) => {
  const isViewTracked = useRef(false);

  const trackView = useCallback(() => {
    // Only track if the contentKey is available and we haven't tracked it yet
    if (!contentKey || isViewTracked.current) return;

    // Set ref immediately to prevent subsequent calls
    isViewTracked.current = true;

    // Send request to your new view tracking API endpoint
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentKey }),
    })
      .then((res) => {
        if (!res.ok) {
          console.warn("View tracking failed on API side.");
        }
      })
      .catch((e) => {
        console.error("Failed to send view tracking request:", e);
      });
  }, [contentKey]);

  return { trackView };
};

export default function WatchPageClient({
  watchData = {},
  infoData = {},
  recommendations = [],
  id,
  creat
}) {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [adClosed, setAdClosed] = useState(false);

  const [watchlistStatus, setWatchlistStatus] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Custom Toast State
  const [customToast, setCustomToast] = useState(null);

  // ⭐️ Retrieve the creator parameter
  // const searchParams = useSearchParams();
  const creator = creat;

  // ⭐️ Helper function to append the creator parameter to a URL
  const getUpdatedLink = (baseLink) => {
    if (!creator) return baseLink;

    const separator = baseLink.includes("?") ? "&" : "?";
    return `${baseLink}${separator}creator=${creator}`;
  };
  // --------------------------------------------------------

  // Function to display the custom toast
  const showCustomToast = (message, type = "info") => {
    setCustomToast({ message, type });
    setTimeout(() => {
      setCustomToast(null);
    }, 4000); // Toast disappears after 4 seconds
  };

  const parentId = infoData?.id;

  const durationString =
    infoData?.about?.["Average Duration"] ||
    watchData?.duration ||
    infoData?.tvInfo?.duration;

  const totalDurationSeconds = durationToSeconds(durationString);
  const combinedTitle = infoData?.title || "Unknown Series";

  const isEpisode = infoData?.episodes?.some(
    (ep) => ep.slug === id || ep.id === id
  );

  const contentId =
    isEpisode
      ? id
      : infoData?.episodes?.[0]?.slug;

  let progressContentKey = contentId;

  // 🔑 VIEW TRACKING: Integrate tracker hook
  const { trackView } = useViewTracker(contentKey);
  let progressEpisodeNo;

  if (id && id.toLowerCase().includes("episode")) {
    const match = id.match(/episode-(\d+)/i);
    progressEpisodeNo = match ? parseInt(match[1], 10) : "?";
  } else if (infoData?.episodes?.length > 0) {
    const defaultEpisode = infoData.episodes[0];
    const match = defaultEpisode.title.match(/(\d+)/);
    progressEpisodeNo = match ? parseInt(match[1], 10) : 1;
  } else {
    progressEpisodeNo = 1;
  }

  // ✅ Determine proper contentId based on ID type

  const videoMetadata = {
    contentKey: progressContentKey,
    videoUrl: watchData?.videoUrl,
    title: combinedTitle,
    totalDuration: totalDurationSeconds,
    parentContentId: parentId,
    poster: infoData?.poster,
    episodeTitle: watchData?.title,
    episodeNo: progressEpisodeNo,
  };

  const prevButtonClass = "swiper-button-prev-custom";
  const nextButtonClass = "swiper-button-next-custom";

  // --- Check watchlist status ---
  const statusOptions = [
    "Watching",
    "On-Hold",
    "Plan to Watch",
    "Dropped",
    "Completed",
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
  }, [contentId]);

  useEffect(() => {
    fetchLatestViews();
  }, [fetchLatestViews]);


  const handleSelect = async (status) => {
    if (!session) {
      // Assuming setLogIsOpen is available via a context or prop, but for now, logging a warning.
      // If a component is missing, I cannot fix it, so I'll leave the original logic.
      // setLogIsOpen(true);
      console.warn("User not logged in. Cannot update watchlist.");
      showCustomToast("Please sign in to update your list.", "info");
      return;
    }

    setDropdownOpen(false);

    try {
      // ✅ Build the final payload your API expects
      const payload = {
        ...videoMetadata,
        contentId,
        status,
      };

      const res = await fetch("/api/user/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showCustomToast(data.message || "Failed to save.", "error");
      } else {
        setWatchlistStatus(status); // Update local status on success
        showCustomToast(`Added to "${status}"`, "success");
      }
    } catch (error) {
      console.error("Watchlist POST Error:", error);
      showCustomToast("Something went wrong", "error");
    }
  };

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
  return (
    <>
      <Navbar now={false} creator={creator} />

      {customToast && (
        <CustomToast
          message={customToast.message}
          type={customToast.type}
          onClose={() => setCustomToast(null)}
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

      <div className="compli">
        <div className="watc">
          {/* --- Video Player --- */}
          <div className="video-section">
            <div className="ifro">
              <iframe
                src={watchData.iframeSrc}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>


            {/* --- Anime Info --- */}
            <div className="prisod">
              <div className="slab1">
                <div className="titleD">{watchData?.title}</div>
                {/* Display the live view count */}
                {currentViews !== null && (
                  <div className="viewD">
                    {currentViews.toLocaleString()} views
                  </div>
                )}
              </div>

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

              <div className="slab2">
                <div className="fourCon">
                  <div className="postCon">
                    <Image
                      src={infoData?.poster}
                      alt={infoData?.title}
                      width={160}
                      height={225}
                      className="posterD"
                    />
                  </div>
                  <div className="fourA">
                    <div className="topal">
                      <div className="lpop">
                        {infoData?.about?.Studio && (
                          <>
                            <div className="teamA">Brand</div>
                            <div className="restInfo">
                              {infoData.about.Studio}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="cens">
                        {infoData.censorship === "cen"
                          ? "CENSORED"
                          : "UNCENSORED"}
                      </div>
                    </div>

                    <div className="lpop">
                      {durationString && (
                        <>
                          <div className="teamA">Duration</div>
                          <div className="restInfo">{durationString}</div>
                        </>
                      )}
                    </div>
                    <div className="lpop">
                      {infoData.about["First air date"] && (
                        <>
                          <div className="teamA">Upload Date</div>
                          <div className="restInfo">
                            {infoData.about["First air date"]}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="lpop">
                      {infoData.about["Alternative title"] && (
                        <>
                          <div className="teamA">Alternative title</div>
                          <div className="restInfo">
                            {infoData.about["Alternative title"]}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- Description + Genres --- */}
                <div className="descSlab">
                  {infoData?.genres?.length > 0 && (
                    <div className="tagG">
                      {infoData.genres.map((g, idx) => (
                        <Link
                          key={idx}
                          className="tags"
                          // ⭐️ Applied creator logic to Genre Links
                          href={getUpdatedLink(`/genre/${g.id || g.name}`)}
                        >
                          {g.name || g}
                        </Link>
                      ))}
                    </div>
                  )}
                  {infoData?.synopsis && (
                    <div className="desc1">{infoData.synopsis}</div>
                  )}
                </div>
              </div>
            </div>

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
              url={`https://henpro.fun/watch/${id}`}
              title={watchData.title}
              pageName="this hentai"
              creator={creator}
            />

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

            {/* --- Episode Gallery Inline --- */}
            {infoData.gallery?.length > 0 && (
              <div className="video-section-gallery">
                <h3 className="gallery-heading">Episode Gallery</h3>

                <Swiper
                  spaceBetween={16}
                  slidesPerView={"auto"}
                  pagination={{ clickable: true, dynamicBullets: true }}
                  navigation={{
                    nextEl: `.${nextButtonClass}`,
                    prevEl: `.${prevButtonClass}`,
                    disabledClass: "swiper-button-disabled",
                  }}
                  modules={[Navigation, Pagination]}
                  className="episode-gallery-swiper"
                >
                  {infoData.gallery.map((img, idx) => (
                    <SwiperSlide key={idx} className="swiper-slide-custom">
                      <div
                        className="gallery-card"
                        style={{
                          position: "relative",
                          width: 320,
                          height: 180,
                        }}
                      // onClick={() => setLightboxImg(img)}
                      >
                        <Image
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          width={320}
                          height={180}
                          className="gallery-img"
                        />
                      </div>
                    </SwiperSlide>
                  ))}

                  <div className={prevButtonClass}></div>
                  <div className={nextButtonClass}></div>
                </Swiper>

                {/* --- Lightbox --- */}
                {lightboxImg && (
                  <div
                    className="lightbox-overlay"
                    onClick={() => setLightboxImg(null)}
                  >
                    <div
                      className="lightbox-content"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className="lightbox-close"
                        onClick={() => setLightboxImg(null)}
                      >
                        &times;
                      </span>
                      <img src={lightboxImg} alt="Expanded" />
                    </div>
                  </div>
                )}
              </div>
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

            <CommentSection contentId={contentId} showToast={showCustomToast} creator={creator} />

            <div>
              {/* RelatedGrid component handles its own internal links, but if it contained an external view-all link, it would need the creator logic passed in */}
              <RelatedGrid related={infoData.related || []} creator={creator} />
            </div>
          </div>

          {/* --- Recommendations --- */}
          {recommendations?.length > 0 && (
            <div className="kalu">
              {recommendations.map((i) => (
                <Link
                  key={i.id}
                  className="alliu"
                  // ⭐️ Applied creator logic to Recommendation Links
                  href={getUpdatedLink(`/watch/${i.id}`)}
                >
                  <div className="fixed-size-container">
                    <img
                      src={i.banner || i.image || i.poster}
                      alt={i.title}
                      className="fixed-size-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="iopu">
                    <div className="titleo">{i.title}</div>
                    {i.views && <div className="lopi">{i.views} views</div>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="sidc">
          <div className="episode-list">
            <h3 className="episode-heading">Episodes</h3>
            <div className="epsi">
              {infoData?.episodes?.length > 0 ? (
                infoData.episodes.map((ep, idx) => {
                  // Extract episode number (from title or slug)
                  const match = ep.title.match(/(\d+)/);
                  const episodeNumber = match ? parseInt(match[1], 10) : null;

                  // Compare with current progress episode number
                  const isCurrent = episodeNumber === progressEpisodeNo;

                  return (
                    <Link
                      key={idx}
                      // ⭐️ Applied creator logic to Episode Links
                      href={getUpdatedLink(`/watch/${ep.slug}`)}
                      className={`episode-card ${isCurrent ? "current-ep" : ""
                        }`}
                    >
                      <img
                        src={ep.image}
                        alt={ep.title}
                        className="ep-thumb"
                        loading="lazy"
                      />
                      <div className="ep-info">
                        <div className="ep-title">{ep.title}</div>
                        <div className="ep-meta">
                          <span className="ep-date">{ep.date}</span>
                          <span className="dot">•</span>
                          <span className="ep-cen">
                            {infoData.censorship || "Censored"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="no-episodes">No episodes available.</div>
              )}
            </div>
          </div>

          <Sidebar sidebar={watchData.sidebar} creator={creator} />
        </div>
      </div>
      {!adClosed && <Loading onClose={() => setAdClosed(true)} />}
      <Footer creator={creator} />

      <style jsx>{`
        /* --- WATCHLIST BUTTON STYLES (REQUIRED) --- */
        .watchlist-button-container {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          align-items: center;
        }
        .watchlist-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          min-width: 150px;
          justify-content: center;
          color: #fff;
        }

        .watchlist-add {
          background-color: #ff9741;
          color: #1a1a1a;
        }
        .watchlist-add:hover {
          background-color: #e6883b;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(255, 151, 65, 0.4);
        }

        .watchlist-status {
          background-color: #4a4a4a;
        }
        .watchlist-status:hover {
          background-color: #5a5a5a;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
        }

        .watchlist-status-dropdown {
          padding: 10px 15px;
          border-radius: 8px;
          background-color: #2c2c2c;
          color: #fff;
          border: 1px solid #4a4a4a;
          cursor: pointer;
          font-weight: 500;
          transition: border-color 0.2s;
        }
        .watchlist-status-dropdown:hover {
          border-color: #ff9741;
        }
        .watchlist-status-dropdown option[value="null"] {
          color: #ff4141;
          font-weight: 700;
        }

        /* --- REST OF ORIGINAL STYLES --- */
        .video-section-gallery {
          width: 100%;
          margin: 25px auto 0 auto;
          padding: 20px;
          background: linear-gradient(
            180deg,
            rgba(15, 15, 15, 0.95),
            rgba(10, 10, 10, 0.9)
          );
          border-radius: 16px;
          box-shadow: 0 0 25px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          font-family: "Poppins", sans-serif;
          position: relative;
        }

        .gallery-heading {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 20px;
          border-left: 4px solid #ff9741;
          padding-left: 12px;
          letter-spacing: 0.5px;
          background: linear-gradient(90deg, #ff9741, #a86cf9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .swiper-slide-custom {
          width: 320px !important;
          height: 180px;
        }

        .gallery-card {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .gallery-card:hover {
          transform: scale(1.05);
          box-shadow: 0 0 25px #ff9741aa;
        }

        .gallery-img {
          object-fit: cover;
          width: 100%;
          height: 100%;
          transition: transform 0.4s ease;
        }

        .gallery-card:hover .gallery-img {
          transform: scale(1.08);
        }

        .swiper-button-next,
        .swiper-button-prev {
          width: 40px;
          height: 40px;
          margin-top: 0;
          color: #ff9741;
          background: rgba(30, 30, 30, 0.8);
          border-radius: 50%;
          transform: translateY(-50%);
          transition: all 0.3s ease;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
        }

        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 1.2rem;
          font-weight: bold;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: #ff9741;
          color: #0b0b0b;
          opacity: 1;
        }

        .swiper-button-disabled {
          opacity: 0.3 !important;
          cursor: not-allowed;
        }

        .swiper-pagination-bullet {
          background: #555;
          opacity: 1;
          transition: all 0.3s ease;
        }

        .swiper-pagination-bullet-active {
          background: #ff9741;
          transform: scale(1.2);
        }

        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .lightbox-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
        }

        .lightbox-content img {
          width: 100%;
          height: auto;
          border-radius: 12px;
          object-fit: contain;
        }

        .lightbox-close {
          position: absolute;
          top: -15px;
          right: -15px;
          font-size: 2rem;
          color: #ff9741;
          cursor: pointer;
          font-weight: bold;
        }

        @media (max-width: 1024px) {
          .video-section-gallery {
            max-width: 95vw;
            padding: 15px;
          }
        }
      `}</style>
    </>
  );
}
