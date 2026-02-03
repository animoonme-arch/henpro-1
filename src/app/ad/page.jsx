"use client";
import Script from "next/script";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [adVisible, setAdVisible] = useState(false);
  const adContainerId = "container-917495758f35e40004f3af3fe8c04eb8";

  useEffect(() => {
    const adContainer = document.getElementById(adContainerId);
    if (!adContainer) return;

    // Function to check if the ad has loaded (checking for any children)
    const checkAdLoaded = (observer) => {
      // Check for any children (the ad content, likely an iframe)
      if (adContainer.childNodes.length > 0) {
        // Set visible immediately once a child node is detected
        setAdVisible(true);
        observer?.disconnect();
      }
    };

    // Setup the MutationObserver
    const observer = new MutationObserver((mutationsList, obs) => {
      checkAdLoaded(obs);
    });

    observer.observe(adContainer, { childList: true });
    checkAdLoaded(observer); // Initial check

    // Cleanup function
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#201f31",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90px",
        width: "100%",
        overflow: "hidden", // Crucial for hiding sliding content
        color: "#fff",
        position: "relative", // Crucial for absolute positioning of children
      }}
    >
      {/* Ad Script */}
      <Script
        src="//capriceawelessaweless.com/917495758f35e40004f3af3fe8c04eb8/invoke.js"
        strategy="afterInteractive"
        data-cfasync="false"
        async
      />

      {/* 1. Ad Container (Full Frame, Slides In) */}
      <div
        id={adContainerId}
        style={{
          // *** Full Width/Height for Parent Frame Coverage ***
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          // --------------------------------------------------

          zIndex: 10, // On top
          opacity: adVisible ? 1 : 0, // Fade In
          transform: `translateY(${adVisible ? "0" : "100%"})`, // Slide In from bottom
          transition: "opacity 0.8s ease, transform 0.8s ease",

          // Aesthetic Styles (Applied only to container, not the ad content itself)
          borderTop: "1.5px solid rgba(255,151,65,0.5)",
          borderBottom: "1.5px solid rgba(255,151,65,0.5)",
          boxShadow: adVisible
            ? "0 0 25px rgba(255,151,65,0.25), inset 0 0 18px rgba(255,151,65,0.1)"
            : "none",
          background:
            "linear-gradient(135deg, rgba(255,151,65,0.08), rgba(255,151,65,0.03))",
          borderRadius: "0px",
          overflow: "hidden",
        }}
      />

      {/* 2. Placeholder Text (Full Frame, Slides Out) */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",

          // *** Full Width/Height for Parent Frame Coverage ***
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          // --------------------------------------------------

          background:
            "linear-gradient(135deg, rgba(255,151,65,0.15), rgba(255,151,65,0.05))",
          borderTop: "1.5px solid #ff9741",
          borderBottom: "1.5px solid #ff9741",
          boxShadow:
            "0 0 25px rgba(255,151,65,0.2), inset 0 0 12px rgba(255,151,65,0.15)",
          color: "#ff9741",
          fontWeight: "600",
          letterSpacing: "0.8px",
          textTransform: "uppercase",

          transform: `translateY(${adVisible ? "-100%" : "0"})`, // Slide Out to the top
          opacity: adVisible ? 0 : 1, // Fade Out
          transition: "transform 0.8s ease-in-out, opacity 0.8s ease-in-out", // Use synchronized transition time
          overflow: "hidden",
          fontSize: "15px",
          zIndex: 5, // Under the ad
        }}
      >
        {/* Shimmer Layer */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, rgba(255,151,65,0.1) 0%, rgba(255,151,65,0.03) 50%, rgba(255,151,65,0.1) 100%)",
            animation: "shimmer 2.5s infinite linear",
            opacity: 0.5,
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          This is a <span style={{ color: "#fff" }}>Sponsored Ad</span>
        </div>
      </div>

      {/* Glow Animation for Aesthetic */}
      {/* ... (Glow animation code remains unchanged) ... */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background:
            "radial-gradient(circle at center, rgba(255,151,65,0.1), transparent 70%)",
          animation: "pulse 5s infinite alternate ease-in-out",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse {
          0% {
            opacity: 0.3;
            transform: scale(1);
          }
          100% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};
 
export default Page;
