"use client";
import React, { useState } from "react";
import Slab from "@/components/Slab/Slab";
import Profito from "@/components/Profito/Profito";
import MyComponent from "@/components/ContinueWatching/ContinueWatching";
import WatchList from "@/components/WatchList/WatchList";
// import Settings from "@/component/Settings/Settings";
// import Notification from "@/component/Notification/Notification";
import { SessionProvider } from "next-auth/react";
import Navbar from "../Navbar/Navbar";
import Profilo from "../Profilo/Profilo";
import SignInSignUpModal from "../SignSignup/SignInSignUpModal";
import Notification from "../Notification/Notification";
import Footer from "../footer/Footer";
// import Footer from "../Footer/Footer";
// import MonetizePage from "../monetize/page";

// /watch

export default function User(props) {
  const slabId = props.id.replace("-", " ");

  const [selectL, setSelectL] = useState("en");
  const [profiIsOpen, setProfiIsOpen] = useState(false);
  const [logIsOpen, setLogIsOpen] = useState(false);
  const sign = (sign) => {
    setLogIsOpen(sign);
  };

  const lang = (lang) => {
    setSelectL(lang);
    props.omin(lang);
  };

  return (
    <>
      <SessionProvider>
        <Navbar
          lang={lang}
          sign={sign}
          setProfiIsOpen={setProfiIsOpen}
          profiIsOpen={profiIsOpen}
          refer={props.refer}
          creator={props.creator}
        />
        {profiIsOpen ? (
          <Profilo setProfiIsOpen={setProfiIsOpen} profiIsOpen={profiIsOpen} refer={props.refer} creator={props.creator}/>
        ) : (
          ""
        )}
        {logIsOpen ? (
          <SignInSignUpModal
            logIsOpen={logIsOpen}
            setLogIsOpen={setLogIsOpen}
            sign={sign}
            refer={props.refer}
            creator={props.creator}
          />
        ) : (
          ""
        )}
        <div> 
          <Slab slabId={slabId} refer={props.refer} creator={props.creator}/>
        </div>
        {props.id === "profile" ? <Profito refer={props.refer} creator={props.creator}/> : ""}
        {props.id === "continue-watching" ? <MyComponent page={props.page} refer={props.refer} creator={props.creator}/> : ""}
        {props.id === "watch-list" ? <WatchList type={props.type} ipage={props.page} refer={props.refer} creator={props.creator}/> : ""}
        {/* {props.id === "settings" ? <Settings refer={props.refer}/> : ""} */}
        {props.id === "notification" ? <Notification refer={props.refer} creator={props.creator}/> : ""}
        {/* {props.id === "monetize" ? <MonetizePage creator={props.creator}/> : ""} */}
        <div>
          <Footer creator={props.creator}/>
        </div>
      </SessionProvider> 
    </>
  );
}
