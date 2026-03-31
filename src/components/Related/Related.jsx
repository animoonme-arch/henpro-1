"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaPlay } from "react-icons/fa";
import { useSearchParams } from "next/navigation"; // ⬅️ Import the hook
import "./RelatedGrid.css"; // Import CSS file

// 

export default function RelatedGrid({ related = [] , creator }) {
  const [cssLoaded, setCssLoaded] = useState(false);
  
  // ⬅️ Get the current search parameters
  // const searchParams = useSearchParams();
  const creatorParam = creator;

  // Helper function to build the query string part
  const getCreatorQuery = () => {
    return creatorParam ? `?creator=${creatorParam}` : "";
  };

  useEffect(() => {
    setCssLoaded(true);
  }, []);

  if (!related || related.length === 0) return null;

  return (
    <div className="related-grid-section">
      <div className="heading-wrapper">
        <h2 className="related-heading">Related Series</h2>
        {/* <p className="total-series">Total: {related.length}</p> */}
      </div>

      <div className="related-grid">
        {related.map((item, index) => (
          <Link 
            // ⬅️ Updated href to include creator query
            href={`/${item.link}${getCreatorQuery()}`} 
            key={index} 
            className="related-card"
          >
            <div className="related-image-wrapper">
              {cssLoaded && (
                <img src={item.poster} alt={item.title} className="related-img" />
              )}
              <FaPlay className="play-icon" />
            </div>
            <div className="related-info">
              <p className="related-title" title={item.title}>
                {item.title.length > 13
                  ? item.title.slice(0, 13) + "..."
                  : item.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}