import React from "react";
import HorizontalSlabs from "../HorizontalSlabs/HorizontalSlabs";
import Sidebar from "../Sidebar/Sidebar";
import "../Watch/Watch.css";
import Navbar from "../Navbar/Navbar";
import Footer from "../footer/Footer";

const SearchInner = (props) => {
  return (
    <>
      <Navbar now={false} />
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
      <div className="compli">
        <div className="watc">
          <HorizontalSlabs
            data={props.data.data.results}
            keyword={props.keyword}
          />
        </div>
        <div className="sidc">
          <Sidebar sidebar={props.data.data.sidebar} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SearchInner;
