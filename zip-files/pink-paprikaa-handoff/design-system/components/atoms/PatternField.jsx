import React from "react";

/** The brand's only texture: the diamond symbol tiled at low opacity. */
export function PatternField({ tone = "brand", tile = 96, opacity, base = "/assets", radius, children, style, ...rest }) {
  const bg = tone === "brand" ? "var(--pink-500)" : tone === "ink" ? "var(--ink-900)" : tone === "soft" ? "var(--pink-100)" : "var(--ink-000)";
  const mark = tone === "soft" || tone === "light" ? "symbol-pink.svg" : "symbol-white.svg";
  const op = opacity != null ? opacity : tone === "soft" || tone === "light" ? 0.09 : 0.08;
  return (
    <div data-surface={tone === "brand" ? "brand" : tone === "ink" ? "ink" : tone === "soft" ? "soft" : undefined} style={{ position: "relative", overflow: "hidden", background: bg, borderRadius: radius, ...style }} {...rest}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url(" + base + "/" + mark + ")", backgroundSize: tile + "px", opacity: op, pointerEvents: "none" }} />
      <div style={{ position: "relative", height: "100%" }}>{children}</div>
    </div>
  );
}
