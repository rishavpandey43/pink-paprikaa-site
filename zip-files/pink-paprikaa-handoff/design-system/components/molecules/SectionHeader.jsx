import React from "react";

/** Overline + heading + optional lede and trailing action. */
export function SectionHeader({ overline, title, lede, action, align = "start", on = "light", style, ...rest }) {
  const center = align === "center";
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: center ? "center" : "space-between", gap: 24, flexWrap: "wrap", textAlign: center ? "center" : "left", ...style }} {...rest}>
      <div style={{ maxWidth: center ? "56ch" : "48ch", margin: center ? "0 auto" : undefined, minWidth: 0 }}>
        {overline ? (
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--fs-overline)", letterSpacing: "var(--ls-overline)", textTransform: "uppercase", color: on === "brand" ? "rgba(255,255,255,.8)" : "var(--text-brand)" }}>{overline}</div>
        ) : null}
        <h2 className="pp-fluid-h2" style={{ margin: "10px 0 0", color: on === "brand" ? "var(--ink-000)" : "var(--text-heading)", textWrap: "pretty" }}>{title}</h2>
        {lede ? <p style={{ margin: "12px 0 0", fontSize: "var(--fs-body-lg)", color: on === "brand" ? "rgba(255,255,255,.85)" : "var(--text-muted)" }}>{lede}</p> : null}
      </div>
      {action && !center ? <div style={{ flex: "0 0 auto" }}>{action}</div> : null}
    </div>
  );
}
