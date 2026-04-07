"use client";
import { useEffect, useRef } from "react";

const adConfig = {
  "300x250": {
    key: "843e5a57237a4fb70eb86f5a83a1db27",
    width: 300,
    height: 250,
  },
  "320x50": {
    key: "1fab716da86beccb937f53edda1104f1",
    width: 320,
    height: 50,
  },
  "728x90": {
    key: "9a5122810fe0cfc4a0b7a688ca43cb94",
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
          <script src="https://violentlinedexploit.com/${key}/invoke.js"></script>
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