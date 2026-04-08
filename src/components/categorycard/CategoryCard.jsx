"use client";
import { useEffect, useState } from "react";
import getCategoryInfo from "@/utils/getCategoryInfo.utils";
import CategoryCard from "@/component/categorycard/CategoryCard";
import Genre from "@/component/genres/Genre";
import Topten from "@/component/topten/Topten";
import Loader from "@/component/Loader/Loader";
// import Error from "@/component/error/Error";
import PageSlider from "@/component/pageslider/PageSlider";
import SidecardLoader from "@/component/Loader/SidecardLoader";
import { useRouter, useSearchParams } from "next/navigation"; // ⬅️ Import useSearchParams
import "./category.css";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { SessionProvider } from "next-auth/react";
import Script from "next/script";
import Share from "../Share/Share";

export default function Category({ path, label, pagel, refer }) {
  const router = useRouter();
  const searchParams = useSearchParams(); // ⬅️ Get search params
  const creatorParam = searchParams.get("creator"); // ⬅️ Get creator param

  const [selectL, setSelectL] = useState("EN");
  const lang = (lang) => {
    setSelectL(lang);
  };
  // 'pagel' is passed as a prop, but we still need the full search params
  const [urlPage, setUrlPage] = useState(pagel);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const page = parseInt(urlPage) || 1; // Use local state for page

  const [homeInfo, setHomeInfo] = useState(null);
  const [homeInfoLoading, setHomeInfoLoading] = useState(true);

  // Helper to build the creator query part for URL pushing
  const getCreatorQuery = (prefix = "&") => {
    return creatorParam ? `${prefix}creator=${creatorParam}` : "";
  };

  // Fetch Home Info (No change needed)
  useEffect(() => {
    const fetchHomeInfo = async () => {
      try {
        const res = await fetch("/api/home");
        const data = await res.json();
        setHomeInfo(data);
      } catch (err) {
        console.error("Error fetching home info:", err);
        setError(err);
      } finally {
        setHomeInfoLoading(false);
      }
    };
    fetchHomeInfo();
  }, []);

  // 

  // Fetch Category Info (Updated logic)
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      setLoading(true);
      try {
        // ⬅️ Adjust the path for the API call if 'creator' exists
        let fetchPath = path;
        if (creatorParam) {
          // Assuming getCategoryInfo expects a clean path/slug,
          // and we need to pass creator as a separate param
          // OR include it in the path string with a '?'
          // Here, we pass it as a parameter if the path doesn't already have query params
          const pathSeparator = path.includes("?") ? "&" : "?";
          fetchPath = `${path}${pathSeparator}creator=${creatorParam}`;
        }

        // Pass the potentially updated path and page number
        const data = await getCategoryInfo(fetchPath, page);

        setCategoryInfo(data.data);
        setTotalPages(data.totalPages);
        setLoading(false);
        typeof window !== "undefined" && window.scrollTo(0, 0);
      } catch (err) {
        console.error("Error fetching category info:", err);
        setError(err);
        setLoading(false);
      }
    };
    // The dependency array must include 'creatorParam' to refetch when it changes
    fetchCategoryInfo();
  }, [path, page, creatorParam]); // ⬅️ Added creatorParam dependency

  // Error handling redirects
  if (loading) return <Loader type="category" />;
  if (error) {
    router.push("/error-page");
    return null;
  }
  if (!categoryInfo) {
    router.push("/404-not-found-page");
    return null;
  }

  // Handle page change (Updated logic)
  const handlePageChange = (newPage) => {
    setUrlPage(String(newPage)); // Update local state for immediate re-render and re-fetch

    // 1. Determine the path to push (base path, potentially including genre/year)
    // The 'path' prop seems to already contain the base route/slug (e.g., 'genre/action')
    let urlToPush = `/${path}`;

    // 2. Add the page parameter
    // Determine if '?' or '&' is needed before 'page='
    const initialSeparator = path.includes("?") ? "&" : "?";
    urlToPush += `${initialSeparator}page=${newPage}`;

    // 3. Append the creator parameter if it exists
    urlToPush += getCreatorQuery();

    router.push(urlToPush);
  };

  return (
    <>
      <SessionProvider>
        <Navbar lang={lang} selectL={selectL} refer={refer} />
        <div className="w-full flex flex-col gap-y-4 mt-[70px] max-md:mt-[70px]">
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
          {/* Share Anime Banner */}
          <div className="w-full">
            <Share
              ShareUrl={`https://shoko.fun/${path}${getCreatorQuery("?")}${refer
                ? `${creatorParam ? "&" : "?"}refer=${refer}`
                : `${creatorParam ? "&" : "?"}refer=weebsSecret`
                }`}
              arise={label?.split?.("/")?.pop() || ""}
            />
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

          {/* Main Content */}
          <div className="category-layout">
            {/* Category Info */}
            <div>
              {page > totalPages ? (
                <p className="font-bold text-2xl text-[#00f2fe] max-[478px]:text-[18px] max-[300px]:leading-6">
                  You came a long way, go back{" "}
                  <br className="max-[300px]:hidden" />
                  nothing is here
                </p>
              ) : (
                <>
                  {categoryInfo?.length > 0 && (
                    <CategoryCard
                      label={label?.split?.("/")?.pop() || ""}
                      data={categoryInfo}
                      showViewMore={false}
                      className="mt-0"
                      categoryPage={true}
                      path={path}
                      selectL={selectL}
                      refer={refer}
                      home={"2"}
                      // ⬅️ Pass creatorParam to CategoryCard
                      creator={creatorParam}
                    />
                  )}
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

                  <PageSlider
                    page={page}
                    totalPages={totalPages}
                    handlePageChange={handlePageChange}
                    refer={refer}
                    // ⬅️ Pass creatorParam to PageSlider
                    creator={creatorParam}
                  />
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
                </>
              )}
            </div>
            {/* Sidebar */}
            <div className="w-full flex flex-col gap-y-10">
              {homeInfoLoading ? (
                <SidecardLoader />
              ) : (
                <>
                  {homeInfo?.topten && (
                    <Topten
                      data={homeInfo.topten}
                      className="mt-0"
                      selectL={selectL}
                      refer={refer}
                      // ⬅️ Pass creatorParam to Topten
                      creator={creatorParam}
                    />
                  )}

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

                  {homeInfo?.genres && (
                    <Genre
                      data={homeInfo.genres}
                      refer={refer}
                      // ⬅️ Pass creatorParam to Genre
                      creator={creatorParam}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <Footer refer={refer} />
      </SessionProvider>
    </>
  );
}
