import React from "react";

/** Loyalty / order progress. Segmented by default — the brand's loyalty look. */
export function ProgressBar({ value = 0, max = 100, segments, label, tone = "brand", height = 8, style, ...rest }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  const fill = tone === "inverse" ? "var(--ink-000)" : tone === "mint" ? "var(--mint)" : "var(--pink-500)";
  const track = tone === "inverse" ? "rgba(255,255,255,.28)" : "var(--pink-200)";
  return (
    <div style={{ display: "grid", gap: 8, ...style }} {...rest}>
      {label ? <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: tone === "inverse" ? "rgba(255,255,255,.8)" : "var(--text-muted)" }}>{label}</span> : null}
      {segments ? (
        <div style={{ display: "flex", gap: 5 }} role="progressbar" aria-valuenow={value} aria-valuemax={segments}>
          {Array.from({ length: segments }, (_, i) => (
            <span key={i} style={{ flex: 1, height, borderRadius: "var(--radius-pill)", background: i < value ? fill : track, transition: "background var(--dur-base) var(--ease-out)" }} />
          ))}
        </div>
      ) : (
        <div style={{ height, borderRadius: "var(--radius-pill)", background: track, overflow: "hidden" }} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
          <span style={{ display: "block", width: `${pct * 100}%`, height: "100%", borderRadius: "var(--radius-pill)", background: fill, transition: "width var(--dur-slow) var(--ease-out)" }} />
        </div>
      )}
    </div>
  );
}
