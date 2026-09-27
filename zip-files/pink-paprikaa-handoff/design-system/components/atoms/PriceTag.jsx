import React from "react";

/** Enforces ₹, no decimals on whole rupees, en-dash ranges, struck original. */
export function PriceTag({ amount, was, to, size = "md", tone = "ink", style, ...rest }) {
  const fs = { sm: 14, md: 17, lg: 22 }[size] || 17;
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2 })}`;
  const color = tone === "brand" ? "var(--pink-600)" : tone === "inverse" ? "var(--ink-000)" : "var(--text-heading)";
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8, ...style }} {...rest}>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: fs, letterSpacing: "-.01em", color }}>
        {to != null ? `${fmt(amount)}–${fmt(to)}` : fmt(amount)}
      </span>
      {was != null ? (
        <span style={{ fontFamily: "var(--font-body)", fontSize: fs * 0.78, color: "var(--text-subtle)", textDecoration: "line-through" }}>{fmt(was)}</span>
      ) : null}
    </span>
  );
}
