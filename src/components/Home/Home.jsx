"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";
import Navbar from "../Navbar/Navbar";
import Hero from "../Hero/Hero";
import RecentEpisodes from "../RecentEpisodes/RecentEpisodes";
import ShareSlab from "../ShareSlab/ShareSlab";
import Swipe from "../Swipe/Hero";
import Footer from "../footer/Footer";
import "./home.css";

const Home = (props) => {
  return (
    <SessionProvider>
      <div>
        <Navbar now={true} creator={props.creator} />
        <Hero recentEpi={props.recentEpi} creator={props.creator} />

        {/* Ad */}
        <div className="ad-container">
          <iframe src="/ad" title="Sponsored Ad" scrolling="no" />
        </div>

        {/* SPECIAL GRID SECTION */}
        <section className="special-section">
          <div className="special-grid-wrapper">
            <h2 className="special-title">🔥 Trending 3D Videos</h2>

            <div className="special-grid">
              {props.specialHome?.data?.map((item, index) => {
                const slug = new URL(item.link).pathname.replace(/\/$/, "");
                const internalLink = `/special${slug}`;

                const previewVideo = item.thumbnail
                  .replace(/-\d+x\d+\.webp$/, ".mp4")
                  .split("/")
                  .pop();

                return (
                  <a
                    key={index}
                    href={internalLink}
                    className="special-card"
                    onMouseEnter={(e) => {
                      const video = e.currentTarget.querySelector("video");
                      if (video) video.play();
                    }}
                    onMouseLeave={(e) => {
                      const video = e.currentTarget.querySelector("video");
                      if (video) {
                        video.pause();
                        video.currentTime = 0;
                      }
                    }}
                  >
                    <div className="thumb-wrapper">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="thumb-image"
                        loading="lazy"
                      />

                      <video
                        className="hover-preview"
                        src={`/SPECIAL/${previewVideo}`}
                        muted
                        loop
                        playsInline
                        preload="none"
                      />

                      <span className="duration">{item.duration}</span>
                      <span className="rating">{item.rating}</span>
                    </div>

                    <p className="title">{item.title}</p>

                    <div className="meta">
                      <span>{item.views}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <RecentEpisodes
          recentEpi={props.recentEpi.data.recentEpisodes}
          creator={props.creator}
        />

        <ShareSlab
          pageId={"home"}
          url={`https://henpro.fun/`}
          title={"Watch Hentai on Henpro"}
          pageName="Henpro"
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