"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./continueWatching.css";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
  FaHistory,
} from "react-icons/fa";
import Link from "next/link";
import CategoryCard from "./CategoryCard";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation"; // ⬅️ Import useSearchParams
import { toast } from "react-hot-toast";

// --- Progress Adapter (Assumes API provides enriched data) ---
const progressAdapter = (item) => {
  // We assume the server joins watchProgress with content metadata
  // to provide 'totalDuration', 'poster', 'title', and 'episodeNum' (or 'epNo')
  const contentId = item.contentKey;

  const watchedSec = parseFloat(item.currentTime || 0);
  const totalSec = parseFloat(item.totalDuration || 0); // Must be provided by server

  const percentage =
    totalSec > 0
      ? Math.min(100, Math.floor((watchedSec / totalSec) * 100))
      : watchedSec > 0
      ? 1
      : 0;

  return {
    // Keep all properties from the API, including the metadata
    ...item,
    id: contentId, // Use contentKey as the card ID
    epNo: item.episodeNum || item.epNo || "?",
    totalSecondsTimo: watchedSec,
    totalSeconds: totalSec,
    percentage,
    // poster and title are expected to be present in 'item'
  };
};

const ContinueWatching = (props) => {
  // const searchParams = useSearchParams(); // ⬅️ Get search params
  const creatorParam = props.creator; // ⬅️ Get creator param

  const [watchList, setWatchList] = useState([]);
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [isLoading, setIsLoading] = useState(true);

  const pageSize = 24;
  const currentPage = useMemo(
    () => parseInt(props.page || "1", 10),
    [props.page]
  );

  // Helper to generate the creator query string for pagination links
  const getCreatorQuery = useCallback(() => {
    return creatorParam ? `&creator=${creatorParam}` : "";
  }, [creatorParam]);

  // 🔑 Function to load progress from the API list endpoint (API Only)
  const loadApiProgress = useCallback(async () => {
    // Calling the list endpoint - must be protected on the server side
    const response = await fetch("/api/progress/list");

    if (!response.ok) {
      // Handle 401 (Not logged in) or other errors (500)
      if (response.status !== 401) {
        console.error(`API Error: ${response.status} - ${response.statusText}`);
        toast.error(
          "Failed to load cloud history. Please try logging in again."
        );
      }
      return []; // Return empty list on any failure
    }

    const rawData = await response.json();

    const formatted = rawData
      .map((item) => progressAdapter(item))
      .filter((item) => item.percentage < 98);

    return formatted;
  }, []);

  useEffect(() => {
    const loadProgress = async () => {
      // 1. If loading session or not logged in, stop immediately
      if (status === "loading" || !isLoggedIn) {
        if (status !== "loading") setIsLoading(false);
        setWatchList([]);
        return;
      }

      setIsLoading(true);

      try {
        // 2. Fetch data from the API only
        const list = await loadApiProgress();
        setWatchList(list);
      } catch (error) {
        // Errors are already handled in loadApiProgress (toast and console.error)
        setWatchList([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [status, isLoggedIn, loadApiProgress]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(watchList.length / pageSize);
  const getPage = (pageNumber) =>
    watchList.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  const data = getPage(currentPage);

  const useArr = useMemo(() => {
    if (totalPages <= 1) return [];
    if (totalPages <= 3)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (currentPage < 3) return [1, 2, 3];
    if (currentPage >= totalPages - 1)
      return [totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 1, currentPage, currentPage + 1];
  }, [totalPages, currentPage]);

  if (isLoading) {
    return (
      <div className="contiAll text-white p-8">Loading cloud history...</div>
    );
  }

  // Only render if logged in AND data is available
  if (!isLoggedIn || watchList.length === 0) return null;

  return (
    <div className="contiAll">
      <div className="conticFa">
        <div className="contic">
          <FaHistory />
          Continue Watching
        </div>
      </div>

      <div className="midd">
        <CategoryCard
          label=""
          data={data}
          showViewMore={false}
          keepIt="true"
          refer={props.refer}
          cardStyle="rounded"
          className="w-full"
          isLoggedIn={isLoggedIn}
          creator={creatorParam} // ⬅️ Pass creator param to CategoryCard
        />
      </div>

      {totalPages > 1 && (
        <div className="paginA">
          {currentPage > 1 && (
            <>
              <Link
                // ⬅️ UPDATED: Append creator param
                href={`/user/continue-watching?page=1${getCreatorQuery()}`}
                className="pagin-tile"
                aria-label="First Page"
              >
                <FaAngleDoubleLeft />
              </Link>
              <Link
                // ⬅️ UPDATED: Append creator param
                href={`/user/continue-watching?page=${currentPage - 1}${getCreatorQuery()}`}
                className="pagin-tile"
                aria-label="Previous Page"
              >
                <FaAngleLeft />
              </Link>
            </>
          )}

          {useArr.map((pageNum) => (
            <Link
              key={pageNum}
              // ⬅️ UPDATED: Append creator param
              href={`/user/continue-watching?page=${pageNum}${getCreatorQuery()}`}
              className={`pagin-tile ${
                currentPage === pageNum ? "pagin-colo" : ""
              }`}
              aria-current={currentPage === pageNum ? "page" : undefined}
            >
              {pageNum}
            </Link>
          ))}

          {currentPage < totalPages && (
            <>
              <Link
                // ⬅️ UPDATED: Append creator param
                href={`/user/continue-watching?page=${currentPage + 1}${getCreatorQuery()}`}
                className="pagin-tile"
                aria-label="Next Page"
              >
                <FaAngleRight />
              </Link>
              <Link
                // ⬅️ UPDATED: Append creator param
                href={`/user/continue-watching?page=${totalPages}${getCreatorQuery()}`}
                className="pagin-tile"
                aria-label="Last Page"
              >
                <FaAngleDoubleRight />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ContinueWatching;
