import { NextResponse } from "next/server";

function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing search query" },
      { status: 400 }
    );
  }

  try {
    const encodedQ = encodeURIComponent(query);

    /* ---------- HANIME SEARCH (UNCHANGED) ---------- */

    const hanimeURL = `https://watchhentai.net/wp-json/dooplay/search/?keyword=${encodedQ}&nonce=a78f393b43`;

    /* ---------- SPECIAL SEARCH DOMAINS ---------- */

    const apiDomains = [
      "https://api.hentaio.pro",
      "https://api2.hentaio.pro",
      "https://api3.hentaio.pro",
    ];

    const randomDomain =
      apiDomains[Math.floor(Math.random() * apiDomains.length)];

    const specialURL = `${randomDomain}/api/special-search?q=${encodedQ}`;

    /* ---------- PARALLEL REQUESTS ---------- */

    const [hanimeRes, specialRes] = await Promise.allSettled([
      fetch(hanimeURL, { cache: "no-store" }),
      fetch(specialURL, { cache: "no-store" }),
    ]);

    let hanimeResults = [];
    let specialResults = [];

    /* ---------- HANIME RESULTS ---------- */

    if (hanimeRes.status === "fulfilled" && hanimeRes.value.ok) {
      const data = await hanimeRes.value.json();

      hanimeResults = Object.entries(data).map(([id, item]) => ({
        id,
        title: item.title,
        url: item.url,
        img: item.img,
        date: item.extra?.date || null,
        source: "hanime",
      }));
    }

    /* ---------- SPECIAL RESULTS ---------- */

    if (specialRes.status === "fulfilled" && specialRes.value.ok) {
      const data = await specialRes.value.json();

      specialResults = (data.data || []).map((item) => ({
        id: item.slug,
        title: item.title,
        url: item.url,
        img: item.thumbnail,
        date: item.uploadDate || null,
        source: "special",
      }));
    }

    /* ---------- REMOVE DUPLICATES ---------- */

    const seen = new Set();

    const removeDuplicates = (arr) =>
      arr.filter((item) => {
        const key = normalizeTitle(item.title);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    hanimeResults = removeDuplicates(hanimeResults);
    specialResults = removeDuplicates(specialResults);

    /* ---------- BALANCED RESULTS ---------- */

    let combinedResults = [];

    if (hanimeResults.length >= 3 && specialResults.length >= 3) {
      combinedResults = [
        ...hanimeResults.slice(0, 3),
        ...specialResults.slice(0, 3),
      ];
    } else if (hanimeResults.length > 0 && specialResults.length > 0) {
      combinedResults = [...hanimeResults, ...specialResults].slice(0, 6);
    } else if (hanimeResults.length > 0) {
      combinedResults = hanimeResults.slice(0, 6);
    } else {
      combinedResults = specialResults.slice(0, 6);
    }

    return NextResponse.json({
      results: combinedResults,
    });
  } catch (err) {
    console.error("Search API error:", err);

    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 }
    );
  }
}