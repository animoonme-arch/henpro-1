"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { FaHeart, FaTimes } from "react-icons/fa"; // Added FaTimes for the delete icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import "./watchList.css";

// `

// Utility to get the display name for the status
const getOptionName = (type) => {
    switch (type) {
        case "1":
            return "Watching";
        case "2":
            return "On-Hold";
        case "3":
            return "Plan to Watch";
        case "4":
            return "Dropped";
        case "5":
            return "Completed";
        default:
            return "All";
    }
};

// Map URL 'type' param to MongoDB 'status' field
const mapTypeToStatus = {
    1: "Watching",
    2: "On-Hold",
    3: "Plan to Watch",
    4: "Dropped",
    5: "Completed",
};

// --- Utility: Generate Watch Link ---
const getLink = (item, creator) => {
    const itemId = item.contentId;
    const lastWatchedEpId = item.lastEpisodeKey;

    if (!itemId) return "#";

    // ✅ Detect type
    const isAnime = itemId.includes("-id-");

    // ✅ Choose base route
    let basePath;

    if (isAnime) {
        // anime → watch page
        basePath = lastWatchedEpId
            ? `/${itemId}?ep=${lastWatchedEpId}`
            : `/${itemId}`;
    } else {
        // special → special page
        basePath = `/special/${itemId}`;
    }

    // ✅ Optional creator param
    if (creator) {
        const sep = basePath.includes("?") ? "&" : "?";
        basePath += `${sep}creator=${encodeURIComponent(creator)}`;
    }

    return basePath;
};
// --- InternalPageSlider Component Logic (Unchanged) ---

const InternalPageSlider = ({ page, totalPages, handlePageChange, currentType }) => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 7;
    const pageNumbers = [];

    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const sideCount = Math.floor((maxVisiblePages - 1) / 2);
        if (page <= sideCount + 1) {
            startPage = 1;
            endPage = maxVisiblePages;
        } else if (page + sideCount >= totalPages) {
            startPage = totalPages - maxVisiblePages + 1;
            endPage = totalPages;
        } else {
            startPage = page - sideCount;
            endPage = page + sideCount;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    const typeParam = currentType ? `type=${currentType}` : '';
    const linkBase = `/user/watch-list?${typeParam}${typeParam ? '&' : ''}`;

    const scrollToTop = () => {
        typeof window !== "undefined" && window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="flex justify-center items-center mt-8 space-x-2">
            {/* Previous Button */}
            {page > 1 && (
                <button
                    onClick={() => { handlePageChange(page - 1); scrollToTop(); }}
                    className="px-3 py-1 text-sm font-semibold rounded-md text-white bg-gray-700 hover:bg-[#ff9741] hover:text-black transition-colors duration-200"
                >
                    Previous
                </button>
            )}

            {/* First Page */}
            {startPage > 1 && (
                <>
                    <Link
                        href={`${linkBase}&page=1`}
                        onClick={() => { handlePageChange(1); scrollToTop(); }}
                        className="px-3 py-1 text-sm font-semibold rounded-md text-white bg-gray-700 hover:bg-[#ff9741] hover:text-black transition-colors duration-200"
                    >
                        1
                    </Link>
                    {startPage > 2 && <span className="text-gray-400">...</span>}
                </>
            )}

            {/* Visible Pages */}
            {pageNumbers.map((p) => (
                <Link
                    key={p}
                    href={`${linkBase}&page=${p}`}
                    onClick={() => { handlePageChange(p); scrollToTop(); }}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 ${p === page
                        ? "bg-[#ff9741] text-black"
                        : "text-white bg-gray-700 hover:bg-[#ff9741] hover:text-black"
                        }`}
                >
                    {p}
                </Link>
            ))}

            {/* Last Page */}
            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
                    <Link
                        href={`${linkBase}&page=${totalPages}`}
                        onClick={() => { handlePageChange(totalPages); scrollToTop(); }}
                        className="px-3 py-1 text-sm font-semibold rounded-md text-white bg-gray-700 hover:bg-[#ff9741] hover:text-black transition-colors duration-200"
                    >
                        {totalPages}
                    </Link>
                </>
            )}

            {/* Next Button */}
            {page < totalPages && (
                <button
                    onClick={() => { handlePageChange(page + 1); scrollToTop(); }}
                    className="px-3 py-1 text-sm font-semibold rounded-md text-white bg-gray-700 hover:bg-[#ff9741] hover:text-black transition-colors duration-200"
                >
                    Next
                </button>
            )}
        </div>
    );
};

// --- WatchList Component (Unchanged) ---

// `/watch

const WatchList = (props) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const status = mapTypeToStatus[props.type] || null;

    const fetchData = useCallback(async (currentPage) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            if (status) queryParams.set("type", status);
            if (currentPage) queryParams.set("page", currentPage);

            const url = `/api/user/watchlist?${queryParams.toString()}`;

            const res = await fetch(url);
            const json = await res.json();

            if (json.data && Array.isArray(json.data)) {
                setData(json.data);
                setPage(json.page || 1);
                setTotalPages(json.totalPages || 1);
                setTotalItems(json.total || 0);
            } else {
                setData(json || []);
                setPage(1);
                setTotalPages(1);
                setTotalItems(0);
            }
        } catch (err) {
            console.error("Error fetching watch list", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        const initialPage = props.page ? parseInt(props.page) : 1;
        setPage(initialPage);
        fetchData(initialPage);
    }, [props.type, props.page, fetchData]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchData(newPage);
    };

    const handleDelete = async (contentIdToDelete) => {
        try {
            setLoading(true); // Show loading state while deleting
            const res = await fetch(`/api/user/watchlist`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentId: contentIdToDelete }), // Send contentId
            });

            if (res.ok) {
                // Success: Re-fetch data for the current page
                await fetchData(page);
            } else {
                console.error("Failed to delete item.");
                // Re-fetch to revert local state if deletion failed on server
                await fetchData(page);
                alert("Failed to delete item from list.");
            }
        } catch (err) {
            console.error("Error deleting watch list item", err);
            // Re-fetch to revert local state
            await fetchData(page);
            alert("Error deleting item from list.");
        } finally {
            // setLoading(false); // fetchData handles setting loading to false
        }
    };


    const [hoveredItem, setHoveredItem] = useState(null);
    const [hoverTimeout, setHoverTimeout] = useState(null);

    const handleMouseEnter = (itemId) => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        const timeout = setTimeout(() => {
            setHoveredItem(itemId);
        }, 400);
        setHoverTimeout(timeout);
    };

    const handleMouseLeave = () => {
        clearTimeout(hoverTimeout);
        const timeout = setTimeout(() => {
            setHoveredItem(null);
        }, 150);
        setHoverTimeout(timeout);
    };

    const showLastUpdated = useMemo(() => data.some(item => item.updatedAt), [data]);

    return (
        <div className="alltio">
            <div className="allInnr">
                <div className="entFa">
                    <div className="watCFa">
                        <div className="watC">
                            <FaHeart />
                            Watch List ({totalItems})
                        </div>
                    </div>

                    <div className="butM">
                        <div className="butInnM">
                            {/* All Link */}
                            <Link
                                href={`/user/watch-list`}
                                className={`namil ${!props.type ? "selectedNO" : ""}`}
                                onClick={() => handlePageChange(1)}
                            >
                                All
                            </Link>
                            {/* Status Filters */}
                            {[1, 2, 3, 4, 5].map((type) => (
                                <Link
                                    key={type}
                                    href={`/user/watch-list?type=${type}`}
                                    className={`oamil ${props.type === `${type}` ? "selectedNO" : ""
                                        }`}
                                    onClick={() => handlePageChange(1)}
                                >
                                    {getOptionName(`${type}`)}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="ddidd">
                <div className="drd-col">
                    <div className="darg d-flex a-center j-center">
                        {loading ? (
                            <div className="listEmp">Loading...</div>
                        ) : data.length > 0 ? (
                            <div className="px-4 w-full">
                                {/* --- Inlined Card Grid --- */}
                                <div className="grid grid-cols-6 gap-x-3 gap-y-8 mt-6 max-[1400px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-2">
                                    {data.map((item) => {
                                        const itemId = item.contentId;
                                        const isHovered = hoveredItem === itemId;
                                        const watchLink = getLink(item, props.creator);

                                        // Format update date for display
                                        const updatedAt = item.updatedAt
                                            ? new Date(item.updatedAt).toLocaleDateString()
                                            : null;

                                        return (
                                            <div
                                                key={itemId}
                                                className="flex flex-col transition-transform duration-300 ease-in-out card-container"
                                                style={{ height: "fit-content" }}
                                            >
                                                <div className="relative card-image-wrapper">
                                                    <Link
                                                        href={watchLink}
                                                        className="w-full relative group hover:cursor-pointer"
                                                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                                        onMouseEnter={() => handleMouseEnter(itemId)}
                                                        onMouseLeave={handleMouseLeave}
                                                    >
                                                        {/* Play Icon on Hover */}
                                                        {isHovered && (
                                                            <FontAwesomeIcon
                                                                icon={faPlay}
                                                                className="text-[40px] text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10]"
                                                            />
                                                        )}
                                                        <div className="overlay"></div>
                                                        <div className="overflow-hidden card-image-inner">
                                                            <img
                                                                src={item.poster}
                                                                alt={item.title}
                                                                className={`w-full h-[250px] object-cover max-[1200px]:h-[35vw] max-[758px]:h-[45vw] max-[478px]:h-[60vw] group-hover:blur-[7px] transform transition-all duration-300 ease-in-out`}
                                                            />
                                                        </div>
                                                    </Link>

                                                    {/* Delete Button (Top-Right) */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Prevent navigating to the watch link
                                                            handleDelete(itemId);
                                                        }}
                                                        className="absolute top-2 right-2 p-2 bg-red-600 bg-opacity-80 hover:bg-red-700 rounded-full z-[15] delete-button"
                                                        title="Remove from Watch List"
                                                    >
                                                        <FaTimes className="text-white text-[12px]" />
                                                    </button>
                                                </div>

                                                {/* Title Link */}
                                                <Link
                                                    href={`/${itemId}`}
                                                    onClick={() =>
                                                        window.scrollTo({ top: 0, behavior: "smooth" })
                                                    }
                                                    className="text-white font-semibold mt-1 item-title hover:text-[#ff9741] hover:cursor-pointer line-clamp-1 card-title-link"
                                                >
                                                    {item.title}
                                                </Link>

                                                {/* Combined Status and Episode Info (Below Title) */}
                                                <div className="flex flex-row w-full mt-1 text-[13px] text-gray-400 card-info-text">
                                                    <span className={`font-bold watchlist-status-${item.status.toLowerCase().replace('-', '')}`}>
                                                        {item.status}
                                                    </span>
                                                    {item.lastEpisodeNo && (
                                                        <>
                                                            <span className="text-gray-400 mx-1">•</span>
                                                            <span className="italic">
                                                                Ep. {item.lastEpisodeNo}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Last Episode/Update Info (Moved 'Updated' down) */}
                                                {/* <div className="flex flex-col w-full mt-1 text-[13px] text-gray-400 card-info-text">
                          {item.lastEpisodeTitle && (
                            <div className="line-clamp-1">
                              **Last: **{item.lastEpisodeTitle}
                            </div>
                          )}
                          {showLastUpdated && updatedAt && (
                            <div className="line-clamp-1">
                              **Updated: **{updatedAt}
                            </div>
                          )}
                        </div> */}
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* --- End of Inlined Card Grid --- */}

                                {/* --- Inlined Page Slider --- */}
                                <InternalPageSlider
                                    page={page}
                                    totalPages={totalPages}
                                    handlePageChange={handlePageChange}
                                    currentType={props.type}
                                />
                                {/* --- End of Inlined Page Slider --- */}

                            </div>
                        ) : (
                            <div className="EmLi">
                                <div className="listEmp">
                                    {getOptionName(props.type)} list is empty
                                </div>
                                <div className="adviso">
                                    {"<^ Add some animes to the list ^>"}
                                </div>
                                <div className="flex adviso-1">
                                    <div>\__---</div>
                                    <div className="adviso">/\/\/\/\/\/\</div>
                                    <div>---__/</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchList;