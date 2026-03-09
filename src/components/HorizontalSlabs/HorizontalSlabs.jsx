"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function HorizontalSlabs({ data = [], keyword, creator }) {
  if (!data || data.length === 0) return null;

  // const searchParams = useSearchParams();
  const creat = creator;

  // Helper function to append the creat parameter to a URL
  const getUpdatedLink = (baseLink) => {
    if (!creat || baseLink.startsWith("http")) return baseLink;

    const separator = baseLink.includes("?") ? "&" : "?";
    return `${baseLink}${separator}creator=${creat}`;
  };

  return (
    <div className="horizontal-slabs-container">
      <div className="heading-container">
        <h2 className="results-heading">
          Search Results for <span className="keyword">{keyword}</span>
        </h2>
        <div className="heading-line"></div>
      </div>

      <div className="slabs-wrapper">
        {data.map((item) => (
          <Link
            href={getUpdatedLink(item.link)}
            target="_blank"
            key={item.id}
            className="slab-link"
            rel="noopener noreferrer"
          >
            <div className="slab">
              <div className="slab-poster">
                <div className="poster-wrapper">
                  <Image
                    src={item.poster}
                    alt={item.title}
                    width={200}
                    height={280}
                    className="poster-img"
                  />
                  <div className="poster-overlay">
                    <span>▶</span>
                  </div>
                </div>
              </div>

              <div className="slab-info">
                <h3 className="slab-title">{item.title}</h3>
                <p className="slab-year">{item.year}</p>
                <p className="slab-desc">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        /* Main container */
        .horizontal-slabs-container {
          width: 100%;
          padding: 30px 20px;
          color: #fff;
        }

        /* Heading section */
        .heading-container {
          text-align: center;
          margin-bottom: 30px;
          animation: fadeIn 0.8s ease;
        }

        .results-heading {
          font-size: 2.2rem;
          font-weight: 800;
          text-transform: capitalize;
          background: linear-gradient(90deg, #ff9741, #ffb66c, #ffa84d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 0.8px;
          text-shadow: 0 0 10px rgba(255, 151, 65, 0.3);
          margin: 0;
        }

        .keyword {
          background: linear-gradient(90deg, #ffb66c, #ff9741);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .heading-line {
          margin: 10px auto 0;
          width: 180px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #ff9741, transparent);
          border-radius: 50%;
          box-shadow: 0 0 12px #ff9741;
          animation: glow 2s infinite alternate;
        }

        @keyframes glow {
          from {
            opacity: 0.5;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Slabs styling */
        .slabs-wrapper {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .slab-link {
          text-decoration: none;
          color: inherit;
        }

        .slab {
          display: flex;
          align-items: flex-start;
          background: linear-gradient(145deg, #171717, #1e1e1e);
          border-radius: 14px;
          overflow: hidden;
          width: 100%;
          padding: 16px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5);
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.05);
          cursor: pointer;
        }

        .slab:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.7);
          background: linear-gradient(145deg, #1d1d1d, #242424);
        }

        .poster-wrapper {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          transition: transform 0.35s ease;
        }

        .slab:hover .poster-wrapper {
          transform: scale(1.05);
        }

        .poster-img {
          border-radius: 10px;
          object-fit: cover;
          width: 180px;
          height: 250px;
        }

        .poster-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.55);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .slab:hover .poster-overlay {
          opacity: 1;
        }

        .poster-overlay span {
          color: #ff9741;
          font-size: 2rem;
          font-weight: bold;
          transform: scale(1);
          transition: transform 0.3s ease;
        }

        .slab:hover .poster-overlay span {
          transform: scale(1.3);
        }

        .slab-info {
          margin-left: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .slab-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #ff9741;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .slab-year {
          font-size: 0.9rem;
          opacity: 0.75;
          margin-bottom: 10px;
        }

        .slab-desc {
          font-size: 1rem;
          opacity: 0.9;
          line-height: 1.55;
          max-height: 4.6em;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #e0e0e0;
        }

        /* Responsive */
        @media (max-width: 700px) {
          .results-heading {
            font-size: 1.8rem;
          }

          .heading-line {
            width: 130px;
            height: 2px;
          }

          .slab {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .poster-img {
            width: 100%;
            height: auto;
          }

          .slab-info {
            margin-left: 0;
            margin-top: 12px;
          }

          .slab-title {
            font-size: 1.2rem;
          }

          .slab-desc {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}
