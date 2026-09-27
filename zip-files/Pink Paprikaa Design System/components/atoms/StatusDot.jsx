import React from "react";

const TONES = {
  open: "var(--status-success)", busy: "var(--status-warning)",
  closed: "var(--ink-400)", live: "var(--pink-500)", danger: "var(--status-danger)",
};

// Small diamonds need a bigger, stronger mark or the glyph does not resolve.
const markScale = (s) => (s < 14 ? 0.86 : s < 20 ? 0.8 : 0.74);
const markAlpha = (s, onColour) => (s < 14 ? (onColour ? 0.85 : 0.8) : s < 20 ? (onColour ? 0.66 : 0.62) : (onColour ? 0.5 : 0.5));

/** Small state marker for outlet open/closed and live order states.
    A brand diamond with the mark inside it, held back so the dot still reads
    as a solid state colour first and a brand mark second. */
export function StatusDot({ tone = "open", label, pulse, size = 14, base = "/assets", style, ...rest }) {
  const c = TONES[tone] || TONES.open;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }} {...rest}>
      <span style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
        {pulse ? <span style={{ position: "absolute", inset: 0, background: c, borderRadius: 2, transform: "rotate(45deg)", animation: "pp-dot-pulse 1.6s var(--ease-out) infinite" }} /> : null}
        <span style={{ position: "absolute", inset: 0, background: c, borderRadius: 2, transform: "rotate(45deg)", overflow: "hidden", display: "grid", placeItems: "center" }}>
          <img src={base + "/symbol-white.svg"} alt=""
            style={{ width: markScale(size) * 100 + "%", height: markScale(size) * 100 + "%", objectFit: "contain", transform: "rotate(-45deg)", opacity: markAlpha(size, true) }} />
        </span>
      </span>
      {label ? <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13.5, color: "var(--text-body)" }}>{label}</span> : null}
    </span>
  );
}
