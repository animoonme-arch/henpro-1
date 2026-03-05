"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";
import Navbar from "../Navbar/Navbar";
import Hero from "../Hero/Hero";
import RecentEpisodes from "../RecentEpisodes/RecentEpisodes";
import ShareSlab from "../ShareSlab/ShareSlab";
import Swipe from "../Swipe/Hero";
import Footer from "../footer/Footer";
import "./home.css"

const Home = (props) => {
  return (
    <SessionProvider>
      <div>
        <Navbar now={true} creator={props.creator} />
        <Hero recentEpi={props.recentEpi} creator={props.creator} />

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

        <div>
          <div className="special-grid-wrapper">
            <h2 className="special-title">Trending 3D Videos</h2>

            <div className="special-grid">
              {props.specialHome?.data?.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  className="special-card"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="thumb-wrapper">
                    <img src={item.thumbnail} alt={item.title} />
                    <span className="duration">{item.duration}</span>
                  </div>

                  <p className="title">{item.title}</p>
                </a>
              ))}
            </div>
          </div>

          <RecentEpisodes recentEpi={props.recentEpi.data.recentEpisodes} creator={props.creator} />

          <ShareSlab
            pageId={"home"}
            url={`https://henpro.fun/`}
            title={"Watch Hentai on Henpro"}
            pageName="Henpro"
            creator={props.creator}
          />

          {/* 🌀 Independent Swipe carousels */}
          <Swipe
            title="Series"
            slides={props.hompro?.series || []}
            slug={`/series`}
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
        </div>
        <Footer creator={props.creator} />
      </div>
    </SessionProvider>
  );
};

export default Home;
