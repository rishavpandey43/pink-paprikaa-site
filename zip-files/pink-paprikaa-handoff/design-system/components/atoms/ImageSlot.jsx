import React from "react";

const RATIOS = { square: "1 / 1", "4:3": "4 / 3", "3:4": "3 / 4", "4:5": "4 / 5", "16:9": "16 / 9", "16:10": "16 / 10", wide: "21 / 9" };

/** Photography placeholder. No brand photography exists yet, so every image
    slot states the exact crop it needs instead of shipping a grey box. */
export function ImageSlot({ src, alt = "", label = "Dish photo", ratio = "4:3", radius = "var(--radius-md)", tone = "soft", fill, style, ...rest }) {
  const bg = tone === "ink" ? "var(--ink-200)" : tone === "strong" ? "var(--pink-200)" : "var(--pink-100)";
  const fg = tone === "ink" ? "var(--ink-500)" : tone === "strong" ? "var(--pink-700)" : "var(--pink-400)";
  return (
    <div
      style={{
        aspectRatio: fill ? undefined : RATIOS[ratio] || ratio,
        height: fill ? "100%" : undefined, width: "100%",
        borderRadius: radius, overflow: "hidden",
        background: src ? `center/cover no-repeat url(${src})` : bg,
        display: "grid", placeItems: "center", ...style,
      }}
      {...rest}
    >
      {src ? null : (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: fg, textAlign: "center", padding: "0 12px", textWrap: "balance" }}>
          {label}
        </span>
      )}
      {src && alt ? <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{alt}</span> : null}
    </div>
  );
}
