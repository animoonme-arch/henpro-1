import { PassThrough } from "stream";

export const runtime = "nodejs"; // IMPORTANT for streaming

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return new Response("Missing url parameter", { status: 400 });
    }

    const videoUrl = decodeURIComponent(url);
    const range = req.headers.get("range"); // e.g., "bytes=0-"

    const headers = {
      Referer: "https://watchhentai.net/",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
    };

    if (range) headers.Range = range;

    // Fetch the upstream video
    const upstream = await fetch(videoUrl, { headers });

    if (!upstream.ok || !upstream.body) {
      return new Response("Upstream video error", {
        status: upstream.status || 500,
      });
    }

    // Create a streaming response
    const stream = new PassThrough();
    upstream.body.pipeTo(stream.writable); // Pipe upstream to PassThrough

    const responseHeaders = new Headers();

    // Forward only safe streaming headers
    [
      "content-type",
      "content-range",
      "accept-ranges",
    ].forEach((key) => {
      const value = upstream.headers.get(key);
      if (value) responseHeaders.set(key, value);
    });

    // If content-length exists, set it (helps browser buffer properly)
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) responseHeaders.set("content-length", contentLength);

    return new Response(stream, {
      status: range ? 206 : 200,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Video proxy error:", err);
    return new Response("Video proxy failed", { status: 500 });
  }
}
