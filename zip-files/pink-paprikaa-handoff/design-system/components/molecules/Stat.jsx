import React from "react";
import { Icon } from "../atoms/Icon.jsx";

/** Big-number fact. Display weight number, one short line under it. */
export function Stat({ value, label, sub, icon, tone = "ink", align = "start", style, ...rest }) {
  const c = tone === "brand" ? "var(--pink-600)" : tone === "inverse" ? "var(--ink-000)" : "var(--text-heading)";
  return (
    <div style={{ display: "grid", gap: 4, justifyItems: align, textAlign: align === "center" ? "center" : "left", ...style }} {...rest}>
      {icon ? <Icon name={icon} size="lg" style={{ color: tone === "inverse" ? "rgba(255,255,255,.7)" : "var(--pink-500)", marginBottom: 4 }} /> : null}
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(30px,3.4vw,42px)", lineHeight: 1.02, letterSpacing: "-.025em", color: c }}>{value}</span>
      <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15, color: tone === "inverse" ? "rgba(255,255,255,.82)" : "var(--text-body)" }}>{label}</span>
      {sub ? <span style={{ fontSize: 13, color: tone === "inverse" ? "rgba(255,255,255,.6)" : "var(--text-subtle)" }}>{sub}</span> : null}
    </div>
  );
}
