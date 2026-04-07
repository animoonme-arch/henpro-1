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

        container.innerHTML = "";

        const script = document.createElement("script");
        script.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
        script.async = true;

        // 👇 IMPORTANT: set atOptions BEFORE script loads
        window.atOptions = {
            key,
            format: "iframe",
            height,
            width,
            params: {},
        };

        container.appendChild(script);
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