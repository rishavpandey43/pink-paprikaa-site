import React from "react";

/** Loading placeholder in --pink-100. Pair with the pulsing diamond for pages. */
export function Skeleton({ width = "100%", height = 16, radius = "var(--radius-sm)", circle, lines, style, ...rest }) {
  const block = (w, i) => (
    <span
      key={i}
      style={{
        display: "block", width: w, height,
        borderRadius: circle ? "var(--radius-pill)" : radius,
        background: "var(--pink-100)",
        animation: "pp-skeleton 1.2s var(--ease-in-out) infinite",
      }}
    />
  );
  if (lines) {
    const widths = ["100%", "92%", "68%", "84%"];
    return <span style={{ display: "grid", gap: 8, ...style }} {...rest}>{Array.from({ length: lines }, (_, i) => block(widths[i % 4], i))}</span>;
  }
  return <span style={{ display: "block", ...style }} {...rest}>{block(width, 0)}</span>;
}
