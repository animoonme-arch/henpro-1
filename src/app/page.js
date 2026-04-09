import Advertize from "@/components/Advertize/Advertize";
import Home from "@/components/Home/Home";
import { connectDB } from "@/lib/mongoClient";
import React from "react";

export const dynamic = "force-dynamic";

/* ---------------- FAILOVER FETCH ---------------- */
const apiDomains = [
  "https://api.hentaio.pro",
  "https://api2.hentaio.pro",
  "https://api3.hentaio.pro",
];

async function fetchWithFallback(path, revalidate = 3600) {
  for (const domain of apiDomains) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${domain}${path}`, {
        signal: controller.signal,
        next: { revalidate },
      });

      clearTimeout(timeout);

      if (!res.ok) throw new Error(`Failed on ${domain}`);

      return await res.json();
    } catch (err) {
      console.error("Homepage API failed:", domain, path, err.message);
    }
  }

  return null;
}

export default async function Page({ searchParams }) {
  const creatorApiKey = searchParams?.creator;

  /* ---------------- AD LOGIC ---------------- */

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

      if (creatorData?.adsterraSmartlink) {
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

  /* ---------------- API FETCH (FIXED) ---------------- */

  const [recentEpi, specialHome] = await Promise.all([
    fetchWithFallback("/api/homepage"),
    fetchWithFallback("/api/special-home"),
  ]);

  /* ---------------- DB FETCH ---------------- */

  let hompro = null;

  try {
    const db = await connectDB();
    const homproData = await db
      .collection("hompros")
      .findOne({}, { sort: { createdAt: -1 } });

    hompro = JSON.parse(JSON.stringify(homproData));
  } catch (err) {
    console.error("hompro fetch failed:", err);
  }

  /* ---------------- FAIL SAFE ---------------- */

  if (!recentEpi || !specialHome) {
    return (
      <div style={{ color: "white", padding: "40px" }}>
        Failed to load homepage. Please try again later.
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */

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