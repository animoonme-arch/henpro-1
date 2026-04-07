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
    const containerRef = useRef(null);

    useEffect(() => {
        if (!type || !adConfig[type]) return;

        const { key, width, height } = adConfig[type];

        const script1 = document.createElement("script");
        script1.innerHTML = `
      atOptions = {
        'key' : '${key}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;

        const script2 = document.createElement("script");
        script2.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
        script2.async = true;

        const container = containerRef.current;
        if (container) {
            container.innerHTML = ""; // prevent duplicate ads
            container.appendChild(script1);
            container.appendChild(script2);
        }
    }, [type]);

    return (
        <div
            ref={containerRef}
            style={{
                display: "flex",
                justifyContent: "center",
                margin: "16px 0",
            }}
        />
    );
}