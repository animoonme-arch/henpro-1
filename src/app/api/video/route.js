export const runtime = "edge";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response("Missing url query", { status: 400 });
  }

  const videoUrl = decodeURIComponent(url);

  try {
    const headers = {
      Referer: "https://watchhentai.net/",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
    };

    const range = req.headers.get("range");
    if (range) headers.Range = range;

    const upstream = await fetch(videoUrl, {
      headers,
    });

    // Only forward required headers
    const responseHeaders = new Headers();
    const allowed = [
      "content-type",
      "content-length",
      "accept-ranges",
      "content-range",
    ];

    allowed.forEach((h) => {
      const v = upstream.headers.get(h);
      if (v) responseHeaders.set(h, v);
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Video proxy error:", err);
    return new Response("Video load error", { status: 500 });
  }
}
