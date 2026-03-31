"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function CreatorProfileClient({ user }) {
  const creator = user?.username
    ? user
    : null; // means no creator data

  const backgroundImageUrl = "/banner.webp";

  // 

  return (
    <div className="relative flex flex-col items-center content-center h-screen max-h-screen overflow-hidden text-white bg-[#0b0b0b]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={backgroundImageUrl}
          alt="Background"
          fill
          className="object-cover object-left opacity-25 sm:opacity-20 md:opacity-10"
          priority
          sizes="100vw"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

      {/* Top Ad */}
      <div className="flex justify-center items-center z-10 h-[15vh] min-h-[90px]">
        <div
          className="flex justify-center items-center w-full max-w-4xl h-full"
          style={{ backgroundColor: "#201f31" }}
        >
          <iframe
            src="/ad"
            title="Top Ad"
            scrolling="no"
            referrerPolicy="no-referrer-when-downgrade"
            style={{
              width: "100%",
              maxWidth: "728px",
              height: "90px",
              border: "none",
              backgroundColor: "#201f31",
            }}
          />
        </div>
      </div>

      {/* Middle Content (Creator Card or Default State) */}
      <div className="flex justify-center items-center flex-[0.7] z-10 px-4">
        {/* If NO CREATOR → Show default */}
        {!creator ? (
          <div
            className="relative backdrop-blur-xl bg-[#1a1a1a]/80 border border-[#ff9741]/30 
                       shadow-[0_0_25px_rgba(255,151,65,0.25)] rounded-2xl p-6 
                       w-[90%] max-w-sm h-[65%] text-center flex flex-col items-center justify-center"
          >
            <img
              src="/pearl.png"
              alt="Default"
              className="w-28 h-28 rounded-full object-cover mb-3 border-4 border-[#ff9741]
                         shadow-[0_0_20px_rgba(255,151,65,0.5)]"
            />

            <h2 className="text-xl font-bold text-[#ff9741] mb-2 tracking-wide">
              Henpro
            </h2>

            <p className="text-gray-300 text-sm mb-4 leading-relaxed max-w-xs">
              Explore exclusive hentai content only on Henpro.
            </p>

            <Link
              href="/"
              className="bg-[#ff9741] hover:bg-[#ff7b1f] text-black font-semibold 
                         px-6 py-3 rounded-full shadow-[0_0_20px_rgba(255,151,65,0.5)] 
                         transition-all text-base"
            >
              🍑 Go to Henpro
            </Link>
          </div>
        ) : (
          /* CREATOR PROFILE */
          <div
            className="relative backdrop-blur-xl bg-[#1a1a1a]/80 border border-[#ff9741]/30 
                       shadow-[0_0_25px_rgba(255,151,65,0.25)] rounded-2xl p-6 
                       w-[90%] max-w-sm h-[65%] text-center flex flex-col items-center justify-center"
          >
            <img
              src={creator.avatar || "/pearl.png"}
              alt={creator.username}
              className="w-28 h-28 rounded-full object-cover mb-3 border-4 border-[#ff9741]
                         shadow-[0_0_20px_rgba(255,151,65,0.5)]"
            />

            <h2 className="text-xl font-bold text-[#ff9741] mb-2 tracking-wide">
              {creator.username}
            </h2>

            <p className="text-gray-300 text-sm mb-4 leading-relaxed max-w-xs">
              {creator.bio ||
                "Welcome to Henpro — explore exclusive hentai content."}
            </p>

            <Link
              href={`/?creator=${creator.username}`}
              className="bg-[#ff9741] hover:bg-[#ff7b1f] text-black font-semibold 
                         px-6 py-3 rounded-full shadow-[0_0_20px_rgba(255,151,65,0.5)] 
                         transition-all text-base"
            >
              🍑 Watch Now
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Ad */}
      <div className="flex justify-center items-center z-10 h-[15vh] min-h-[90px]">
        <div
          className="flex justify-center items-center w-full max-w-4xl h-full"
          style={{ backgroundColor: "#201f31" }}
        >
          <iframe
            src="/ad"
            title="Bottom Ad"
            scrolling="no"
            referrerPolicy="no-referrer-when-downgrade"
            style={{
              width: "100%",
              maxWidth: "728px",
              height: "90px",
              border: "none",
              backgroundColor: "#201f31",
            }}
          />
        </div>
      </div>
    </div>
  );
}
