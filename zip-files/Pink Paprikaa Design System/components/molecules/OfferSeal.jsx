import React from "react";

/** Rotated diamond seal for offers. The brand's badge shape, at canvas scale. */
export function OfferSeal({ value = "50%", label = "Off", note, size = 260, tone = "light", bleed, corner = "top-right", style, ...rest }) {
  /* The counter-rotated number reaches ~0.32 x size from the centre, so a corner
     bleed above 0.18 x size would clip the value — the most important thing on
     the board. Any larger request is clamped. */
  const off = bleed ? Math.min(bleed, Math.round(size * 0.18)) : 0;
  const place = bleed
    ? {
        position: "absolute",
        top: corner.startsWith("top") ? -off : undefined,
        bottom: corner.startsWith("bottom") ? -off : undefined,
        right: corner.endsWith("right") ? -off : undefined,
        left: corner.endsWith("left") ? -off : undefined,
      }
    : null;
  const bg = tone === "light" ? "var(--ink-000)" : tone === "turmeric" ? "var(--turmeric)" : "var(--pink-500)";
  const fg = tone === "light" ? "var(--pink-600)" : tone === "turmeric" ? "var(--ink-900)" : "var(--ink-000)";
  return (
    <div
      style={{
        width: size, height: size, flex: "0 0 auto", background: bg,
        borderRadius: size * 0.14, transform: "rotate(45deg)",
        display: "grid", placeItems: "center", boxShadow: "var(--shadow-3)", ...place, ...style,
      }}
      {...rest}
    >
      <div style={{ transform: "rotate(-45deg)", textAlign: "center", display: "grid", gap: 2 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: size * 0.3, lineHeight: 1, letterSpacing: "-.03em", color: fg }}>{value}</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.1, letterSpacing: "var(--ls-overline)", textTransform: "uppercase", color: fg, opacity: 0.85 }}>{label}</span>
        {note ? <span style={{ fontFamily: "var(--font-body)", fontSize: size * 0.065, color: fg, opacity: 0.7 }}>{note}</span> : null}
      </div>
    </div>
  );
}
