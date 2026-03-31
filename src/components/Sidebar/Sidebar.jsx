"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
// Import the necessary hook from next/navigation
// import { useSearchParams } from "next/navigation";

// 

export default function Sidebar({ sidebar = {}, creator }) {
  const [activeTab, setActiveTab] = useState("popular");
  // Get the current search parameters
  // const searchParams = useSearchParams();
  const creatorParam = creator;

  // A helper function to build the base query string
  // It checks for 'creator' and prepends it to the link's query if present.
  const getBaseQuery = () => {
    return creatorParam ? `creator=${creatorParam}&` : "";
  };

  const colors = ["#ff9741", "#5aa9e6", "#a86cf9", "#6dd47e", "#f76e6e"];
  const getColor = (index) => colors[index % colors.length];

  const list = sidebar[activeTab] || [];
  const genres = sidebar.genre_list || sidebar.genres || [];
  const years = sidebar.years || [];

  return (
    <div
      className="w-full text-white rounded-2xl p-4 backdrop-blur-md"
      style={{
        background:
          "linear-gradient(180deg, rgba(15,15,15,0.95) 0%, rgba(10,10,10,0.9) 100%)",
        boxShadow: "0 0 20px rgba(0,0,0,0.6)",
        fontFamily: "'Poppins', sans-serif",
        marginTop: "30px",
      }}
    >
      {/* --- Title --- */}
      <h2
        className="text-xl font-bold mb-4 text-center tracking-wide"
        style={{
          background: "linear-gradient(90deg,#ff9741,#a86cf9)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Explore More
      </h2>

      {/* --- Switch Buttons (No Change Needed Here) --- */}
      <div className="flex justify-center mb-5 bg-[#0b0b0b] rounded-xl overflow-hidden">
        <button
          className={`px-4 py-2 w-1/2 font-semibold transition-all ${activeTab === "popular"
              ? "bg-gradient-to-r from-[#ff9741] to-[#ffb561] text-black"
              : "text-gray-300 hover:bg-[#1f1f1f]"
            }`}
          onClick={() => setActiveTab("popular")}
        >
          Popular
        </button>
        <button
          className={`px-4 py-2 w-1/2 font-semibold transition-all ${activeTab === "newest"
              ? "bg-gradient-to-r from-[#ff9741] to-[#ffb561] text-black"
              : "text-gray-300 hover:bg-[#1f1f1f]"
            }`}
          onClick={() => setActiveTab("newest")}
        >
          Newest
        </button>
      </div>

      {/* --- Anime List (No Change Needed Here) --- */}
      <div className="flex flex-col gap-3 mb-7 sidebar-anime">
        {list.map((item) => (
          <Link
            key={item.id}
            href={`/${item.link}${creatorParam ? `?creator=${encodeURIComponent(creatorParam)}` : ""
              }`}
            className="flex items-center gap-3 bg-[#111] hover:bg-[#1a1a1a] rounded-xl p-2 transition-all shadow-md hover:shadow-[#ff974133]"
          >
            <div className="relative w-[70px] h-[95px] rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.poster}
                alt={item.title}
                fill
                className="object-cover transform hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold line-clamp-2 leading-tight">
                {item.title}
              </h4>
              <span className="text-xs opacity-75 mt-1">{item.year}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* --- Genres (Updated Link) --- */}
      <div className="mb-6 sidebar-genres">
        <h3 className="text-lg font-semibold mb-3 border-b border-[#333] pb-1 uppercase tracking-wide text-gray-200">
          Genres
        </h3>
        <div className="max-h-[230px] overflow-y-auto pr-2 custom-scroll">
          <div className="genre-grid">
            {genres.map((genre, i) => (
              <Link
                key={genre.slug}
                // *** UPDATED HREF LOGIC ***
                href={`/genre?${getBaseQuery()}genre=${genre.slug}`}
                // ***************************
                className="flex justify-between items-center w-full px-4 py-2 rounded-xl bg-[#0d0d0d] hover:bg-[#181818] transition-all shadow-sm mb-2"
                style={{
                  borderLeft: `4px solid ${getColor(i)}`,
                }}
              >
                <span
                  className="font-medium text-sm"
                  style={{ color: getColor(i) }}
                >
                  {genre.name}
                </span>
                <span className="text-xs text-gray-400 font-light">
                  ({genre.count})
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* --- Years (Updated Link) --- */}
      <div>
        <h3 className="text-lg font-semibold mb-3 border-b border-[#333] pb-1 uppercase tracking-wide text-gray-200">
          Years
        </h3>
        <div className="max-h-[150px] overflow-y-auto pr-2 flex flex-wrap gap-2 custom-scroll">
          {years.map((y, i) => (
            <Link
              key={y.slug}
              // *** UPDATED HREF LOGIC ***
              href={`/release?${getBaseQuery()}year=${y.slug}`}
              // ***************************
              className="px-3 py-1 rounded-xl text-sm font-medium bg-[#111] hover:bg-[#1a1a1a] transition-all shadow-sm"
              style={{ color: getColor(i) }}
            >
              {y.year}
            </Link>
          ))}
        </div>
      </div>

      {/* --- Scrollbar & Responsive Styles (No Change Needed Here) --- */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ff9741, #a86cf9);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ffb561, #c699ff);
          box-shadow: 0 0 6px #ff9741;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #0b0b0b;
        }

        /* ---- Responsive Layout 900px to 600px ---- */
        @media (max-width: 900px) and (min-width: 600px) {
          .sidebar-anime {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .sidebar-anime a {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            padding: 6px;
          }

          .sidebar-anime a div[style] {
            width: 100% !important;
            height: 160px !important;
          }

          .sidebar-anime h4 {
            font-size: 0.85rem;
          }

          /* Genres grid while keeping scroll */
          .sidebar-genres .custom-scroll {
            max-height: 230px;
            overflow-y: auto;
          }
          .sidebar-genres .genre-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            padding-right: 6px;
          }
          .sidebar-genres a {
            margin-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
}
