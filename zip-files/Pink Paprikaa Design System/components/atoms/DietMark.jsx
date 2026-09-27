import React from "react";

/** Statutory Indian vegetarian mark. Pink Paprikaa is a pure-veg kitchen, so
    only "veg" (green square + dot) and "egg" (turmeric) exist. */
export function DietMark({ type = "veg", size = 16, style, ...rest }) {
  const color = type === "egg" ? "var(--turmeric)" : "#1a7a3c";
  const inner = size * 0.5;
  return (
    <span
      role="img"
      aria-label={type === "egg" ? "Contains egg" : "Vegetarian"}
      style={{
        display: "inline-grid", placeItems: "center", flex: "0 0 auto",
        width: size, height: size, border: `1.5px solid ${color}`,
        borderRadius: 2, ...style,
      }}
      {...rest}
    >
      <span style={{ width: inner, height: inner, background: color, borderRadius: "50%" }} />
    </span>
  );
}
