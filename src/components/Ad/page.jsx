"use client";
import { useEffect, useRef } from "react";

const adConfig = {
  "300x250": {
    key: "572c88010fa6a2ac86e4ba2c4f58dc0b",
    width: 300,
    height: 250,
  },
  "320x50": {
    key: "b4f57bd16fadcdfa927f6a9fa332fd42",
    width: 320,
    height: 50,
  },
  "728x90": {
    key: "df12cd120c8ea551d37e553455c6e10c",
    width: 728,
    height: 90,
  },
};

export default function Ad({ type }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!adConfig[type]) return;

    const { key, width, height } = adConfig[type];
    const container = ref.current;

    if (!container) return;

    // Clear previous ad
    container.innerHTML = "";

    // ✅ Create iframe (isolated environment)
    const iframe = document.createElement("iframe");
    iframe.width = width;
    iframe.height = height;
    iframe.style.width = width + "px";
    iframe.style.height = height + "px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.style.display = "block";
    iframe.setAttribute("scrolling", "no");

    container.appendChild(iframe);

    // ✅ Inject ad script inside iframe
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <script>
            atOptions = {
              key: "${key}",
              format: "iframe",
              height: ${height},
              width: ${width},
              params: {}
            };
          </script>
          <script src="https://www.highperformanceformat.com/${key}/invoke.js"></script>
        </body>
      </html>
    `);
    doc.close();

  }, [type]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        maxWidth: adConfig[type]?.width,
        margin: "16px auto",
        display: "flex",
        justifyContent: "center",
      }}
    />
  );
}