import React from "react";

/** Review score. Brand diamonds carrying the mark; symbol={true} drops the
    diamond and uses the bare mark.
    Partial scores clip in SCREEN space across the diamond's true bounding box,
    so 4.3 fills exactly 30% of the fifth diamond's width. */
export function Rating({ value = 5, max = 5, count, size = 16, symbol, base = "/assets", showValue = true, style, ...rest }) {
  // Small diamonds need a bigger, stronger mark or the glyph does not resolve.
  const MS = size < 14 ? 0.86 : size < 20 ? 0.8 : 0.74;
  const OP = { white: size < 14 ? 0.85 : size < 20 ? 0.66 : 0.5, pink: size < 14 ? 0.8 : size < 20 ? 0.62 : 0.5 };
  // A square of side `size` rotated 45deg has a bounding box of size * sqrt(2),
  // starting size * 0.2071 to the left of the unrotated box.
  const OVER = size * 0.2071;
  const BBOX = size * 1.4142;

  const mark = (src, opacity) => (
    <img src={base + "/symbol-" + src + ".svg"} alt=""
      style={{ width: MS * 100 + "%", height: MS * 100 + "%", maxWidth: "none", objectFit: "contain", transform: "rotate(-45deg)", opacity }} />
  );
  const diamond = (bg, markSrc, opacity, left, top) => (
    <span style={{ position: "absolute", left: left || 0, top: top || 0, width: size, height: size, transform: "rotate(45deg)", borderRadius: 2, overflow: "hidden", background: bg, display: "grid", placeItems: "center" }}>
      {mark(markSrc, opacity)}
    </span>
  );

  const unit = (i) => {
    const f = Math.max(0, Math.min(1, value - i));
    if (symbol) {
      return (
        <span key={i} style={{ position: "relative", width: size, height: size, flex: "0 0 auto", display: "block" }}>
          <img src={base + "/symbol-pink.svg"} alt="" style={{ position: "absolute", inset: 0, width: size, height: size, objectFit: "contain", opacity: 0.22 }} />
          <span style={{ position: "absolute", inset: 0, width: f * 100 + "%", overflow: "hidden" }}>
            <img src={base + "/symbol-pink.svg"} alt="" style={{ width: size, height: size, maxWidth: "none", objectFit: "contain", display: "block" }} />
          </span>
        </span>
      );
    }
    return (
      <span key={i} style={{ position: "relative", width: size, height: size, flex: "0 0 auto", display: "block" }}>
        {diamond("var(--ink-200)", "pink", OP.pink)}
        {f > 0 ? (
          <span style={{ position: "absolute", left: -OVER, top: -OVER, width: f * BBOX, height: BBOX, overflow: "hidden" }}>
            {diamond("var(--pink-500)", "white", OP.white, OVER, OVER)}
          </span>
        ) : null}
      </span>
    );
  };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }} {...rest}>
      <span style={{ display: "inline-flex", gap: symbol ? 3 : size * 0.4142 + 4, alignItems: "center" }} role="img" aria-label={value + " out of " + max}>
        {Array.from({ length: max }, (_, i) => unit(i))}
      </span>
      {showValue ? <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-heading)" }}>{value.toFixed(1)}</span> : null}
      {count != null ? <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>({count.toLocaleString("en-IN")})</span> : null}
    </span>
  );
}
