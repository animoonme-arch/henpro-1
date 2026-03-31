// app/watch/[id]/load.jsx

import Footer from "@/components/footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import React from "react";

// NOTE: This component remains a Server Component (no "use client") for instant loading.

// --- Helper Skeleton Component ---
const SkeletonBlock = ({ className, style }) => (
  // Using a darker gray (#3a3a3a) for the block to contrast with the card background (#2c2c2c)
  <div
    className={`bg-gray-600 rounded-lg animate-pulse ${className}`}
    style={style}
  />
);

// --- Dynamic Color Skeletons for Sidebar ---
const coloredSkeletons = [
  { color: "#ff9741", width: "90px" }, // Orange
  { color: "#5aa9e6", width: "80px" }, // Blue
  { color: "#a86cf9", width: "100px" }, // Purple
  { color: "#6dd47e", width: "75px" }, // Green
  { color: "#f76e6e", width: "85px" }, // Red
];

// --- Main Loading Component ---
export default function Loading() {
  return (
    <>
      <Navbar now={false} />
      {/* // Main wrapper is full width with controlled padding: */}
      <div className="w-full min-h-screen pb-10 px-4 lg:px-5 text-white">
        {/* Content Container */}
        <div className="flex flex-col">
          {/* Main Content and Sidebar Flex Container */}
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Left/Main Area (Watc) */}
            <div className="flex-grow flex flex-col gap-5 lg:w-[70%] xl:w-[73%]">
              {/* Video Player Placeholder (16:9 Aspect Ratio) */}
              <div className="w-full relative pt-[56.25%] rounded-xl overflow-hidden shadow-2xl bg-[#2c2c2c]">
                <SkeletonBlock className="absolute inset-0" />
              </div>

              {/* Info Section - Aesthetic Card background */}
              <div className="bg-[#2c2c2c] rounded-xl shadow-xl p-4 flex flex-col gap-4">
                {/* Title and Views (slab1) */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                  <SkeletonBlock style={{ width: "60%", height: "30px" }} />
                  <SkeletonBlock style={{ width: "100px", height: "20px" }} />
                </div>

                {/* Watchlist Button */}
                <SkeletonBlock
                  className="mt-2 mb-4"
                  style={{
                    width: "150px",
                    height: "40px",
                    borderRadius: "9999px",
                  }}
                />

                {/* Poster and Details (slab2) */}
                <div className="flex gap-4 items-start">
                  {/* Poster */}
                  <SkeletonBlock
                    style={{ width: "160px", height: "225px", flexShrink: 0 }}
                  />

                  {/* Details (fourA) */}
                  <div className="flex flex-col flex-grow pt-2 gap-3">
                    <SkeletonBlock className="h-4" style={{ width: "80%" }} />
                    <SkeletonBlock className="h-4" style={{ width: "60%" }} />
                    <SkeletonBlock className="h-4" style={{ width: "70%" }} />
                    <SkeletonBlock className="h-4" style={{ width: "50%" }} />
                  </div>
                </div>

                {/* Description/Synopsis - Inner dark background */}
                <div className="mt-4 flex flex-col gap-2 p-3 bg-gray-800 rounded-lg">
                  {/* Tags/Genres */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <SkeletonBlock style={{ width: "60px", height: "18px" }} />
                    <SkeletonBlock style={{ width: "70px", height: "18px" }} />
                    <SkeletonBlock style={{ width: "50px", height: "18px" }} />
                  </div>

                  {/* Description lines */}
                  <SkeletonBlock className="h-3.5" style={{ width: "90%" }} />
                  <SkeletonBlock className="h-3.5" style={{ width: "95%" }} />
                  <SkeletonBlock className="h-3.5" style={{ width: "50%" }} />
                </div>
              </div>

              {/* Comments Placeholder (Stays on the left/main column) */}
              <div className="py-2 mt-5">
                <h3 className="text-xl font-bold mb-4 border-l-4 border-[#ff9741] pl-3">
                  COMMENTS
                </h3>
                <SkeletonBlock
                  style={{ height: "200px", width: "100%" }}
                  className="rounded-xl shadow-lg bg-[#2c2c2c]"
                />
              </div>

              {/* Related Grid Section */}
              <div className="w-full my-10 px-0">
                {/* Related Heading Wrapper */}
                <div className="flex justify-between items-center mb-5">
                  {/* Heading with orange color mimic */}
                  <h2 className="text-2xl font-extrabold tracking-wider uppercase text-[#ff9741]">
                    Related Series
                  </h2>
                  {/* Total series count placeholder */}
                  <SkeletonBlock
                    style={{ width: "100px", height: "20px" }}
                    className="rounded-full"
                  />
                </div>

                {/* Related Grid - Responsive grid layout (6 columns on desktop) */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-5">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="relative overflow-hidden cursor-pointer"
                    >
                      {/* Image Wrapper */}
                      <div className="w-full relative pt-[150%] rounded-lg overflow-hidden shadow-lg bg-[#2c2c2c]">
                        <SkeletonBlock className="absolute inset-0" />
                      </div>
                      {/* Title */}
                      <div className="p-2 text-center">
                        <SkeletonBlock
                          className="h-4 mx-auto"
                          style={{ width: "70%", backgroundColor: "#ff974133" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------------------- */}
            {/* Right Sidebar Area (Sidc) - EPISODES LIST + SIDEBAR COMPONENTS */}
            {/* -------------------------------------------------------------------------- */}
            <div className="w-full flex-shrink-0 flex flex-col gap-4 pt-4 lg:w-[30%] xl:w-[27%]">
              {/* EPISODES LIST SKELETON (Matching .episode-list styles) */}
              <div
                className="p-4 rounded-2xl shadow-2xl"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15,15,15,0.95) 0%, rgba(10,10,10,0.9) 100%)",
                  maxHeight: "85vh",
                  overflowY: "hidden", // Hide scroll for the skeleton
                }}
              >
                <h3
                  className="text-xl font-bold mb-4 border-l-4 border-[#ff9741] pl-3 uppercase"
                  style={{ color: "#ff9741" }}
                >
                  Episodes
                </h3>

                {/* Episode Cards (Matching .epsi/.episode-card styles) */}
                <div className="flex flex-col gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-2 bg-gray-900 rounded-xl shadow-md border-l-4 border-[#141414]"
                    >
                      {/* Thumbnail */}
                      <SkeletonBlock
                        className="flex-shrink-0"
                        style={{ width: "130px", height: "90px" }}
                      />

                      {/* Title and Meta */}
                      <div className="flex flex-col flex-grow pt-1.5 gap-2 w-full">
                        {/* Title */}
                        <SkeletonBlock
                          className="h-4"
                          style={{ width: "90%" }}
                        />
                        {/* Date/Meta (using orange accent for censor placeholder) */}
                        <div className="flex gap-2">
                          <SkeletonBlock
                            className="h-3"
                            style={{ width: "40%" }}
                          />
                          <SkeletonBlock
                            className="h-3 rounded-full"
                            style={{
                              width: "30%",
                              backgroundColor: "#ff974144",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIDEBAR SKELETON (Matching previous Sidebar component) */}
              <div
                className="w-full text-white rounded-2xl p-4 shadow-2xl"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15,15,15,0.95) 0%, rgba(10,10,10,0.9) 100%)",
                }}
              >
                {/* Title */}
                <h2
                  className="text-xl font-bold mb-4 text-center tracking-wide"
                  style={{ color: "#ff9741" }}
                >
                  EXPLORE MORE
                </h2>

                {/* Switch Buttons */}
                <div className="flex justify-center mb-5 bg-[#0b0b0b] rounded-xl overflow-hidden">
                  <SkeletonBlock
                    className="h-10 rounded-none w-1/2 bg-gray-700"
                    style={{ backgroundColor: "#333" }}
                  />
                  <SkeletonBlock
                    className="h-10 rounded-none w-1/2 bg-gray-800"
                    style={{ backgroundColor: "#222" }}
                  />
                </div>

                {/* Anime List Skeleton (Popular/Newest) */}
                <div className="flex flex-col gap-3 mb-7">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-[#111] rounded-xl p-2 shadow-md"
                    >
                      {/* Poster */}
                      <SkeletonBlock
                        className="flex-shrink-0"
                        style={{ width: "70px", height: "95px" }}
                      />

                      {/* Title and Year */}
                      <div className="flex flex-col gap-2 w-full">
                        <SkeletonBlock
                          className="h-4"
                          style={{ width: "85%" }}
                        />
                        <SkeletonBlock
                          className="h-3"
                          style={{ width: "40%", marginTop: "4px" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Genres Skeleton */}
                <div className="mb-6">
                  <SkeletonBlock
                    className="h-5 mb-3 border-b border-gray-700 rounded-sm"
                    style={{ width: "60%" }}
                  />
                  <div className="max-h-[230px] pr-2 flex flex-col gap-2">
                    {coloredSkeletons.map((skel, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center w-full px-4 py-2 rounded-xl bg-[#0d0d0d] shadow-sm"
                        style={{ borderLeft: `4px solid ${skel.color}` }}
                      >
                        <SkeletonBlock
                          className="h-4 rounded-full"
                          style={{
                            width: skel.width,
                            backgroundColor: skel.color + "44",
                          }}
                        />
                        <SkeletonBlock
                          className="h-3 rounded-full"
                          style={{ width: "30px" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Years Skeleton */}
                <div>
                  <SkeletonBlock
                    className="h-5 mb-3 border-b border-gray-700 rounded-sm"
                    style={{ width: "40%" }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {coloredSkeletons.map((skel, i) => (
                      <SkeletonBlock
                        key={i}
                        className="px-3 py-1 rounded-xl h-6"
                        style={{
                          width: skel.width,
                          backgroundColor: skel.color + "44",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
