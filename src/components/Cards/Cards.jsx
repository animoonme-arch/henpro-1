"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaPlay,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation"; // ⬅️ Import useSearchParams
import "./card.css";

export default function Series({ data = {}, link, heading, creator }) {
  const router = useRouter();
  // const searchParams = useSearchParams(); // ⬅️ Get search params
  const creatorParam = creator; // ⬅️ Get creator param

  const [cssLoaded, setCssLoaded] = useState(false);
  const items = data?.data?.series || [];
  const pagination = data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
  };
  const { currentPage, totalPages } = pagination;

  useEffect(() => setCssLoaded(true), []);

  // Helper function to build the creator query string
  const getCreatorQuery = () => {
    return creatorParam ? `&creator=${creatorParam}` : ""; // Start with '&' for appending
  };

  // Helper function to build the creator query string for the initial '?'
  const getCreatorQueryForLink = () => {
    return creatorParam ? `?creator=${creatorParam}` : ""; // Start with '?' for Link href
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      // Determine if '?' or '&' is needed before 'page='
      // We assume 'link' is the base path (e.g., 'genre?genre=action')
      const initialSeparator = link.includes("?") ? "&" : "?";

      // Construct the full path, adding page and then the creator param
      let newLink = `/${link}${initialSeparator}page=${page}`;

      // Append the creator parameter if it exists
      if (creatorParam) {
        newLink += `&creator=${creatorParam}`;
      }

      router.push(newLink);
    }
  };

  const normalize = (s) => (s || "").toString().toUpperCase().trim();
  const labelClass = (label) => {
    const l = normalize(label);
    if (l === "CEN" || l === "CENSORED") return "label-cen";
    if (l === "UNC" || l === "UNCENSORED") return "label-unc";
    return "label-default";
  };

  const getPageNumbers = () => {
    let start = Math.max(currentPage - 1, 1);
    let end = Math.min(start + 2, totalPages);
    if (end - start < 2) start = Math.max(end - 2, 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (!items.length)
    return (
      <div className="text-center text-gray-400 mt-10">No series found.</div>
    );

  return (
    <div className="related-grid-section">
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
          loading="lazy"
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
      <div className="heading-wrapper">
        <h2 className="related-heading">{heading}</h2>
        {pagination?.totalSeries > 0 ? (
          <div className="total-series">{pagination.totalSeries}</div>
        ) : (
          ""
        )}
      </div>

      <div className="related-grid">
        {items.map((item, index) => (
          <Link
            key={index}
            // ⬅️ Preserve creator param in series links
            href={`/${item.link || item.id || "#"
              }${getCreatorQueryForLink()}`}
            className="related-card"
          >
            <div className="related-image-wrapper">
              {cssLoaded && (
                <>
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="related-img"
                  />
                  <div className="play-icon">
                    <FaPlay />
                  </div>
                  {item.label && (
                    <span className={`label-tag top ${labelClass(item.label)}`}>
                      {item.label}
                    </span>
                  )}
                  {item.year && (
                    <span className="label-tag bottom year-tag">
                      {item.year}
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="related-info">
              <p className="related-title" title={item.title}>
                {item.title?.length > 13
                  ? item.title.slice(0, 13) + "..."
                  : item.title}
              </p>
            </div>
          </Link>
        ))}
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
          src="/ad2"
          title="Sponsored Ad"
          scrolling="no"
          loading="lazy"
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

      {/* Pagination */}
      <div className="pagination">
        {/* First */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="page-btn"
        >
          <FaAngleDoubleLeft />
        </button>

        {/* Prev */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="page-btn"
        >
          <FaAngleLeft />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((num) => (
          <span
            key={num}
            onClick={() => handlePageChange(num)}
            className={`page-num ${num === currentPage ? "current" : ""}`}
          >
            {num}
          </span>
        ))}

        {/* Next */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="page-btn"
        >
          <FaAngleRight />
        </button>

        {/* Last */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="page-btn"
        >
          <FaAngleDoubleRight />
        </button>
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
          loading="lazy"
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
    </div>
  );
}
