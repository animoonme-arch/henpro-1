"use client";
import React from "react";
import { FaBell, FaCog, FaHeart, FaHistory, FaUser } from "react-icons/fa";
import Link from "next/link";
import "./slab.css";
import { useSession } from "next-auth/react";
import { FaSackDollar } from "react-icons/fa6";
// ⭐️ IMPORT useSearchParams
import { useSearchParams } from "next/navigation";

// /watch

export default function Slab(props) {
  const { data: session } = useSession();

  // ⭐️ Get the creator parameter from the URL
  // const searchParams = useSearchParams();
  const creator = props.creator;

  // ⭐️ Helper function to append the creator parameter to a URL
  const getUpdatedLink = (baseLink) => {
    if (!creator || baseLink.startsWith("http")) return baseLink;

    const separator = baseLink.includes("?") ? "&" : "?";
    return `${baseLink}${separator}creator=${creator}`;
  };
  // --------------------------------------------------------

  // Use the same avatar replacement logic as the Navbar to ensure the image loads
  const avatarSrc =
    session?.user?.avatar?.replace(
      "https://img.flawlessfiles.com/_r/100x100/100/avatar/",
      "https://cdn.noitatnemucod.net/avatar/100x100/"
    ) || "/default-banner.jpg"; // Fallback to a default banner image

  return (
    <div className="profile-slab-header">
      {/* Background Image: Used for the blurred effect */}
      <img
        className="slab-background-img"
        src={avatarSrc}
        alt="User Profile Background"
      />

      {/* Content Container (sits above the blurred background) */}
      <div className="slab-content">
        <h1 className="slab-greeting">
          Hi, {session?.user?.username || "Guest"}
        </h1>

        {/* Navigation Links */}
        <div className="slab-nav-links">
          <Link
            // ⭐️ Applied creator logic
            href={getUpdatedLink("/user/profile")}
            className={`nav-link-item ${
              props.slabId === "profile" ? "active-link" : ""
            }`}
          >
            <div className="nav-icon">
              <FaUser />
            </div>
            <div className="nav-label">Profile</div>
          </Link>

          <Link
            // ⭐️ Applied creator logic
            href={getUpdatedLink("/user/continue-watching")}
            className={`nav-link-item ${
              props.slabId === "continue watching" ? "active-link" : ""
            }`}
          >
            <div className="nav-icon">
              <FaHistory />
            </div>
            <div className="nav-label">Watching</div>
          </Link>

          <Link
            // ⭐️ Applied creator logic
            href={getUpdatedLink("/user/watch-list")}
            className={`nav-link-item ${
              props.slabId === "watch list" ? "active-link" : ""
            }`}
          >
            <div className="nav-icon">
              <FaHeart />
            </div>
            <div className="nav-label">Watch List</div>
          </Link>

          <Link
            // ⭐️ Applied creator logic
            href={getUpdatedLink("/user/notification")}
            className={`nav-link-item ${
              props.slabId === "notification" ? "active-link" : ""
            }`}
          >
            <div className="nav-icon">
              <FaBell />
            </div>
            <div className="nav-label">Notifications</div>
          </Link>

          {/* <Link
            // ⭐️ Applied creator logic
            href={getUpdatedLink("/user/settings")}
            className={`nav-link-item ${
              props.slabId === "settings" ? "active-link" : ""
            }`}
          >
            <div className="nav-icon">
              <FaCog />
            </div>
            <div className="nav-label">Settings</div>
          </Link> */}

          <Link
            // ⭐️ Applied creator logic
            href={getUpdatedLink("/monetize")}
            className={`nav-link-item ${
              props.slabId === "monetize" ? "active-link" : ""
            }`}
          >
            <div className="nav-icon monetize-icon">
              <FaSackDollar />
            </div>
            <div className="nav-label">Monetize</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
