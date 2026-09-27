import React from "react";

/** Loading indicator: the brand mark, pulsing. Never a gradient ring. */
export function Spinner({ size = 36, tone = "brand", base = "/assets", label = "Loading", style, ...rest }) {
  const mark = tone === "inverse" ? "symbol-white.svg" : "symbol-pink.svg";
  return (
    <span role="status" aria-label={label} style={{ display: "inline-flex", alignItems: "center", gap: 10, ...style }} {...rest}>
      <img
        src={base + "/" + mark} alt=""
        style={{
          width: size, height: size, flex: "0 0 auto", objectFit: "contain",
          animation: "pp-mark-pulse 1.2s var(--ease-in-out) infinite",
          filter: tone === "ink" ? "grayscale(1) brightness(.25)" : undefined,
        }}
      />
    </span>
  );
}
