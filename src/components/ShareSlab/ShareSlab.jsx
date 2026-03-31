"use client";
import React, { useState, useEffect } from "react";
// Replaced external icon imports with inline SVG definitions for compatibility
// Fa, Ai icons are replaced with functional components that return SVG
import {
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaReddit,
  FaTelegramPlane,
  FaLink,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import { AiOutlineClose } from "react-icons/ai";

// /watch

// Replaced 'next/image' with standard 'img' tag and placeholder for image paths
// const Image = ({ src, alt, width, height, className }) => (
//   <img src={src} alt={alt} width={width} height={height} className={className} />
// );

// --- Custom Toast Component ---
const CustomToast = ({ message, type, onClose }) => {
  let Icon = FaInfoCircle;
  if (type === "success") Icon = FaCheckCircle;
  if (type === "error") Icon = FaTimesCircle;

  return (
    <div className={`custom-toast custom-toast-${type}`}>
      <div className="toast-icon-message">
        <Icon className="toast-icon" />
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="toast-close-btn">
        <AiOutlineClose />
      </button>
    </div>
  );
};
// --- End Custom Toast Component ---

export default function ShareSlab({ pageId, url, title, pageName }) {
  const [shareData, setShareData] = useState({ totalShares: 0 });
  // State for managing the custom toast
  const [customToast, setCustomToast] = useState(null);

  // Function to display the custom toast
  const showCustomToast = (message, type = "info") => {
    setCustomToast({ message, type });
    // Hide toast after 4 seconds
    setTimeout(() => {
      setCustomToast(null);
    }, 4000);
  };

  useEffect(() => {
    fetch(`/api/share?pageId=${pageId}`)
      .then((res) => res.json())
      .then((data) => setShareData(data || { totalShares: 0 }));
  }, [pageId]);

  const handleShare = async (platform, shareUrl) => {
    window.open(shareUrl, "_blank", "noopener,noreferrer");

    await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, platform }),
    });

    setShareData((prev) => ({
      ...prev,
      totalShares: (prev.totalShares || 0) + 1,
    }));
  };

  const handleCopy = async () => {
    try {
      // Use navigator.clipboard.writeText for copying
      await navigator.clipboard.writeText(url);
      // Replace alert with custom toast
      showCustomToast("Link copied to clipboard!", "success");

      // Log the copy event
      await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, platform: "copy" }),
      });

      setShareData((prev) => ({
        ...prev,
        totalShares: (prev.totalShares || 0) + 1,
      }));
    } catch (err) {
      console.error("Copy failed", err);
      showCustomToast("Copy failed: Please copy manually.", "error");
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(
      title
    )} ${encodeURIComponent(url)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(
      url
    )}&title=${encodeURIComponent(title)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(title)}`,
  };

  return (
    <>
      {/* Conditionally render the custom toast */}
      {customToast && (
        <CustomToast
          message={customToast.message}
          type={customToast.type}
          onClose={() => setCustomToast(null)}
        />
      )}

      <div className="share-slab">
        <h3 className="share-heading">
          {/* Replaced Next.js Image component with standard img tag */}
          <img
            src="/lefthen.png"
            alt="left"
            width={32}
            height={32}
            className="icon-img"
          />
          <span>Share {pageName}</span>
          <img
            src="/righthen.png"
            alt="right"
            width={32}
            height={32}
            className="icon-img"
          />
        </h3>

        <div className="share-buttons">
          <button
            onClick={() => handleShare("facebook", shareLinks.facebook)}
            aria-label="Share on Facebook"
            style={{ "--platform-color": "#1877F2" }}
          >
            <FaFacebook />
          </button>
          <button
            onClick={() => handleShare("twitter", shareLinks.twitter)}
            aria-label="Share on X (Twitter)"
            style={{ "--platform-color": "#1DA1F2" }}
          >
            <FaTwitter />
          </button>
          <button
            onClick={() => handleShare("whatsapp", shareLinks.whatsapp)}
            aria-label="Share on WhatsApp"
            style={{ "--platform-color": "#25D366" }}
          >
            <FaWhatsapp />
          </button>
          <button
            onClick={() => handleShare("reddit", shareLinks.reddit)}
            aria-label="Share on Reddit"
            style={{ "--platform-color": "#FF4500" }}
          >
            <FaReddit />
          </button>
          <button
            onClick={() => handleShare("telegram", shareLinks.telegram)}
            aria-label="Share on Telegram"
            style={{ "--platform-color": "#229ED9" }}
          >
            <FaTelegramPlane />
          </button>
          <button
            onClick={handleCopy}
            aria-label="Copy Link"
            style={{ "--platform-color": "#9741FF" }}
          >
            <FaLink />
          </button>
        </div>

        <p className="share-count">
          Total shares: {shareData.totalShares || 0}
        </p>

        <style jsx>{`
          @import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap");

          /* --- CUSTOM TOAST STYLES --- */
          .custom-toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
            border-radius: 12px;
            color: #fff;
            min-width: 250px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            font-family: "Poppins", sans-serif;
            animation: slideIn 0.4s ease-out, fadeOut 0.5s ease-in 3.5s forwards;
          }

          .custom-toast-success {
            background-color: #38a169; /* Tailwind green-600 */
            border-left: 5px solid #68d391; /* Light green accent */
          }

          .custom-toast-error {
            background-color: #e53e3e; /* Tailwind red-600 */
            border-left: 5px solid #f56565; /* Light red accent */
          }

          .custom-toast-info {
            background-color: #3182ce; /* Tailwind blue-600 */
            border-left: 5px solid #63b3ed; /* Light blue accent */
          }

          .toast-icon-message {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1rem;
            font-weight: 500;
          }

          .toast-icon {
            font-size: 1.2rem;
            margin-top: -1px;
          }

          .toast-close-btn {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.1rem;
            cursor: pointer;
            padding: 5px;
            margin-left: 15px;
            transition: color 0.2s ease;
          }

          .toast-close-btn:hover {
            color: #fff;
            transform: rotate(90deg);
          }

          @keyframes slideIn {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes fadeOut {
            to {
              opacity: 0;
              transform: translateY(100%);
            }
          }

          @media (max-width: 640px) {
            .custom-toast {
              left: 10px;
              right: 10px;
              bottom: 10px;
              min-width: unset;
            }
          }

          /* --- SHARE SLAB ORIGINAL STYLES --- */
          .share-slab {
            margin-top: 30px;
            background: #141414;
            padding: 24px 20px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 0 25px rgba(255, 151, 65, 0.25);
            transition: transform 0.3s ease;
          }
          .share-slab:hover {
            transform: translateY(-3px);
          }

          .share-heading {
            font-family: "Cinzel", serif; /* Royal-looking font */
            font-size: 1.8rem;
            font-weight: 900;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: #fff;
          }

          .share-heading span {
            background: linear-gradient(90deg, #ff9741, #a86cf9);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            position: relative;
            padding: 0 8px;
          }

          .share-heading span::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -6px;
            width: 100%;
            height: 4px;
            border-radius: 2px;
            background: linear-gradient(90deg, #ff9741, #a86cf9);
            box-shadow: 0 0 12px rgba(255, 151, 65, 0.7);
          }

          .icon-img {
            border-radius: 50%;
          }

          .share-buttons {
            display: flex;
            justify-content: center;
            gap: 14px;
            margin-bottom: 14px;
            flex-wrap: wrap;
          }

          .share-buttons button {
            background: #1e1e1e;
            border: none;
            color: #ff9741;
            font-size: 1.4rem;
            cursor: pointer;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            position: relative;
            border: 2px solid transparent;
          }

          .share-buttons button:hover {
            background: var(
              --platform-color
            ); /* Use variable for hover color */
            color: #fff;
            transform: scale(1.15);
            box-shadow: 0 0 18px rgba(var(--platform-color), 0.7),
              0 0 28px rgba(var(--platform-color), 0.4);
            border-color: #fff;
          }

          /* Specific hover effects for link button (copy) */
          .share-buttons button:last-child:hover {
            color: #fff;
          }

          .share-count {
            color: #aaa;
            font-size: 0.95rem;
          }

          @media (max-width: 480px) {
            .share-buttons button {
              width: 42px;
              height: 42px;
              font-size: 1.2rem;
            }
            .share-heading {
              font-size: 1.5rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}
