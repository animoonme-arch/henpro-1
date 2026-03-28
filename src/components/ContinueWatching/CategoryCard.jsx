"use client";
import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useTransition,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClosedCaptioning,
  faMicrophone,
  faPlay,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import { toast } from "react-hot-toast";
import useToolTipPosition from "@/hooks/useToolTipPosition";
import { useRouter } from "next/navigation";
import "./CategoryCard.css"; // Ensure this path is correct

// =========================================================================
// ⭐️ NEW: CardItem Component for better separation and performance
// =========================================================================
const CardItem = React.memo(
  ({
    item,
    index,
    creator,
    keepIt,
    isLoggedIn,
    handleRemove,
    handleMouseEnter,
    handleMouseLeave,
    hoveredItem,
    showPlay,
    cardRefs,
    getLink,
    formatTime,
    cardStyle,
  }) => {
    // Helper to generate the base creator query string
    const getCreatorQuery = () => (creator ? `&creator=${creator}` : "");

    return (
      <div
        key={item.id + index}
        className={`relative flex flex-col transition-opacity duration-300 ease-in-out group card-container ${item.isRemoving ? "removing" : ""
          }`} // ⭐️ ADDED: 'removing' class
        style={{ height: "fit-content" }}
        ref={(el) => (cardRefs.current[index] = el)}
      >
        {keepIt && (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleRemove(item.id);
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-700 hover:bg-red-800 flex items-center justify-center text-white text-md shadow-lg z-30 opacity-90 hover:opacity-100 transition-all duration-200 remove-button"
            aria-label="Remove from Continue Watching"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}

        <Link
          href={getLink(item, creator)}
          className="w-full relative group hover:cursor-pointer card-link"
          onClick={() =>
            typeof window !== "undefined" &&
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
          onMouseEnter={() => handleMouseEnter(item, index)}
          onMouseLeave={handleMouseLeave}
        >
          {/* Play Icon */}
          {hoveredItem === item.id + index && showPlay && (
            <FontAwesomeIcon
              icon={faPlay}
              className="text-4xl text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-opacity duration-300 play-icon"
            />
          )}

          <div className="overlay"></div>

          {/* Image */}
          <div className="overflow-hidden image-wrapper">
            <img
              // ⭐️ ENHANCEMENT: Use item.poster_w780 for better quality if available, or item.poster
              src={item.poster_w780 || item.poster}
              alt={item.title}
              className={`w-full h-full object-cover ${cardStyle} transform transition-all duration-500 ease-in-out`}
              loading="lazy"
            />
          </div>

          {/* Badges */}
          {(item.tvInfo?.rating === "18+" || item?.adultContent) && (
            <div className="adult-badge">18+</div>
          )}
          <div className="custom-floating-box">
            {item?.sub > 0 && (
              <div className="custom-badge">
                <FontAwesomeIcon icon={faClosedCaptioning} className="text-xs" />
                <p className="text-xs font-bold">{item?.sub}</p>
              </div>
            )}
            {item?.dub > 0 && (
              <div className="custom-badge-blue">
                <FontAwesomeIcon icon={faMicrophone} className="text-xs" />
                <p className="text-xs font-bold">{item?.dub}</p>
              </div>
            )}
            {item?.eps > 0 && (
              <div className="episode-count-badge">
                <p className="text-xs font-extrabold">{item?.eps} EP</p>
              </div>
            )}
          </div>
        </Link>

        {/* Title link */}
        <Link
          // ⬅️ UPDATED: Append creator param to the title link
          href={`/${item.parentContentId || item.id}${getCreatorQuery()}`}
          className="item-title font-medium mt-2 hover:cursor-pointer line-clamp-1"
          title={item.title} // ⭐️ ADDED: Title attribute for accessibility
        >
          {item.title}
        </Link>

        {/* Progress / Statistics */}
        {keepIt ? (
          <div className="card-statK">
            <div className="timoInfo">
              <div className="epnt">
                <div className="font-bold">EP {item.episodeNo}</div>
              </div>
              <div className="durnt">
                <div className="durntS">{formatTime(item.totalSecondsTimo)}</div>
                <div className="durntM">/</div>
                <div className="durntL">{formatTime(item.totalSeconds)}</div>
              </div>
            </div>
            <div className="scaling">
              <div
                className="inlino"
                style={{
                  width: `${item.percentage}%`,
                  minWidth: item.percentage > 0 ? "4px" : "0px",
                }}
              ></div>
            </div>
          </div>
        ) : (
          // Default statistics
          <div className="card-statistics text-gray-400 text-sm font-medium flex items-center gap-x-2 mt-1">
            <span>{item.tvInfo?.duration || item.duration || "N/A"}</span>
            <div className="dot">&#x2022;</div>
            <span>{item.tvInfo?.showType || "TV"}</span>
          </div>
        )}
      </div>
    );
  }
);

CardItem.displayName = "CardItem";

// =========================================================================
// CategoryCard Component
// =========================================================================

const CategoryCard = ({
  label,
  data: rawData,
  showViewMore = true,
  className,
  categoryPage = false,
  cardStyle,
  path,
  limit,
  selectL: language,
  keepIt,
  isLoggedIn,
  creator,
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // ⭐️ NEW: useTransition
  const [showPlay, setShowPlay] = useState(false);

  // ⭐️ ENHANCEMENT: Store *internal* data state to manage removals gracefully
  const [internalData, setInternalData] = useState(rawData || []);

  useEffect(() => {
    // Only update internalData when rawData changes externally (e.g., fetch)
    setInternalData(rawData || []);
  }, [rawData]);

  const data = useMemo(() => {
    // Apply limit to the internal state
    return limit ? internalData.slice(0, limit) : internalData;
  }, [internalData, limit]);

  // --- Layout/Slicing Logic (Highly optimized) ---
  const getItemsToRender = useCallback(() => {
    const shouldSlice =
      categoryPage &&
      typeof window !== "undefined" &&
      window.innerWidth > 758 &&
      data.length > 4;

    if (shouldSlice) {
      return data.slice(0, 4);
    }
    return data;
  }, [categoryPage, data]);

  const [itemsToRender, setItemsToRender] = useState(() => getItemsToRender());

  useEffect(() => {
    const handleResize = () => setItemsToRender(getItemsToRender());
    // Use startTransition for state update inside effect
    startTransition(() => {
      setItemsToRender(getItemsToRender());
    });

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [getItemsToRender, startTransition]);

  // --- Hover and Tooltip Logic ---
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const { tooltipPosition, tooltipHorizontalPosition, cardRefs } =
    useToolTipPosition(hoveredItem, data);

  const handleMouseEnter = useCallback(
    (item, index) => {
      clearTimeout(hoverTimeout);
      const timeout = setTimeout(() => {
        setHoveredItem(item.id + index);
        setShowPlay(true);
      }, 300); // ⭐️ Reduced timeout for slightly snappier UX
      setHoverTimeout(timeout);
    },
    [hoverTimeout]
  );

  const handleMouseLeave = useCallback(() => {
    clearTimeout(hoverTimeout);
    setHoveredItem(null);
    setShowPlay(false);
  }, [hoverTimeout]);

  // --- Conditional Removal Logic (Enhanced with useTransition) ---
  const handleRemove = useCallback(
    async (contentKey) => {
      // 1. Visually fade out the card first
      setInternalData((prevData) =>
        prevData.map((item) =>
          item.id === contentKey ? { ...item, isRemoving: true } : item
        )
      );

      try {
        if (isLoggedIn) {
          const response = await fetch("/api/progress", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentKey }),
          });

          if (!response.ok) {
            throw new Error("Failed to clear progress via API.");
          }
        } else {
          const key = "continueWatching";
          const stored = JSON.parse(localStorage.getItem(key) || "[]");
          const filtered = stored.filter((item) => item.id !== contentKey);
          localStorage.setItem(key, JSON.stringify(filtered));
          localStorage.removeItem(`${contentKey}-time`);
          localStorage.removeItem(`${contentKey}-duration`);
        }

        toast.success("Removed from continue watching!");

        // 2. Remove from state after a brief visual delay
        setTimeout(() => {
          startTransition(() => {
            setInternalData((prevData) =>
              prevData.filter((item) => item.id !== contentKey)
            );
            // Optional: Re-fetch/refresh only if absolutely necessary, but usually not needed after client-side state update
            // router.refresh();
          });
        }, 300); // Match CSS transition duration
      } catch (error) {
        console.error("Removal error:", error);
        toast.error("Could not remove item. Please try again.");

        // 3. Revert visibility on error
        setInternalData((prevData) =>
          prevData.map((item) =>
            item.id === contentKey ? { ...item, isRemoving: false } : item
          )
        );
      }
    },
    [isLoggedIn, startTransition]
  );

  /* ========================= */
  /* LINK FIX (CORE) */
  /* ========================= */

  const getLink = useCallback((item, creator) => {
    const episodeId = item.episodeId || item.contentKey;
    const parentId = item.parentContentId;
    const fallbackId = item.id;

    // 🔑 Determine base type (watch vs special)
    const isSeries = (parentId || fallbackId)?.includes("-id-");

    let basePath;

    if (isSeries) {
      // 👉 WATCH (series / episodes)
      if (parentId && episodeId) {
        basePath = `/watch/${parentId}?ep=${episodeId}`;
      } else {
        basePath = `/watch/${fallbackId}`;
      }
    } else {
      // 👉 SPECIAL (movies / standalone)
      basePath = `/special/${fallbackId}`;
    }

    // 🔗 Append creator if exists
    if (creator) {
      const sep = basePath.includes("?") ? "&" : "?";
      return `${basePath}${sep}creator=${creator}`;
    }

    return basePath;
  }, []);

  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  if (!data.length) return null;
  const finalItemsToRender = categoryPage && typeof window !== "undefined" && window.innerWidth > 758 && data.length > 4 ? data.slice(0, 4) : data;

  // Helper to generate the creator query string for the View More link
  const getCreatorQueryForViewMore = () => (creator ? `&creator=${creator}` : "");

  return (
    <div className={`w-full ${className}`}>
      {/* Header (Title and View More) */}
      {label && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-extrabold text-2xl text-white max-[478px]:text-[1.6rem] capitalize transition-colors">
            {label}
          </h1>
          {showViewMore && (
            <Link
              // ⬅️ UPDATED: Append creator param to View all link
              href={`/${path}${getCreatorQueryForViewMore()}`}
              onClick={() =>
                typeof window !== "undefined" &&
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="flex w-fit items-baseline h-fit rounded-3xl gap-x-1 group view-more-link"
            >
              <p className="text-gray-400 text-[0.8rem] font-semibold group-hover:text-theme transition-all ease-out">
                View all
              </p>
              <FaChevronRight className="text-gray-400 text-[10px] group-hover:text-theme transition-all ease-out text-[10px]" />
            </Link>
          )}
        </div>
      )}

      {/* Card Grid */}
      <div className="grid grid-cols-6 gap-x-5 gap-y-10 mt-2 transition-all duration-300 ease-in-out max-[1400px]:grid-cols-5 max-[1200px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-2">
        {finalItemsToRender.map((item, index) => (
          <CardItem
            key={item.id} // Use item.id as the key for stable identity
            item={item}
            index={index}
            creator={creator}
            keepIt={keepIt}
            isLoggedIn={isLoggedIn}
            handleRemove={handleRemove}
            handleMouseEnter={handleMouseEnter}
            handleMouseLeave={handleMouseLeave}
            hoveredItem={hoveredItem}
            showPlay={showPlay}
            cardRefs={cardRefs}
            getLink={getLink}
            formatTime={formatTime}
            cardStyle={cardStyle}
          />
        ))}
      </div>
    </div>
  );
};

CategoryCard.displayName = "CategoryCard";

export default CategoryCard;