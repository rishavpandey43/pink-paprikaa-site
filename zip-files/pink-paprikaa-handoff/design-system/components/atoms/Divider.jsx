import React from "react";

/** Hairline rule. `diamond` inserts the brand mark as a section break. */
export function Divider({ variant = "line", label, on = "light", base = "/assets", style, ...rest }) {
  const color = on === "brand" ? "rgba(255,255,255,.28)" : "var(--border-subtle)";
  if (variant === "diamond") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, ...style }} {...rest}>
        <span style={{ flex: 1, height: 1, background: color }} />
        <img src={base + "/symbol-" + (on === "brand" ? "white" : "pink") + ".svg"} alt=""
          style={{ width: 16, height: 16, flex: "0 0 auto", objectFit: "contain", opacity: 0.9 }} />
        <span style={{ flex: 1, height: 1, background: color }} />
      </div>
    );
  }
  if (label) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14, ...style }} {...rest}>
        <span style={{ flex: 1, height: 1, background: color }} />
        <span style={{ flex: "0 0 auto", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--fs-overline)", letterSpacing: "var(--ls-overline)", textTransform: "uppercase", color: on === "brand" ? "rgba(255,255,255,.8)" : "var(--text-subtle)" }}>{label}</span>
        <span style={{ flex: 1, height: 1, background: color }} />
      </div>
    );
  }
  return <hr style={{ border: 0, height: 1, background: color, margin: 0, ...style }} {...rest} />;
}
