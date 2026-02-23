// app/page.js

import Advertize from "@/components/Advertize/Advertize";
import Home from "@/components/Home/Home";
import { connectDB } from "@/lib/mongoClient";
import React from "react";

// ✨ NEXT.JS CONFIG: Force dynamic rendering to ensure searchParams are always current
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  const creatorApiKey = searchParams?.creator;

  // --- Start Dynamic Ad Link Logic ---
  const DEFAULT_AD_LINK =
    "https://violentlinedexploit.com/ukqgqrv4n?key=acf2a1b713094b78ec1cc21761e9b149";
  let dynamicAdLink = DEFAULT_AD_LINK;

  if (creatorApiKey) {
    try {
      // Ensure you are using destructuring: const { db } = await connectDB();
      const db = await connectDB();
      const collection = db.collection("creators");

      const creatorData = await collection.findOne(
        { username: creatorApiKey },
        { projection: { adsterraSmartlink: 1, _id: 0 } }
      );

      if (creatorData && creatorData.adsterraSmartlink) {
        dynamicAdLink = creatorData.adsterraSmartlink;
      }
    } catch (error) {
      console.error(
        "MongoDB fetch failed for creator on homepage:",
        creatorApiKey,
        error
      );
    }
  }
  // --- End Dynamic Ad Link Logic ---

  // 🧠 Fetch from API
  const res = await fetch("https://api.henpro.fun/api/homepage", {
    next: { revalidate: 3600 },
  });
  const recentEpi = await res.json();

  // 🧩 Connect MongoDB
  const db = await connectDB();

  // 🗂️ Fetch latest hompro document
  const homproData = await db
    .collection("hompros")
    .findOne({}, { sort: { createdAt: -1 } });

  // 🧼 Convert to plain object
  const hompro = JSON.parse(JSON.stringify(homproData));

  return (
    <div>
      <Home recentEpi={recentEpi} hompro={hompro} creator={creatorApiKey}/>
      <Advertize initialAdLink={dynamicAdLink} />
    </div>
  );
}
