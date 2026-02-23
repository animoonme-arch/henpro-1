import React from "react";
// import Slab from "@/component/Slab/Slab";
// import Profito from "@/component/Profito/Profito";
// import MyComponent from "@/component/ContinueWatching/ContinueWatching";
// import WatchList from "@/component/WatchList/WatchList";
// import Settings from "@/component/Settings/Settings";
// import Notification from "@/component/Notification/Notification";
import User from "@/components/User/user";
// import Script from "next/script";
// import Advertize from "@/component/Advertize/Advertize";
// import { connectDB } from "@/lib/mongoClient";

export async function generateMetadata({ params }) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Animoon"; // Default if env is missing
  const idd = "Anime";

  return {
    title: `Watch ${idd} English Sub/Dub online free on ${siteName}, free Anime Streaming`,
    description: `${siteName} is the best site to watch
                      ${idd} SUB online, or you can even
                      watch ${idd} DUB in HD quality. You
                      can also watch under rated anime
                      on ${siteName} website.`,
  };
}

export default async function page({ params, searchParams }) {
  const param = (await params).id;
  const searchParam = await searchParams;
  const refer = searchParam?.refer;
  const page = searchParam.page;
  const slabId = param.replace("-", " ");

  const creatorApiKey = searchParams.creator; // ✨ Get the creator API key

  // --- Start Dynamic Ad Link Logic ---
  const DEFAULT_AD_LINK =
    "https://violentlinedexploit.com/ukqgqrv4n?key=acf2a1b713094b78ec1cc21761e9b149";
  let dynamicAdLink = DEFAULT_AD_LINK;

  if (creatorApiKey) {
    try {
      // 1. Connect to MongoDB
      const db = await connectDB();
      // Assuming your collection is named 'creators'
      const collection = db.collection("creators");

      // 2. Fetch the creator data
      const creatorData = await collection.findOne(
        { username: creatorApiKey },
        // Project to only include the smartlink
        { projection: { adsterraSmartlink: 1, _id: 0 } }
      );

      // 3. Update the ad link if found
      if (creatorData && creatorData.adsterraSmartlink) {
        dynamicAdLink = creatorData.adsterraSmartlink;
      }
    } catch (error) {
      console.error(
        "MongoDB fetch failed for creator on trending page:",
        creatorApiKey,
        error
      );
      // Fallback to DEFAULT_AD_LINK
    }
  }
  // --- End Dynamic Ad Link Logic ---

  return (
    <>
      {/* <Script
        strategy="afterInteractive"
        src="//disgustingmad.com/a5/d2/60/a5d260a809e0ec23b08c279ab693d778.js"
      /> */}
      <div>
        <User
          type={searchParam.type}
          id={param}
          page={page}
          refer={searchParam.refer}
          creator={creatorApiKey}
        />
      </div>
      {/* <Advertize refer={""} /> */}
      {/* <Script
        src="//abackdamstubborn.com/b7/2f/b2/b72fb2e5a32c00a413ee2bb7ea85b317.js"
        strategy="afterInteractive"
        // "afterInteractive" means load script after page hydration
      /> */}
    </>
  );
}
