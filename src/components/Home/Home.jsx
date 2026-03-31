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
import "./home.css";

const Home = (props) => {

  // /watch

  const playPreview = (e) => {
    const video = e.currentTarget.querySelector("video");
    if (!video) return;

    if (!video.src) video.src = video.dataset.src;

    video.play().catch(()=>{});
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

        {/* AD */}
        <div className="ad-container">
          <iframe src="/ad" title="Sponsored Ad" scrolling="no" />
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
                <a
                  key={index}
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

                    {/* overlay */}
                    <div className="decent-overlay">
                      <FaPlay className="decent-play-icon" />
                    </div>

                    {/* duration */}
                    <span className="dabel-tag bottom dabel-default">
                      <FaClock className="inline-icon"/>
                      {item.duration}
                    </span>

                    {/* rating */}
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
              );
            })}

          </div>

        </section>

        <RecentEpisodes
          recentEpi={props.recentEpi.data.recentEpisodes}
          creator={props.creator}
        />

        <ShareSlab
          pageId={"home"}
          url={`https://hentaio.pro/`}
          title={"Watch Hentai on Hentaio"}
          pageName="Hentaio"
          creator={props.creator}
        />

        <Swipe
          title="Series"
          slides={props.hompro?.series || []}
          slug={`/series`}
          creator={props.creator}
        />

        <div className="ad-container">
          <iframe src="/ad" title="Sponsored Ad" scrolling="no" />
        </div>

        <Swipe
          title="Uncensored"
          slides={props.hompro?.genre?.uncensored || []}
          slug={`/genre?genre=uncensored`}
          creator={props.creator}
        />

        <Swipe
          title="Harem"
          slides={props.hompro?.genre?.harem || []}
          slug={`/genre?genre=harem`}
          creator={props.creator}
        />

        <Swipe
          title="School Girls"
          slides={props.hompro?.genre?.["school-girls"] || []}
          slug={`/genre?genre=school-girls`}
          creator={props.creator}
        />

        <Swipe
          title="Large Breasts"
          slides={props.hompro?.genre?.["large-breasts"] || []}
          slug={`/genre?genre=large-breasts`}
          creator={props.creator}
        />

        <Footer creator={props.creator} />

      </div>
    </SessionProvider>
  );
};

export default Home;