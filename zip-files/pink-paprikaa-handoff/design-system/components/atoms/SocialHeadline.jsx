import React from "react";

const SIZES = {
  hero: { fs: "var(--fs-canvas-hero)", lh: 0.96, ls: "-.035em" },
  h1: { fs: "var(--fs-canvas-h1)", lh: 1.0, ls: "-.03em" },
  h2: { fs: "var(--fs-canvas-h2)", lh: 1.05, ls: "-.025em" },
  body: { fs: "var(--fs-canvas-body)", lh: 1.45, ls: "0" },
  caption: { fs: "var(--fs-canvas-caption)", lh: 1.4, ls: "0" },
  overline: { fs: "var(--fs-canvas-overline)", lh: 1.2, ls: "var(--ls-overline)" },
};

/** Canvas-scale type for marketing artboards. Balanced wrapping, never clipped. */
export function SocialHeadline({ children, size = "h1", on = "brand", align = "start", max = "18ch", style, ...rest }) {
  const s = SIZES[size] || SIZES.h1;
  const dark = on === "brand" || on === "ink";
  const isBody = size === "body" || size === "caption";
  const color = dark ? (isBody ? "rgba(255,255,255,.88)" : "var(--ink-000)") : on === "soft" ? "var(--pink-800)" : "var(--text-heading)";
  return (
    <div
      style={{
        fontFamily: isBody ? "var(--font-body)" : "var(--font-display)",
        fontWeight: isBody ? 500 : size === "overline" ? 700 : 800,
        fontSize: s.fs, lineHeight: s.lh, letterSpacing: s.ls,
        textTransform: size === "overline" ? "uppercase" : "none",
        color: color, textAlign: align, textWrap: "balance", maxWidth: max,
        marginInline: align === "center" ? "auto" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
