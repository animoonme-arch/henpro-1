import React from "react";
import Card from "../Cards/Cards";
import Sidebar from "../Sidebar/Sidebar";
import "../Watch/Watch.css";
import Navbar from "../Navbar/Navbar";
import Footer from "../footer/Footer";

// /watch

const GenreInner = (props) => {
  return (
    <>
      <Navbar now={false} creator={props.creator} />
      <div className="compli">
        <div className="watc flex flex-col">
          <Card
            data={props.data}
            link={`genre?genre=${props.genre}`}
            heading={
              props.genre
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ") + " Hentai"
            }
            creator={props.creator}
          />
        </div>

        <div className="sidc">
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
          <Sidebar sidebar={props.data.data.sidebar} creator={props.creator} />
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
        </div>
      </div>

      <Footer creator={props.creator} />
    </>
  );
};

export default GenreInner;
