require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const DOMAIN = "https://hentaio.pro";

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

  try {
    const res = await axios.get(url, { timeout: 15000 });
    return res.data;
  } catch (error) {
    console.error(`❌ Episodes failed page ${page}`);
    throw error;
  }
}

async function fetchSpecial(page) {
  const server = getNextServer();
  const url = `${server}/api/special-home?page=${page}`;

  try {
    const res = await axios.get(url, { timeout: 15000 });
    return res.data;
  } catch (error) {
    console.error(`❌ Special failed page ${page}`);
    throw error;
  }
}

// =====================
// 🔹 URL HELPERS
// =====================

// Convert external link → internal /special/slug
function transformSpecialLink(originalUrl) {
  try {
    const url = new URL(originalUrl);

    // remove leading/trailing slash
    const slug = url.pathname.replace(/^\/|\/$/g, "");

    return `${DOMAIN}/special/${slug}`;
  } catch (err) {
    console.error("❌ Invalid URL:", originalUrl);
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
    console.log("🚀 Generating sitemap...");

    // ensure folders exist
    if (!fs.existsSync(SITEMAP_DIR)) {
      fs.mkdirSync(SITEMAP_DIR, { recursive: true });
    }

    // 🔥 get total pages
    const epFirst = await fetchEpisodes(1);
    const spFirst = await fetchSpecial(1);

    const epTotal = epFirst.totalPages;
    const spTotal = spFirst.totalPages;

    console.log("📄 Episodes pages:", epTotal);
    console.log("📄 Special pages:", spTotal);

    let sitemapCount = 1;

    // =====================
    // 🔹 EPISODES
    // =====================
    for (let page = 1; page <= epTotal; page++) {
      const data = await fetchEpisodes(page);

      let urls = "";

      data.data.recentEpisodes.forEach((ep) => {
        const link = `${DOMAIN}/${ep.link}`;
        urls += createUrlBlock(link);
      });

      const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

      fs.writeFileSync(
        path.join(SITEMAP_DIR, `sitemap-${sitemapCount}.xml`),
        content,
      );

      console.log(`✅ Episodes sitemap-${sitemapCount}`);
      sitemapCount++;
    }

    // =====================
    // 🔹 SPECIAL-HOME
    // =====================
    for (let page = 1; page <= spTotal; page++) {
      const data = await fetchSpecial(page);

      let urls = "";

      data.data.forEach((item) => {
        const transformed = transformSpecialLink(item.link);

        if (transformed) {
          urls += createUrlBlock(transformed);
        }
      });

      const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

      fs.writeFileSync(
        path.join(SITEMAP_DIR, `sitemap-${sitemapCount}.xml`),
        content,
      );

      console.log(`✅ Special sitemap-${sitemapCount}`);
      sitemapCount++;
    }

    // =====================
    // 🔹 SITEMAP INDEX
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

    console.log("🎉 DONE: All sitemaps generated!");
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  }
}

generate();
