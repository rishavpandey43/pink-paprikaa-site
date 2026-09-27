import React from "react";
import { Icon } from "../atoms/Icon.jsx";

/** −/+ quantity control used in cart rows and item detail. */
export function QuantityStepper({ value = 1, min = 0, max = 20, onChange, size = "md", style, ...rest }) {
  const h = size === "sm" ? 32 : 40;
  const step = (d) => { const n = Math.min(max, Math.max(min, value + d)); if (n !== value && onChange) onChange(n); };
  const btn = (icon, d, label) => (
    <button
      type="button" aria-label={label} onClick={() => step(d)}
      disabled={d < 0 ? value <= min : value >= max}
      style={{
        width: h, height: h, display: "grid", placeItems: "center",
        border: "none", background: "transparent",
        color: (d < 0 ? value <= min : value >= max) ? "var(--ink-400)" : "var(--pink-600)",
        cursor: (d < 0 ? value <= min : value >= max) ? "not-allowed" : "pointer",
        borderRadius: "var(--radius-pill)",
      }}
    >
      <Icon name={icon} size={size === "sm" ? "sm" : "md"} />
    </button>
  );
  return (
    <div
      style={{
        display: "inline-flex", alignItems: "center",
        border: "1px solid var(--pink-200)", background: "var(--pink-50)",
        borderRadius: "var(--radius-pill)", ...style,
      }}
      {...rest}
    >
      {btn("minus", -1, "Remove one")}
      <span style={{ minWidth: 22, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size === "sm" ? 14 : 16, color: "var(--text-heading)" }}>{value}</span>
      {btn("plus", 1, "Add one")}
    </div>
  );
}
