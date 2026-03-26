"use client";
import React, { useEffect, useState, useRef } from "react";
import { FaBars, FaSearch, FaTimes } from "react-icons/fa";
import "./navbar.css";
import NavSidebar from "../NavSideBar/NavSideBar";
import Image from "next/image";
import Link from "next/link";
import SignInSignUpModal from "../SignSignup/SignInSignUpModal";
import { useSession } from "next-auth/react";
import Profilo from "../Profilo/Profilo";
// ⭐️ IMPORT useSearchParams
import { useSearchParams } from "next/navigation";

const Navbar = (props) => {
  const [focused, setFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profiIsOpen, setProfiIsOpen] = useState(false);
  const [logIsOpen, setLogIsOpen] = useState(false);

  const timeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  const { data: session } = useSession();

  // ⭐️ GET creator PARAMETER
  // const searchParams = useSearchParams();
  const creat = props.creator;

  const toggleSignInModal = (isOpen) => setLogIsOpen(isOpen);
  const toggleProfile = () => setProfiIsOpen((prev) => !prev);

  // ⭐️ HELPER FUNCTION TO APPEND CREAt
  const getUpdatedLink = (baseLink) => {
    if (!creat || baseLink.startsWith("http")) return baseLink;

    const separator = baseLink.includes("?") ? "&" : "?";
    return `${baseLink}${separator}creator=${creat}`;
  };
  // ------------------------------------

  // 🧭 Handle scroll effect for 'dark' background
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔍 Fetch search suggestions with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // Debounce 0.5s

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [searchQuery]);

  const handleBlur = (e) => {
    setTimeout(() => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(document.activeElement) &&
        !document.activeElement.closest(".search-dropdown")
      ) {
        setFocused(false);
      }
    }, 150);
  };

  const handleMobileClose = () => {
    setShowMobileSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchLinkClick = () => {
    setSearchQuery("");
    setSearchResults([]);
    setFocused(false);
    setShowMobileSearch(false);
  };

  const getAvatarUrl = (userSession) => {
    return (
      userSession?.user.avatar?.replace(
        "https://img.flawlessfiles.com/_r/100x100/100/avatar/",
        "https://cdn.noitatnemucod.net/avatar/100x100/"
      ) || "/default-avatar.png"
    );
  };

  // 🔗 Helper for 'View all results' link construction (now integrates getUpdatedLink)
  const createSearchUrl = (query) => {
    const params = new URLSearchParams({ q: query });
    const baseUrl = `/search?${params.toString()}`;
    return getUpdatedLink(baseUrl); // ⭐️ Apply creator logic here
  };

  return (
    <>
      {/* Sign In / Sign Up Modal */}
      {logIsOpen && (
        <SignInSignUpModal
          logIsOpen={logIsOpen}
          setLogIsOpen={setLogIsOpen}
          sign={toggleSignInModal}
          creator={creat}
        />
      )}

      {/* User Profile Modal */}
      {profiIsOpen && (
        <Profilo setProfiIsOpen={setProfiIsOpen} profiIsOpen={profiIsOpen} creator={creat} />
      )}

      {/* Navigation Sidebar */}
      <NavSidebar
        sidebarIsOpen={sidebarIsOpen}
        setSidebarIsOpen={setSidebarIsOpen}
        creator={creat}
      />

      {/* 📱 Floating mobile search bar + dropdown */}
      {showMobileSearch && (
        <div className="floating-search-wrapper">
          <div className="floating-search">
            <FaSearch className="mobile-search-icon" />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaTimes className="close-icon" onClick={handleMobileClose} />
          </div>

          {/* ⬇️ Dropdown for mobile search */}
          {searchQuery && (
            <div className="floating-search-dropdown">
              {isLoading && <div className="search-loading">Loading...</div>}
              {!isLoading && searchResults.length === 0 && (
                <div className="search-empty">No results found</div>
              )}

              {searchResults.slice(0, 6).map((result, idx) => {
                let finalUrl = "#";

                if (result?.source === "hanime") {
                  const safeUrl = result?.url
                    ? result.url.replace("https://watchhentai.net/series/", "")
                    : "";
                  finalUrl = getUpdatedLink(`/watch/${safeUrl}`);
                } else if (result?.source === "special") {
                  finalUrl = result.url
                    .replace("https://3dhentai.co/", "https://hentaio.pro/special/")
                    .replace(/\/$/, ""); // remove trailing slash
                }

                return (
                  <Link
                    key={idx}
                    href={finalUrl}
                    className="search-item"
                    onClick={handleMobileClose}
                  >
                    <img
                      src={result?.img || "/placeholder.jpg"}
                      alt={result?.title || "No title"}
                      className="search-thumb"
                    />

                    <div className="search-info">
                      <p className="search-title">
                        {result?.title || "Untitled"}
                      </p>

                      <div className="search-meta">
                        <span className="search-date">
                          {result?.date || "N/A"}
                        </span>

                        <span className={`search-source ${result?.source}`}>
                          {result?.source === "special" ? "Special" : "Hanime"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {searchResults.length > 0 && (
                <Link
                  // ⭐️ Use createSearchUrl which includes creator
                  href={createSearchUrl(searchQuery)}
                  className="search-view-all"
                  onClick={handleMobileClose}
                >
                  View all results
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* 🧭 Main Navbar */}
      <div
        className={`navbar ${isScrolled || !props.now ? "dark" : "transparent"
          }`}
      >
        <div className="nav-1">
          <div className="bars" onClick={() => setSidebarIsOpen(true)}>
            <FaBars />
          </div>

          <Link href={getUpdatedLink("/")} className="logo">
            <span className="logo-text">Hentaio</span>
          </Link>

          {/* 🧠 Desktop Search */}
          <div className={`search ${focused ? "focused" : ""}`}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search hentai..."
              value={searchQuery}
              onFocus={() => setFocused(true)}
              onBlur={handleBlur}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="search-icon" />

            {/* 🔽 Desktop Dropdown */}
            {focused && searchQuery && (
              <div className="search-dropdown">
                {isLoading && <div className="search-loading">Loading...</div>}
                {!isLoading && searchResults.length === 0 && (
                  <div className="search-empty">No results found</div>
                )}
                {searchResults.slice(0, 6).map((result, idx) => {
                  let finalUrl = "#";

                  if (result?.source === "hanime") {
                    const safeUrl = result?.url
                      ? result.url.replace("https://watchhentai.net/series/", "")
                      : "";
                    finalUrl = getUpdatedLink(`/watch/${safeUrl}`);
                  } else if (result?.source === "special") {
                    finalUrl = result.url
                      .replace("https://3dhentai.co/", "https://hentaio.pro/special/")
                      .replace(/\/$/, ""); // remove trailing slash
                  }

                  return (
                    <Link
                      key={idx}
                      href={finalUrl}
                      className="search-item"
                      onClick={handleMobileClose}
                    >
                      <img
                        src={result?.img || "/placeholder.jpg"}
                        alt={result?.title || "No title"}
                        className="search-thumb"
                      />

                      <div className="search-info">
                        <p className="search-title">
                          {result?.title || "Untitled"}
                        </p>

                        <div className="search-meta">
                          <span className="search-date">
                            {result?.date || "N/A"}
                          </span>

                          <span className={`search-source ${result?.source}`}>
                            {result?.source === "special" ? "Special" : "Hanime"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {searchResults.length > 0 && (
                  <Link
                    // ⭐️ Use createSearchUrl which includes creator
                    href={createSearchUrl(searchQuery)}
                    className="search-view-all"
                    onClick={handleSearchLinkClick}
                  >
                    View all results
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="nav-2">
          {/* 🔍 Mobile Search Button */}
          <div
            className="mobile-search-btn"
            onClick={() => setShowMobileSearch(true)}
          >
            <FaSearch />
          </div>
          {session ? (
            <Image
              src={getAvatarUrl(session)}
              key={session.user.avatar}
              className="profile-ico"
              onClick={toggleProfile}
              alt={session.user.username || "User Profile"}
              width={40}
              height={40}
              style={{
                borderRadius: "50%",
                cursor: "pointer",
                objectFit: "cover",
              }}
            />
          ) : (
            <div className="login" onClick={() => toggleSignInModal(true)}>
              Login
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
