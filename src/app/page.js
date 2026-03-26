import Advertize from "@/components/Advertize/Advertize";
import Home from "@/components/Home/Home";
import { connectDB } from "@/lib/mongoClient";
import React from "react";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  const creatorApiKey = searchParams?.creator;

  const DEFAULT_AD_LINK =
    "https://violentlinedexploit.com/ukqgqrv4n?key=acf2a1b713094b78ec1cc21761e9b149";

  let dynamicAdLink = DEFAULT_AD_LINK;

  if (creatorApiKey) {
    try {
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

  const apiDomains = [
    "https://api.hentaio.pro",
    "https://api2.hentaio.pro",
    "https://api3.hentaio.pro",
  ];

  const randomDomain =
    apiDomains[Math.floor(Math.random() * apiDomains.length)];

  // 🔹 Homepage data
  const homeRes = await fetch(`${randomDomain}/api/homepage`, {
    next: { revalidate: 3600 },
  });
  const recentEpi = await homeRes.json();

  // 🔹 Special home data
  const specialRes = await fetch(`${randomDomain}/api/special-home`, {
    next: { revalidate: 3600 },
  });
  const specialHome = await specialRes.json();

  const db = await connectDB();

  const homproData = await db
    .collection("hompros")
    .findOne({}, { sort: { createdAt: -1 } });

  const hompro = JSON.parse(JSON.stringify(homproData));

  return (
    <div>
      <Home
        recentEpi={recentEpi}
        specialHome={specialHome}
        hompro={hompro}
        creator={creatorApiKey}
      />
      <Advertize initialAdLink={dynamicAdLink} />
    </div>
  );
}