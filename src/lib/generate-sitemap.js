require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const DOMAIN = "https://henpro.fun";

// ✅ FIXED PATH (VERY IMPORTANT)
const PUBLIC_DIR = path.join(__dirname, "../../public");
const SITEMAP_DIR = path.join(PUBLIC_DIR, "sitemaps");

const API_SERVERS = [
  "https://api.henpro.fun",
  "https://api2.henpro.fun",
  "https://api3.henpro.fun",
];

let serverIndex = 0;

function getNextServer() {
  const server = API_SERVERS[serverIndex];
  serverIndex = (serverIndex + 1) % API_SERVERS.length;
  return server;
}

async function fetchPage(page) {
  const server = getNextServer();
  const url = `${server}/api/episodes?page=${page}`;

  try {
    const res = await axios.get(url, { timeout: 15000 });
    return res.data;
  } catch (error) {
    console.error(`❌ Failed fetching page ${page} from ${server}`);
    throw error;
  }
}

async function generate() {
  try {
    console.log("🚀 Generating sitemap...");

    // Ensure directories exist
    if (!fs.existsSync(SITEMAP_DIR)) {
      fs.mkdirSync(SITEMAP_DIR, { recursive: true });
    }

    // Fetch first page
    const first = await fetchPage(1);
    const totalPages = first.totalPages;

    console.log("📄 Total pages:", totalPages);

    // Generate per-page sitemaps
    for (let page = 1; page <= totalPages; page++) {
      const data = await fetchPage(page);

      let urls = "";

      data.data.recentEpisodes.forEach((ep) => {
        urls += `
  <url>
    <loc>${DOMAIN}/watch/${ep.link}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
      });

      const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

      fs.writeFileSync(
        path.join(SITEMAP_DIR, `sitemap-${page}.xml`),
        sitemapContent
      );

      console.log(`✅ Generated sitemap-${page}.xml`);
    }

    // Generate sitemap index
    let indexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    for (let page = 1; page <= totalPages; page++) {
      indexContent += `
  <sitemap>
    <loc>${DOMAIN}/sitemaps/sitemap-${page}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
    }

    indexContent += `
</sitemapindex>`;

    fs.writeFileSync(
      path.join(PUBLIC_DIR, "sitemap.xml"),
      indexContent
    );

    console.log("🎉 Sitemap index generated successfully!");
  } catch (err) {
    console.error("❌ Sitemap generation failed:", err.message);
    process.exit(1);
  }
}

generate();