"use client";
import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import Link from "next/link";
import { IoMdHome } from "react-icons/io";
// import { useSearchParams } from "next/navigation"; // ⭐️ Import useSearchParams
import "./navSideBar.css";

// /watch 

export default function NavSidebar({ sidebarIsOpen, setSidebarIsOpen, creator

}) {
  // ⭐️ Retrieve the creator parameter
  // const searchParams = useSearchParams(); 
  const creat = creator;

  // ⭐️ Helper function to append the creat parameter to a URL
  const getUpdatedLink = (baseLink) => {
    if (!creat) return baseLink;

    // Check if the link is external (unlikely for a sidebar)
    if (baseLink.startsWith("http")) return baseLink;

    const separator = baseLink.includes("?") ? "&" : "?";
    return `${baseLink}${separator}creator=${creat}`;
  };
  // ------------------------------------

  const genreList = [
    { name: "3D", link: "3d" },
    { name: "Action", link: "action" },
    { name: "Adventure", link: "adventure" },
    { name: "Ahegao", link: "ahegao" },
    { name: "Anal", link: "anal" },
    { name: "Animal Ears", link: "animal-ears" },
    // ... add rest of genres as needed
  ];

  const years = [
    { year: "2025", link: "2025" },
    { year: "2024", link: "2024" },
    { year: "2023", link: "2023" },
    // ... add rest of years as needed
  ];

  // Handler to close the sidebar on link click
  const handleLinkClick = () => {
    setSidebarIsOpen(false);
  };

  return (
    <div
      className="navigation-sidebar f-poppins"
      style={{ zIndex: sidebarIsOpen ? 100 : -1 }}
      onClick={() => setSidebarIsOpen(false)} // Closes when clicking the overlay
    >
      <div
        className="navigation-list flex flex-col"
        style={{
          transform: sidebarIsOpen ? "translateX(250px)" : "translateX(-250px)",
        }}
        // Stop propagation to prevent overlay click from closing the sidebar immediately
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wrap-clos">
          <div
            className="close-menu flex items-center"
            onClick={() => setSidebarIsOpen(false)}
          >
            <FaChevronLeft size={14} />
            Close Menu
          </div>
        </div>

        <div className="navigation-link-list">
          <ul>
            <li>
              {/* ⭐️ APPLY creator logic to Home link */}
              <Link
                href={getUpdatedLink("/")}
                className="homop"
                onClick={handleLinkClick}
              >
                <div className="icono">
                  <IoMdHome />
                </div>
                Home
              </Link>
            </li>
          </ul>

          <div className="button-group">
            <label>Genres</label>
            {genreList.map((genre) => (
              <Link
                key={genre.name}
                // ⭐️ APPLY creator logic to Genre links
                href={getUpdatedLink(`/genre?genre=${genre.link}`)}
                onClick={handleLinkClick}
              >
                {genre.name}
              </Link>
            ))}
          </div>

          <div className="button-group">
            <label>Years</label>
            {years.map((y) => (
              <Link
                key={y.year}
                // ⭐️ APPLY creator logic to Year links
                href={getUpdatedLink(`/release?year=${y.link}`)}
                onClick={handleLinkClick}
              >
                {y.year}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
