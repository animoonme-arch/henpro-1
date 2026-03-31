"use client";
import React, { useState } from "react";
import "./profilo.css";
import {
  FaArrowRight,
  FaBell,
  FaCog,
  FaHeart,
  FaHistory,
  FaUser,
} from "react-icons/fa";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; // ⭐️ Imported useSearchParams
import { FaSackDollar } from "react-icons/fa6";

// 

export default function Profilo(props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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

  const handleSignOut = async () => {
    setLoading(true);
    router.refresh();
    try {
      await signOut({ redirect: false });
      // Close the profile dropdown after successful sign out
      props.setProfiIsOpen(false);
    } catch (err) {
      setError("Error signing out: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Prevent closing the dropdown when clicking inside it
  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  // Use a sensible default avatar if session or avatar is missing
  const avatarSrc =
    session?.user?.avatar?.replace(
      "https://img.flawlessfiles.com/_r/100x100/100/avatar/",
      "https://cdn.noitatnemucod.net/avatar/100x100/"
    ) || "/default-avatar.png";

  return (
    <div
      className={`profip-overlay ${props.profiIsOpen ? "open" : ""}`}
      onClick={() => props.setProfiIsOpen(false)}
    >
      <div className="profip-list-dropdown" onClick={handleDropdownClick}>
        {/* User Info Header */}
        <div className="profip-header">
          <img
            src={avatarSrc}
            alt={session?.user.username || "User"}
            className="profip-avatar"
          />
          <div className="profip-info">
            <div className="profip-username">
              {session?.user.username || "Guest"}
            </div>
            <div className="profip-email">{session?.user.email}</div>
          </div>
        </div>

        <div className="profip-menu-items">
          {/* Menu Items */}
          <Link
            // ⭐️ Applied creator logic
            href={getUpdatedLink("/user/profile")}
            className="profip-menu-item"
            onClick={() => props.setProfiIsOpen(false)}
          >
            <FaUser className="menu-icon" />
            <span className="menu-text">Profile</span>
          </Link>
          <Link
            // ⭐️ Applied creator logic
            href={getUpdatedLink("/user/continue-watching")}
            className="profip-menu-item"
            onClick={() => props.setProfiIsOpen(false)}
          >
            <FaHistory className="menu-icon" />
            <span className="menu-text">Continue Watching</span>
          </Link>
          <Link
            // ⭐️ Applied creator logic
            href={getUpdatedLink("/user-list")}
            className="profip-menu-item"
            onClick={() => props.setProfiIsOpen(false)}
          >
            <FaHeart className="menu-icon" />
            <span className="menu-text">Watch List</span>
          </Link>
          <Link
            // ⭐️ Applied creator logic
            href={getUpdatedLink("/user/notification")}
            className="profip-menu-item"
            onClick={() => props.setProfiIsOpen(false)}
          >
            <FaBell className="menu-icon" />
            <span className="menu-text">Notification</span>
          </Link>
          {/* <Link
            href={getUpdatedLink("/user/settings")}
            className="profip-menu-item"
            onClick={() => props.setProfiIsOpen(false)}
          >
            <FaCog className="menu-icon" />
            <span className="menu-text">Settings</span>
          </Link> */}
          <Link
            // ⭐️ Applied creator logic
            href={getUpdatedLink("/monetize")}
            className="profip-menu-item monetize"
            onClick={() => props.setProfiIsOpen(false)}
          >
            <FaSackDollar className="menu-icon" />
            <span className="menu-text">Monetize</span>
          </Link>
        </div>

        {/* Logout Button */}
        <div className="profip-footer">
          {error && <div className="logout-error">{error}</div>}
          <button
            className="logout-btn"
            onClick={handleSignOut}
            disabled={loading}
          >
            {loading ? "Logging Out..." : "Logout"}
            <FaArrowRight className="logout-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}