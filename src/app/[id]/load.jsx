"use client";
import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

export default function Loading({ onClose }) {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  // Optional: prevent scrolling while ad is visible
  useEffect(() => {
    if (visible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-ad">
        <button className="close-btn" onClick={handleClose}>
          <FaTimes />
        </button>
        {/* Replace with your ad content */}
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
        <p className="ad-text">Sponsored Ad</p>
      </div>

      <style jsx>{`
        .loading-overlay {
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

        .loading-ad {
          position: relative;
          max-width: 90%;
          max-height: 90%;
          background: #141414;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          box-shadow: 0 0 25px rgba(255, 151, 65, 0.5);
          animation: fadeIn 0.5s ease;
        }

        .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff9741;
          color: #0b0b0b;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: #a86cf9;
          color: #fff;
        }

        .ad-img {
          max-width: 100%;
          max-height: 60vh;
          object-fit: contain;
          border-radius: 8px;
        }

        .ad-text {
          color: #fff;
          margin-top: 15px;
          font-weight: 600;
          font-size: 1rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
