import React from "react";

const FILES = {
  lockup: "logo-lockup",
  wordmark: "logo-wordmark",
  symbol: "symbol",
};

/** Wraps the supplied logo files so nobody recolours or rebuilds the mark.

    lockup   — the official logo, tagline included. The default; use it wherever
               there is room for at least 200px of width.
    wordmark — the same artwork without the tagline, for headers and UI chrome
               where the lockup's tagline would fall below ~9px and stop reading.
    symbol   — the interlocked diamond mark alone, for avatars, favicons, loaders
               and tight badges. Square, so it drops straight into a 1:1 slot. */
export function Logo({ variant = "lockup", tone = "pink", height, width, base = "/assets", style, ...rest }) {
  const kind = FILES[variant] || FILES.lockup;
  const file = kind + "-" + (tone === "badge" ? "badge" : tone === "white" ? "white" : "pink") + ".svg";
  const defaultWidth = variant === "symbol" ? 40 : variant === "wordmark" ? 180 : 240;
  return (
    <img
      src={base + "/" + file}
      alt="Pink Paprikaa — India's First Desi Urban Café"
      style={{ display: "block", flex: "0 0 auto", objectFit: "contain", maxWidth: "100%", height, width: height ? "auto" : width || defaultWidth, ...style }}
      {...rest}
    />
  );
}
