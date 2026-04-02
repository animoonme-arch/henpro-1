require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const DOMAIN = "https://hentaio.pro";

// 🔥 CONFIG (you can tweak this)
const MAX_URLS_PER_SITEMAP = 25000;

const PUBLIC_DIR = path.join(__dirname, "../../public");
const SITEMAP_DIR = path.join(PUBLIC_DIR, "sitemaps");

const API_SERVERS = [
  "https://api.hentaio.pro",
  "https://api2.hentaio.pro",
  "https://api3.hentaio.pro",
];

let serverIndex = 0;

function getNextServer() {
  const server = API_SERVERS[serverIndex];
  serverIndex = (serverIndex + 1) % API_SERVERS.length;
  return server;
}

// =====================
// 🔹 FETCH FUNCTIONS
// =====================

async function fetchEpisodes(page) {
  const server = getNextServer();
  const url = `${server}/api/episodes?page=${page}`;
  const res = await axios.get(url, { timeout: 15000 });
  return res.data;
}

async function fetchSpecial(page) {
  const server = getNextServer();
  const url = `${server}/api/special-home?page=${page}`;
  const res = await axios.get(url, { timeout: 15000 });
  return res.data;
}

// =====================
// 🔹 HELPERS
// =====================

function transformSpecialLink(originalUrl) {
  try {
    const url = new URL(originalUrl);
    const slug = url.pathname.replace(/^\/|\/$/g, "");
    return `${DOMAIN}/special/${slug}`;
  } catch {
    return null;
  }
}

function createUrlBlock(link) {
  return `
  <url>
    <loc>${link}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
}

// =====================
// 🔹 MAIN GENERATOR
// =====================

async function generate() {
  try {
    console.log("🚀 Generating optimized sitemap...");

    if (!fs.existsSync(SITEMAP_DIR)) {
      fs.mkdirSync(SITEMAP_DIR, { recursive: true });
    }

    const epFirst = await fetchEpisodes(1);
    const spFirst = await fetchSpecial(1);

    const epTotal = epFirst.totalPages;
    const spTotal = spFirst.totalPages;

    console.log("📄 Episodes pages:", epTotal);
    console.log("📄 Special pages:", spTotal);

    let allUrls = [];

    // =====================
    // 🔹 COLLECT EPISODES
    // =====================
    for (let page = 1; page <= epTotal; page++) {
      const data = await fetchEpisodes(page);

      data.data.recentEpisodes.forEach((ep) => {
        allUrls.push(`${DOMAIN}/${ep.link}`);
      });

      console.log(`📥 Episodes page ${page} collected`);
    }

    // =====================
    // 🔹 COLLECT SPECIAL
    // =====================
    for (let page = 1; page <= spTotal; page++) {
      const data = await fetchSpecial(page);

      data.data.forEach((item) => {
        const link = transformSpecialLink(item.link);
        if (link) allUrls.push(link);
      });

      console.log(`📥 Special page ${page} collected`);
    }

    // =====================
    // 🔹 OPTIONAL DEDUPE
    // =====================
    allUrls = [...new Set(allUrls)];

    console.log("📊 Total unique URLs:", allUrls.length);

    // =====================
    // 🔹 SPLIT INTO CHUNKS
    // =====================
    let sitemapCount = 1;

    for (let i = 0; i < allUrls.length; i += MAX_URLS_PER_SITEMAP) {
      const chunk = allUrls.slice(i, i + MAX_URLS_PER_SITEMAP);

      let urls = chunk.map(createUrlBlock).join("");

      const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

      fs.writeFileSync(
        path.join(SITEMAP_DIR, `sitemap-${sitemapCount}.xml`),
        content
      );

      console.log(
        `✅ sitemap-${sitemapCount} (${chunk.length} URLs)`
      );

      sitemapCount++;
    }

    // =====================
    // 🔹 INDEX FILE
    // =====================
    let indexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    for (let i = 1; i < sitemapCount; i++) {
      indexContent += `
  <sitemap>
    <loc>${DOMAIN}/sitemaps/sitemap-${i}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
    }

    indexContent += `
</sitemapindex>`;

    fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), indexContent);

    console.log("🎉 DONE: Optimized sitemaps generated!");
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  }
}

generate();