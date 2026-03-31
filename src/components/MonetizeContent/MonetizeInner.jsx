// monetize.js
"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaLink,
  FaKey,
  FaChartLine,
  FaUserFriends,
  FaGlobe,
} from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai"; // Import close icon
import { FaSackDollar } from "react-icons/fa6";
import dayjs from "dayjs";
import SignInSignUpModal from "@/components/SignSignup/SignInSignUpModal";
import "./monetize.css"; // Ensure this CSS file is present
import Navbar from "../Navbar/Navbar";
import Footer from "../footer/Footer";

const PAYOUT_THRESHOLD = 25;

// /watch

// ----------------------------------------------------
// NEW COMPONENT: Custom Toast Notification
// ----------------------------------------------------
const CustomToast = ({ message, type, onClose }) => {
  let Icon = FaInfoCircle;
  if (type === "success") Icon = FaCheckCircle;
  if (type === "error") Icon = FaTimesCircle;

  // Render nothing if no message
  if (!message) return null;

  return (
    <div className={`custom-toast custom-toast-${type}`}>
      <div className="toast-icon-message">
        <Icon className="toast-icon" />
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="toast-close-btn">
        <AiOutlineClose />
      </button>
    </div>
  );
};

// ----------------------------------------------------
// HELPER COMPONENT: Renders the Stats Table (with sorting)
// ----------------------------------------------------
const StatsTable = ({ stats, sortKey, sortDirection, onSort }) => {
  if (!stats || stats.length === 0) {
    return (
      <p className="text-gray-400 text-center py-8">
        No statistics available for the selected period.
      </p>
    );
  }

  // Determine headers dynamically based on the first item
  const headers = Object.keys(stats[0]).map((key) => key.replace(/_/g, " "));
  const dataKeys = Object.keys(stats[0]);

  // Helper to format currency
  const formatCurrency = (value) => {
    if (typeof value === "number") {
      return `$${value.toFixed(2)}`;
    }
    return value;
  };

  // Helper to get sort icon
  const getSortIcon = (key) => {
    if (sortKey !== key) return null;
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="overflow-x-auto shadow-base rounded-lg mt-6">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-[#1c1c1c] sticky top-0">
          <tr>
            {dataKeys.map((key, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300 border-b border-gray-700 cursor-pointer hover:bg-[#252525] ${key === "revenue" || key === "cpm" || key === "ctr"
                  ? "text-right"
                  : ""
                  }`}
                onClick={() => onSort(key)}
              >
                {headers[index]}
                <span>{getSortIcon(key)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {stats.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="bg-[#101010] hover:bg-[#181818] transition duration-150"
            >
              {dataKeys.map((key, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${key === "revenue"
                    ? "font-bold text-lg text-green-400 text-right"
                    : key === "cpm" || key === "ctr"
                      ? "text-yellow-400 text-right"
                      : "text-gray-300"
                    }`}
                >
                  {key === "revenue" ? formatCurrency(row[key]) : row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ----------------------------------------------------
// HELPER COMPONENT: Creator Dashboard Content (Analytics View)
// ----------------------------------------------------
function CreatorDashboardContent({ creatorApiKey }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(
    dayjs().subtract(6, "day").format("YYYY-MM-DD")
  );
  const [finishDate, setFinishDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [groupBy, setGroupBy] = useState(["date"]);

  const [sortKey, setSortKey] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  const fetchStats = async () => {
    if (!creatorApiKey) {
      setError(
        "Cannot fetch stats: API Key is missing. Please complete setup."
      );
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("start_date", startDate);
      params.append("finish_date", finishDate);
      groupBy.forEach((g) => params.append("group_by", g));

      const res = await fetch(`/api/stats?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.items) {
        setStats(data.items);
      } else {
        setError(
          data.message ||
          data.error ||
          "Failed to fetch stats from Adsterra. Check your API key and permissions."
        );
        setStats([]);
      }
    } catch {
      setError("Network error while fetching data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, finishDate, groupBy, creatorApiKey]);

  const handleSort = (key) => {
    let direction = sortDirection === "desc" ? "asc" : "desc";
    setSortKey(key);
    setSortDirection(direction);
  };

  const sortedStats = React.useMemo(() => {
    if (!stats.length) return [];
    const sorted = [...stats];
    const numeric = typeof sorted[0][sortKey] === "number";
    sorted.sort((a, b) => {
      const res = numeric
        ? a[sortKey] - b[sortKey]
        : a[sortKey].localeCompare(b[sortKey]);
      return sortDirection === "asc" ? res : -res;
    });
    return sorted;
  }, [stats, sortKey, sortDirection]);

  const revenueSummary = React.useMemo(() => {
    if (!stats.length) return { totalRevenue: 0, progress: 0 };
    const totalRevenue = stats.reduce(
      (sum, item) => sum + (item.revenue || 0),
      0
    );
    const progress = Math.min(100, (totalRevenue / PAYOUT_THRESHOLD) * 100);
    return { totalRevenue, progress };
  }, [stats]);

  const { totalRevenue, progress } = revenueSummary;
  const formatCurrency = (v) => `$${v.toFixed(2)}`;

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-white px-2 sm:px-6 py-4 sm:py-10 flex flex-col items-center">
      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ff9741] mb-6 text-center drop-shadow-[0_0_10px_rgba(255,151,65,0.4)]">
        📊 Creator Analytics Dashboard
      </h2>

      {/* Payout Progress Section */}
      <div className="w-full max-w-3xl bg-gradient-to-b from-[#151515] to-[#0d0d0d] rounded-2xl border border-[#2a2a2a] shadow-[0_0_25px_rgba(255,151,65,0.1)] p-4 sm:p-6 mb-8 transition-all hover:shadow-[0_0_30px_rgba(255,151,65,0.2)]">
        <h3 className="text-lg sm:text-xl font-semibold text-[#ff9741] mb-3">
          💰 Payout Progress
        </h3>
        <p className="text-gray-300 mb-2">
          {formatCurrency(totalRevenue)} / {formatCurrency(PAYOUT_THRESHOLD)}
        </p>
        <div className="w-full bg-[#222] rounded-full h-3 mb-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${progress >= 100 ? "bg-green-500" : "bg-[#ff9741]"
              }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {totalRevenue >= PAYOUT_THRESHOLD ? (
          <p className="text-green-400 text-sm sm:text-base font-semibold">
            🎉 Congratulations! You've reached the $25 minimum payout threshold!
          </p>
        ) : (
          <p className="text-gray-400 text-sm sm:text-base">
            You need{" "}
            <span className="text-[#ff9741] font-semibold">
              {formatCurrency(PAYOUT_THRESHOLD - totalRevenue)}
            </span>{" "}
            more to reach your first payout. Keep sharing your link!
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="w-full max-w-3xl bg-[#101010] border border-[#2a2a2a] rounded-2xl p-3 sm:p-5 mb-8 flex flex-wrap gap-3 justify-center items-center transition-all hover:shadow-[0_0_20px_rgba(255,151,65,0.1)]">
        <div className="flex flex-col text-sm">
          <label className="text-gray-400 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[#111] border border-[#2a2a2a] rounded-lg p-2 text-white focus:ring-2 focus:ring-[#ff9741]"
            max={finishDate}
          />
        </div>
        <div className="flex flex-col text-sm">
          <label className="text-gray-400 mb-1">End Date</label>
          <input
            type="date"
            value={finishDate}
            onChange={(e) => setFinishDate(e.target.value)}
            className="bg-[#111] border border-[#2a2a2a] rounded-lg p-2 text-white focus:ring-2 focus:ring-[#ff9741]"
            min={startDate}
            max={dayjs().format("YYYY-MM-DD")}
          />
        </div>
        <div className="flex flex-col text-sm">
          <label className="text-gray-400 mb-1">Group By</label>
          <select
            value={groupBy[0]}
            onChange={(e) => setGroupBy([e.target.value])}
            className="bg-[#111] border border-[#2a2a2a] rounded-lg p-2 text-white focus:ring-2 focus:ring-[#ff9741]"
          >
            <option value="date">Date</option>
            <option value="domain">Domain</option>
            <option value="country">Country</option>
          </select>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${loading
            ? "bg-[#2a2a2a] text-gray-400 cursor-not-allowed"
            : "bg-[#ff9741] text-black hover:bg-[#ffa95c] hover:shadow-[0_0_20px_rgba(255,151,65,0.4)]"
            }`}
        >
          {loading ? "Loading..." : "Refresh Stats"}
        </button>
      </div>

      {/* Data Table or States */}
      {loading && (
        <div className="text-center p-10 text-gray-400 flex flex-col items-center">
          <FaChartLine className="animate-pulse text-[#ff9741] text-4xl mb-2" />
          <p>Fetching latest data...</p>
        </div>
      )}

      {error && (
        <div className="text-center p-6 sm:p-8 bg-red-900/30 text-red-300 rounded-lg border border-red-700/50 max-w-xl">
          <p className="font-semibold text-lg mb-2">⚠️ Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && stats.length > 0 && (
        <div className="w-full max-w-4xl overflow-x-auto">
          <StatsTable
            stats={sortedStats}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// NEW COMPONENT: Creator Settings & Link (Default post-setup view)
// ----------------------------------------------------

const CreatorSettings = ({
  session,
  adsterraSmartlink,
  setAdsterraSmartlink,
  creatorApiKey,
  setCreatorApiKey,
  instagramId,
  setInstagramId,
  handleSmartlinkSubmit,
  isLoadingSetup,
  handleCopy,
}) => {
  const username = session?.user?.username || "user-id-not-found";
  const creatorLink = `https://henpro.fun/${username}`;

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-white px-2 sm:px-6 py-4 sm:py-10 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-extrabold text-[#ff9741] drop-shadow-[0_0_10px_rgba(255,151,65,0.4)] tracking-tight">
          ⚙️ Creator Settings & Link
        </h2>
        <p className="text-gray-400 mt-2 text-sm sm:text-base max-w-2xl mx-auto">
          This is your dedicated link for monetization.{" "}
          <span className="text-[#ff9741] font-medium">
            Place it in your Instagram bio
          </span>{" "}
          and share it widely! The more visits, the more you earn.
        </p>
      </div>

      {/* Creator Link Display */}
      <div className="w-full max-w-xl bg-gradient-to-b from-[#151515] to-[#0d0d0d] p-3 sm:p-5 mb-8 rounded-xl border border-[#1e1e1e] shadow-[0_0_20px_rgba(255,151,65,0.1)] hover:shadow-[0_0_30px_rgba(255,151,65,0.2)] transition-all duration-300">
        <p className="text-sm sm:text-base text-gray-400 mb-2 text-center">
          Your Monetization Link
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3 transition">
          <a
            href={creatorLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm sm:text-lg font-mono text-[#ff9741] hover:text-white transition-all break-all text-center sm:text-left"
          >
            {creatorLink}
          </a>
          <button
            onClick={() => handleCopy(creatorLink)}
            className="p-2 rounded-full bg-[#1e1e1e] hover:bg-[#ff9741] hover:text-black transition-all"
            title="Copy Link"
          >
            <FaLink className="text-white h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Update Form */}
      <div className="w-full max-w-xl bg-gradient-to-b from-[#1a1a1a] to-[#0e0e0e] p-4 sm:p-8 rounded-2xl border border-[#2a2a2a] shadow-[0_0_25px_rgba(255,151,65,0.08)] hover:shadow-[0_0_35px_rgba(255,151,65,0.15)] transition-all duration-300">
        <h3 className="text-xl font-semibold text-[#ff9741] mb-5 border-b border-[#2a2a2a] pb-2 drop-shadow-[0_0_6px_rgba(255,151,65,0.5)]">
          Update Adsterra Integration
        </h3>

        <div className="space-y-5">
          {/* Smart Link */}
          <label className="block">
            <span className="text-gray-400 text-sm sm:text-base">
              Adsterra Smart Link URL
            </span>
            <input
              type="url"
              placeholder="Enter your Smart Link URL"
              value={adsterraSmartlink}
              onChange={(e) => setAdsterraSmartlink(e.target.value)}
              className="w-full mt-2 bg-[#111] border border-[#2a2a2a] rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#ff9741] transition-all"
              disabled={isLoadingSetup}
            />
          </label>

          {/* API Key */}
          <label className="block">
            <span className="text-gray-400 text-sm sm:text-base">
              Adsterra API Key (Required)
            </span>
            <input
              type="text"
              placeholder="Enter your API Key"
              value={creatorApiKey}
              onChange={(e) => setCreatorApiKey(e.target.value)}
              className="w-full mt-2 bg-[#111] border border-[#2a2a2a] rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#ff9741] transition-all"
              disabled={isLoadingSetup}
            />
          </label>

          {/* Instagram Handle */}
          <label className="block">
            <span className="text-gray-400 text-sm sm:text-base">
              Instagram Handle (Optional)
            </span>
            <input
              type="text"
              placeholder="e.g., @myusername"
              value={instagramId}
              onChange={(e) => setInstagramId(e.target.value)}
              className="w-full mt-2 bg-[#111] border border-[#2a2a2a] rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#ff9741] transition-all"
              disabled={isLoadingSetup}
            />
          </label>

          {/* Save Button */}
          <button
            onClick={handleSmartlinkSubmit}
            disabled={isLoadingSetup}
            className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 shadow-md
              ${isLoadingSetup
                ? "bg-[#2a2a2a] text-gray-400 cursor-not-allowed"
                : "bg-[#ff9741] text-black hover:bg-[#ffa95c] hover:shadow-[0_0_20px_rgba(255,151,65,0.4)]"
              }`}
          >
            {isLoadingSetup ? "Saving..." : "Update Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// MONETIZATION STEPS COMPONENT (The Setup Form)
// ----------------------------------------------------
function MonetizationSteps({
  adsterraSmartlink,
  setAdsterraSmartlink,
  creatorApiKey,
  setCreatorApiKey,
  instagramId,
  setInstagramId,
  handleSmartlinkSubmit,
}) {
  return (
    <div className="text-white px-3 sm:px-4 md:px-10 py-6 sm:py-8 md:py-12">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 drop-shadow-[0_0_15px_rgba(0,255,100,0.4)]">
        💸 Set Up Your Monetization
      </h1>
      <p className="text-gray-400 text-center max-w-2xl mx-auto mb-8 sm:mb-10 text-xs sm:text-sm md:text-base">
        Connect your Adsterra account to start earning revenue from your
        content.
      </p>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Step 1 */}
        <div className="bg-[#0f0f0f] border border-gray-700 rounded-xl p-4 sm:p-5 md:p-6 shadow-[0_0_20px_rgba(0,255,100,0.1)] hover:shadow-[0_0_25px_rgba(0,255,100,0.25)] transition-all duration-300">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <FaSackDollar className="text-green-400 text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(0,255,100,0.4)]" />
            <h3 className="text-lg sm:text-xl font-semibold">
              Step 1: Sign Up
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm">
              Join Adsterra’s publisher program and get approved fast.
            </p>
            <a
              href="https://beta.publishers.adsterra.com/referral/fbpH9hBDcx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 font-medium mt-2 hover:text-green-300 transition"
            >
              Sign up on Adsterra →
            </a>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-[#0f0f0f] border border-gray-700 rounded-xl p-4 sm:p-5 md:p-6 shadow-[0_0_20px_rgba(0,200,255,0.1)] hover:shadow-[0_0_25px_rgba(0,200,255,0.25)] transition-all duration-300">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <FaLink className="text-cyan-400 text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(0,200,255,0.5)]" />
            <h3 className="text-lg sm:text-xl font-semibold">
              Step 2: Get Smart Link
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm">
              Create your Smart Link to track traffic and revenue.
            </p>
            <input
              type="url"
              placeholder="Enter your Smart Link URL"
              value={adsterraSmartlink}
              onChange={(e) => setAdsterraSmartlink(e.target.value)}
              className="w-full bg-[#1a1a1a] text-gray-200 border border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition text-sm"
            />
            <a
              href="https://beta.publishers.adsterra.com/links"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 font-medium mt-2 hover:text-cyan-300 transition"
            >
              Get Smart Link →
            </a>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-[#0f0f0f] border border-gray-700 rounded-xl p-4 sm:p-5 md:p-6 shadow-[0_0_20px_rgba(255,150,0,0.1)] hover:shadow-[0_0_25px_rgba(255,150,0,0.25)] transition-all duration-300">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <FaKey className="text-yellow-400 text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(255,200,0,0.5)]" />
            <h3 className="text-lg sm:text-xl font-semibold">
              Step 3: Get API Key
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm">
              Generate your API Token to connect your Adsterra account.
              Optionally add Instagram.
            </p>
            <input
              type="text"
              placeholder="Enter your API Key (Required)"
              value={creatorApiKey}
              onChange={(e) => setCreatorApiKey(e.target.value)}
              className="w-full bg-[#1a1a1a] text-gray-200 border border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition text-sm"
            />
            <input
              type="text"
              placeholder="Instagram Handle (Optional)"
              value={instagramId}
              onChange={(e) => setInstagramId(e.target.value)}
              className="w-full bg-[#1a1a1a] text-gray-200 border border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500 transition text-sm"
            />
            <a
              href="https://beta.publishers.adsterra.com/api-token"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 font-medium mt-2 hover:text-yellow-300 transition"
            >
              Get API Key →
            </a>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSmartlinkSubmit}
            className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold py-2 rounded-md hover:from-yellow-400 hover:to-orange-400 transition duration-300 shadow-[0_0_15px_rgba(255,180,0,0.4)] text-sm sm:text-base"
          >
            Complete Setup & Save
          </button>
        </div>
      </div>

      {/* Info Section */}
      <p className="text-center text-gray-400 mt-8 sm:mt-10 text-xs sm:text-sm md:text-base max-w-xl mx-auto">
        Once you complete all steps, your dashboard will show live stats and
        earnings.
      </p>
    </div>
  );
}

// ----------------------------------------------------
// THE MAIN MONETIZE COMPONENT
// ----------------------------------------------------
export function MonetizeInner(props) {
  const { data: session, status } = useSession();

  const [adsterraSmartlink, setAdsterraSmartlink] = useState("");
  const [creatorApiKey, setCreatorApiKey] = useState("");
  const [instagramId, setInstagramId] = useState("");

  const [isLoadingSetup, setIsLoadingSetup] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [logIsOpen, setLogIsOpen] = useState(false);

  // FIX: Initialize view to 'settings' to prioritize the link/setup info
  const [currentView, setCurrentView] = useState("settings");

  // NEW: State for Toast Notification
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const sign = (sign) => {
    setLogIsOpen(sign);
  };

  // NEW: Function to handle showing the toast
  const showToast = (message, type) => {
    setToast({ message, type, visible: true });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 5000);
  };

  // NEW: Function to handle clipboard copy toast for the link
  const handleCopy = (creatorLink) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(creatorLink);
      showToast("Link copied to clipboard! Paste it in your bio.", "success");
    } else {
      showToast(
        "Clipboard access denied. Please copy the link manually.",
        "error"
      );
    }
  };

  // --- FETCH SETUP STATUS ---
  useEffect(() => {
    if (session && status === "authenticated") {
      const fetchSetupStatus = async () => {
        try {
          const res = await fetch("/api/creator");
          const data = await res.json();

          if (res.ok && data.setup) {
            setAdsterraSmartlink(data.setup.adsterraSmartlink || "");
            setCreatorApiKey(data.setup.creatorApiKey || "");
            setInstagramId(data.setup.instagramId || "");

            if (data.setup.adsterraSmartlink && data.setup.creatorApiKey) {
              setIsSetupComplete(true);
            } else {
              setIsSetupComplete(false);
            }
          } else {
            setIsSetupComplete(false);
          }
        } catch (error) {
          console.error("Failed to fetch creator setup:", error);
          setIsSetupComplete(false);
        } finally {
          setIsLoadingSetup(false);
        }
      };
      fetchSetupStatus();
    }
  }, [session, status]);

  // --- HANDLE FORM SUBMISSION (POST API) ---
  const handleSmartlinkSubmit = async (e) => {
    e.preventDefault();
    if (!adsterraSmartlink || !creatorApiKey) {
      showToast("Please fill in the Smart Link and API Key fields.", "error"); // Toast
      return;
    }

    setIsLoadingSetup(true);

    try {
      const res = await fetch("/api/creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adsterraSmartlink, creatorApiKey, instagramId }),
      });

      if (res.ok) {
        showToast(
          "Monetization settings saved successfully! Use your link.",
          "success"
        ); // Toast
        setIsSetupComplete(true);
        setCurrentView("settings");
      } else {
        const errorData = await res.json();
        showToast(`Failed to save setup: ${errorData.message}`, "error"); // Toast
      }
    } catch (error) {
      console.error("Submission error:", error);
      showToast("An unexpected error occurred during submission.", "error"); // Toast
    } finally {
      setIsLoadingSetup(false);
    }
  };

  // ----------------------------------------------------
  // RENDER LOGIC
  // ----------------------------------------------------

  if (status === "loading" || (session && isLoadingSetup)) {
    return (
      <>
        <Navbar now={false} creator={props.creator} />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 sm:px-6">
          <FaSackDollar className="text-5xl sm:text-6xl text-green-400 drop-shadow-[0_0_10px_rgba(0,255,100,0.5)] animate-pulse mb-3" />
          <p className="text-gray-300 text-lg sm:text-xl font-medium">
            Loading Creator Dashboard...
          </p>
        </div>
        <Footer creator={props.creator} />
      </>
    );
  }

  // Unauthenticated State
  if (!session) {
    return (
      <>
        <Navbar now={false} creator={props.creator} />
        <div className="text-white flex flex-col items-center text-center px-4 sm:px-6 md:px-10 py-8 sm:py-10 md:py-14">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 drop-shadow-[0_0_15px_rgba(0,200,255,0.4)]">
            Join Our Creator Program 🚀
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 sm:mb-10">
            Unlock your revenue potential by sharing your creativity with the
            world.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 w-full max-w-4xl">
            <div className="bg-[#0f0f0f] border border-gray-700 rounded-xl p-4 sm:p-5 shadow-[0_0_15px_rgba(0,255,150,0.1)] hover:shadow-[0_0_20px_rgba(0,255,150,0.25)] transition-all duration-300">
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <FaUserFriends className="text-green-400 text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(0,255,100,0.5)]" />
                <h3 className="text-lg sm:text-xl font-semibold">
                  5,000+ Creators
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Already earning with us
                </p>
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-gray-700 rounded-xl p-4 sm:p-5 shadow-[0_0_15px_rgba(0,200,255,0.1)] hover:shadow-[0_0_20px_rgba(0,200,255,0.25)] transition-all duration-300">
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <FaChartLine className="text-cyan-400 text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(0,200,255,0.5)]" />
                <h3 className="text-lg sm:text-xl font-semibold">$1,000/day</h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Top creators earning daily
                </p>
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-gray-700 rounded-xl p-4 sm:p-5 shadow-[0_0_15px_rgba(255,150,0,0.1)] hover:shadow-[0_0_20px_rgba(255,150,0,0.25)] transition-all duration-300">
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <FaGlobe className="text-yellow-400 text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(255,200,0,0.5)]" />
                <h3 className="text-lg sm:text-xl font-semibold">
                  Global Reach
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Monetize your audience anywhere
                </p>
              </div>
            </div>
          </div>

          {/* Auth Modal */}
          {logIsOpen && (
            <div className="modal-wrapper">
              <SignInSignUpModal
                logIsOpen={logIsOpen}
                setLogIsOpen={setLogIsOpen}
                sign={sign}
              />
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={() => setLogIsOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-green-400 text-black font-semibold text-sm sm:text-base px-6 py-2 sm:py-3 rounded-md hover:from-cyan-400 hover:to-green-300 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,150,0.4)] mb-4"
          >
            Get Started Now
          </button>

          {/* Login Info */}
          <p className="text-gray-400 text-xs sm:text-sm">
            Already have an account?{" "}
            <span
              onClick={() => setLogIsOpen(true)}
              className="text-cyan-400 cursor-pointer hover:text-cyan-300 transition"
            >
              Log in
            </span>{" "}
            to access your dashboard.
          </p>
        </div>
        <Footer creator={props.creator} />
      </>
    );
  }

  // AUTHENTICATED STATE
  return (
    <>
      <Navbar now={false} creator={props.creator} />
      <div className="min-h-screen text-white bg-[#0a0a0a] px-4 sm:px-6 md:px-10 py-8 sm:py-10 md:py-14 relative overflow-hidden">
        {/* Optional gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#101010] to-[#080808] pointer-events-none" />

        {/* Custom Toast */}
        {toast.visible && (
          <CustomToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
          />
        )}

        {/* HEADER */}
        <div className="relative text-center mb-10 sm:mb-14">
          <h1 className="flex items-center justify-center gap-3 text-3xl sm:text-4xl font-bold mb-3 drop-shadow-[0_0_15px_rgba(255,180,0,0.4)]">
            <FaSackDollar className="text-yellow-400 drop-shadow-[0_0_10px_rgba(255,200,0,0.5)] animate-pulse" />
            Creator Dashboard
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Welcome back,{" "}
            <span className="text-orange-400 font-medium drop-shadow-[0_0_5px_rgba(255,150,0,0.4)]">
              {session?.user?.username}
            </span>
            ! Let’s elevate your monetization game. 🚀
          </p>
        </div>

        {/* MAIN CONTENT */}
        <div className="relative bg-[#0f0f0f] border border-gray-800 rounded-2xl shadow-[0_0_25px_rgba(255,150,0,0.08)] p-5 sm:p-6 md:p-8">
          {isSetupComplete ? (
            <>
              {/* Navigation Tabs */}
              <div className="flex flex-wrap justify-center mb-6 sm:mb-8 border-b border-gray-700 bg-[#121212] rounded-t-xl overflow-hidden">
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className={`px-5 sm:px-8 py-3 text-sm sm:text-lg font-semibold transition-all duration-300 ${currentView === "dashboard"
                    ? "text-white border-b-2 border-orange-500 drop-shadow-[0_0_10px_rgba(255,150,0,0.5)]"
                    : "text-gray-400 hover:text-white"
                    }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setCurrentView("settings")}
                  className={`px-5 sm:px-8 py-3 text-sm sm:text-lg font-semibold transition-all duration-300 ${currentView === "settings"
                    ? "text-white border-b-2 border-orange-500 drop-shadow-[0_0_10px_rgba(255,150,0,0.5)]"
                    : "text-gray-400 hover:text-white"
                    }`}
                >
                  Settings & Link
                </button>
              </div>

              {/* Conditional View */}
              <div className="mt-6 sm:mt-8">
                {currentView === "dashboard" ? (
                  <CreatorDashboardContent creatorApiKey={creatorApiKey} />
                ) : (
                  <CreatorSettings
                    session={session}
                    adsterraSmartlink={adsterraSmartlink}
                    setAdsterraSmartlink={setAdsterraSmartlink}
                    creatorApiKey={creatorApiKey}
                    setCreatorApiKey={setCreatorApiKey}
                    instagramId={instagramId}
                    setInstagramId={setInstagramId}
                    handleSmartlinkSubmit={handleSmartlinkSubmit}
                    isLoadingSetup={isLoadingSetup}
                    handleCopy={handleCopy}
                  />
                )}
              </div>
            </>
          ) : (
            <>
              {/* Setup Steps Section */}
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-10 drop-shadow-[0_0_10px_rgba(0,255,150,0.4)]">
                Complete Your Setup 🧩
              </h2>
              <MonetizationSteps
                adsterraSmartlink={adsterraSmartlink}
                setAdsterraSmartlink={setAdsterraSmartlink}
                creatorApiKey={creatorApiKey}
                setCreatorApiKey={setCreatorApiKey}
                instagramId={instagramId}
                setInstagramId={setInstagramId}
                handleSmartlinkSubmit={handleSmartlinkSubmit}
              />
            </>
          )}
        </div>
      </div>
      <Footer creator={props.creator} />
    </>
  );
}
