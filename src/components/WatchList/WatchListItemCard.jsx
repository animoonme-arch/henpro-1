"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { FaTimes } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

// --- Utility: Generate Watch Link ---
const getLink = (item, refer, creator) => {
  const itemId = item.contentId;
  const lastWatchedEpId = item.lastEpisodeKey;

  if (!itemId) return "#";

  const basePath = lastWatchedEpId
    ? `/${itemId}`
    : `/${itemId}`;

  const referParam = refer || "weebsSecret";
  const creatorParam = creator
    ? `&creator=${encodeURIComponent(creator)}`
    : "";

  return `${basePath}${basePath.includes("?") ? "&" : "?"}refer=${referParam}${creatorParam}`;
};

// --- Main Component ---
const WatchListItemCard = ({ item, refer, handleDelete, creator }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const itemId = item.contentId;
  const watchLink = getLink(item, refer, creator);

  const updatedAt = useMemo(
    () => (item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : null),
    [item.updatedAt]
  );

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => setIsHovered(true), 300);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => setIsHovered(false), 120);
    setHoverTimeout(timeout);
  };

  const handleTitleClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      className="flex flex-col bg-[#141414] rounded-2xl shadow-md shadow-black/40 overflow-hidden border border-[#222] hover:border-[#ff9741]/50 transition-all duration-300 group"
      style={{ height: "fit-content" }}
    >
      {/* --- Image Wrapper --- */}
      <div className="relative">
        <Link
          href={watchLink}
          className="block relative"
          onClick={handleTitleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Play Button on Hover */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
              }`}
          >
            <FontAwesomeIcon
              icon={faPlay}
              className="text-[42px] text-[#ff9741] drop-shadow-lg"
            />
          </div>

          {/* Poster */}
          <img
            src={item.poster}
            alt={item.title}
            className={`w-full h-[250px] object-cover transform transition-all duration-500 ease-in-out ${isHovered ? "scale-110 blur-[3px]" : "scale-100 blur-0"
              } max-[1200px]:h-[35vw] max-[758px]:h-[45vw] max-[478px]:h-[60vw]`}
          />
        </Link>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleDelete(item._id);
          }}
          className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-700 rounded-full z-[10] transition-colors"
          title="Remove from Watch List"
        >
          <FaTimes className="text-white text-[12px]" />
        </button>
      </div>

      {/* --- Card Details --- */}
      <div className="p-3 flex flex-col">
        {/* Title */}
        <Link
          href={`/${itemId}?refer=${refer || "weebsSecret"}${creator?.username ? `&creator=${encodeURIComponent(creator.username)}` : ""
            }`}
          onClick={handleTitleClick}
          className="text-white font-semibold text-[15px] hover:text-[#ff9741] transition-colors duration-200 truncate"
        >
          {item.title}
        </Link>

        {/* Creator Info */}
        {creator && (
          <div className="flex items-center gap-2 mt-1">
            {creator.avatar && (
              <img
                src={creator.avatar}
                alt={creator.username}
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            <span className="text-[13px] text-gray-400">{creator.username}</span>
          </div>
        )}

        {/* Status + Episode */}
        <div className="flex items-center gap-2 mt-2 text-[13px] text-gray-400">
          <span
            className={`font-semibold px-2 py-[2px] rounded-md bg-[#222] border border-[#333] ${item.status === "Watching"
              ? "text-[#ff9741] border-[#ff9741]/40"
              : item.status === "Completed"
                ? "text-green-400 border-green-500/40"
                : item.status === "Dropped"
                  ? "text-red-400 border-red-500/40"
                  : "text-gray-300"
              }`}
          >
            {item.status}
          </span>
          {item.lastEpisodeNo && (
            <>
              <span className="text-gray-500">•</span>
              <span className="italic">Ep. {item.lastEpisodeNo}</span>
            </>
          )}
        </div>

        {/* Updated At */}
        {updatedAt && (
          <div className="text-[12px] text-gray-500 mt-1">
            Updated: {updatedAt}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchListItemCard;
