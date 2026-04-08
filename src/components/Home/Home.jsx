"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { FaPlay, FaClock } from "react-icons/fa";
import Navbar from "../Navbar/Navbar";
import Hero from "../Hero/Hero";
import RecentEpisodes from "../RecentEpisodes/RecentEpisodes";
import ShareSlab from "../ShareSlab/ShareSlab";
import Swipe from "../Swipe/Hero";
import Footer from "../footer/Footer";
import Ad from "@/components/Ad/page";
import "./home.css";

const Home = (props) => {

  const playPreview = (e) => {
    const video = e.currentTarget.querySelector("video");
    if (!video) return;
    if (!video.src) video.src = video.dataset.src;
    video.play().catch(() => { });
  };

  const stopPreview = (e) => {
    const video = e.currentTarget.querySelector("video");
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <SessionProvider>
      <div className="home-container">

        <Navbar now={true} creator={props.creator} />

        <Hero
          recentEpi={props.recentEpi}
          creator={props.creator}
        />

        {/* 🥇 TOP ADS */}
        {/* <Ad type="320x50" /> */}

        {/* 🟣 NATIVE ADFRAME (KEEP) */}
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

        {/* TRENDING GRID */}
        <section className="decent-container">

          <h2 className="decent-heading">
            <span>🔥 Trending 3D Videos</span>
          </h2>

          <div className="decent-grid">

            {props.specialHome?.data?.map((item, index) => {

              const slug = new URL(item.link).pathname.replace(/\/$/, "");
              const internalLink = `/special${slug}`;

              const previewVideo = item.thumbnail
                .replace(/-\d+x\d+\.webp$/, ".mp4")
                .split("/")
                .pop();

              const previewSrc = `https://3dhq1.org/video/3d/${previewVideo}`;

              return (
                <React.Fragment key={index}>
                  <a
                    href={internalLink}
                    className="decent-card"
                    onMouseEnter={playPreview}
                    onMouseLeave={stopPreview}
                    onTouchStart={playPreview}
                  >
                    <div className="image-container">

                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="poster"
                        loading="lazy"
                      />

                      <video
                        className="hover-preview"
                        muted
                        loop
                        playsInline
                        preload="none"
                        data-src={previewSrc}
                      />

                      <div className="decent-overlay">
                        <FaPlay className="decent-play-icon" />
                      </div>

                      <span className="dabel-tag bottom dabel-default">
                        <FaClock className="inline-icon" />
                        {item.duration}
                      </span>

                      <span className="dabel-tag top dabel-unc">
                        ⭐ {item.rating}
                      </span>

                    </div>

                    <div className="info">
                      <h3 className="series-name">
                        {item.title}
                      </h3>

                      <div className="meta">
                        <p className="episode-title">
                          👁 {item.views}
                        </p>
                      </div>
                    </div>
                  </a>

                  {/* 🥈 GRID AD */}
                  {/* {index === 5 && <Ad type="300x250" />} */}
                </React.Fragment>
              );
            })}

          </div>

        </section>

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

        <RecentEpisodes
          recentEpi={props.recentEpi.data.recentEpisodes}
          creator={props.creator}
        />

        {/* 🥉 BANNER */}
        {/* <Ad type="300x250" /> */}

        {/* 🟣 NATIVE AGAIN (GOOD POSITION) */}
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

        <ShareSlab
          pageId={"home"}
          url={`https://hentaio.pro/`}
          title={"Watch Hentai on Hentaio"}
          pageName="Hentaio"
          creator={props.creator}
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

        <Swipe
          title="Series"
          slides={props.hompro?.series || []}
          slug={`/series`}
          creator={props.creator}
        />

        {/* 🟢 EXTRA BANNER */}
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

        <Swipe
          title="Uncensored"
          slides={props.hompro?.genre?.uncensored || []}
          slug={`/genre?genre=uncensored`}
          creator={props.creator}
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

        <Swipe
          title="Harem"
          slides={props.hompro?.genre?.harem || []}
          slug={`/genre?genre=harem`}
          creator={props.creator}
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
            src="/ad"
            title="Sponsored Ad"
            scrolling="no"

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

        <Swipe
          title="School Girls"
          slides={props.hompro?.genre?.["school-girls"] || []}
          slug={`/genre?genre=school-girls`}
          creator={props.creator}
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

        <Swipe
          title="Large Breasts"
          slides={props.hompro?.genre?.["large-breasts"] || []}
          slug={`/genre?genre=large-breasts`}
          creator={props.creator}
        />

        {/* 📱 MOBILE STICKY */}
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

        <Footer creator={props.creator} />

      </div>
    </SessionProvider>
  );
};

export default Home;