import React from "react";

const LABELS = ["Mild", "Medium", "Hot", "Extra Hot"];

// Small diamonds need a bigger, stronger mark or the glyph does not resolve.
const markScale = (s) => (s < 14 ? 0.86 : s < 20 ? 0.8 : 0.74);
const markAlpha = (s, onColour) => (s < 14 ? (onColour ? 0.85 : 0.8) : s < 20 ? (onColour ? 0.66 : 0.62) : (onColour ? 0.5 : 0.5));

/** Heat shown as brand diamonds on the --heat-* ramp. Never emoji.
    Each diamond carries the brand mark inside: white at 35% when filled,
    pink when the diamond is empty grey so the mark never blends away. */
export function SpiceLevel({ level = 1, max = 4, showLabel, size = 14, base = "/assets", style, ...rest }) {
  const tone = "var(--heat-" + Math.min(4, Math.max(1, level)) + ")";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }} {...rest}>
      <span style={{ display: "inline-flex", gap: size * 0.4142 + 4 }} role="img" aria-label={"Spice level " + level + " of " + max}>
        {Array.from({ length: max }, (_, i) => {
          const on = i < level;
          return (
            <span
              key={i}
              style={{
                position: "relative", width: size, height: size, flex: "0 0 auto",
                transform: "rotate(45deg)", borderRadius: 2, overflow: "hidden",
                background: on ? tone : "var(--ink-200)",
                display: "grid", placeItems: "center",
              }}
            >
              <img
                src={base + "/symbol-" + (on ? "white" : "pink") + ".svg"} alt=""
                style={{ width: markScale(size) * 100 + "%", height: markScale(size) * 100 + "%", objectFit: "contain", transform: "rotate(-45deg)", opacity: markAlpha(size, on) }}
              />
            </span>
          );
        })}
      </span>
      {showLabel ? (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--fs-overline)", letterSpacing: "var(--ls-overline)", textTransform: "uppercase", color: "var(--text-muted)" }}>
          {LABELS[Math.min(level, max) - 1]}
        </span>
      ) : null}
    </span>
  );
}
