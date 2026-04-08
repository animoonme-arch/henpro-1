import React from "react";
import Card from "../Cards/Cards";
import Sidebar from "../Sidebar/Sidebar";
import "../Watch/Watch.css";
import Footer from "../footer/Footer";
import Navbar from "../Navbar/Navbar";

// /watch

const ReleaseInner = (props) => {
  return (
    <>
      <Navbar now={false} creator={props.creator} />
      <div className="compli">
        <div className="watc">
          <Card
            data={props.data}
            link={`release?year=${props.year}`}
            heading={props.year + " Hentai"}
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

export default ReleaseInner;
