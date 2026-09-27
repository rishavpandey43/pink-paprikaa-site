import React from "react";

const V = {
  "display-1": { f: "display", w: 800, fs: "var(--fs-display-1)", lh: "var(--lh-display-1)", ls: "var(--ls-display-1)" },
  "display-2": { f: "display", w: 800, fs: "var(--fs-display-2)", lh: "var(--lh-display-2)", ls: "var(--ls-display-2)" },
  h1: { f: "display", w: 700, fs: "var(--fs-h1)", lh: "var(--lh-h1)", ls: "var(--ls-h1)", tag: "h1" },
  h2: { f: "display", w: 700, fs: "var(--fs-h2)", lh: "var(--lh-h2)", ls: "var(--ls-h2)", tag: "h2" },
  h3: { f: "display", w: 700, fs: "var(--fs-h3)", lh: "var(--lh-h3)", ls: "var(--ls-h3)", tag: "h3" },
  h4: { f: "display", w: 700, fs: "var(--fs-h4)", lh: "var(--lh-h4)", ls: "var(--ls-h4)", tag: "h4" },
  "body-lg": { f: "body", w: 400, fs: "var(--fs-body-lg)", lh: "var(--lh-body-lg)", tag: "p" },
  body: { f: "body", w: 400, fs: "var(--fs-body)", lh: "var(--lh-body)", tag: "p" },
  "body-sm": { f: "body", w: 400, fs: "var(--fs-body-sm)", lh: "var(--lh-body-sm)", tag: "p" },
  caption: { f: "body", w: 400, fs: "var(--fs-caption)", lh: "var(--lh-caption)" },
  overline: { f: "display", w: 700, fs: "var(--fs-overline)", lh: "var(--lh-overline)", ls: "var(--ls-overline)", caps: true },
  mono: { f: "mono", w: 400, fs: "var(--fs-mono)", lh: "var(--lh-mono)", ls: "var(--ls-mono)" },
};
const TONE = {
  heading: "var(--text-heading)", body: "var(--text-body)", muted: "var(--text-muted)",
  subtle: "var(--text-subtle)", brand: "var(--text-brand)", inverse: "var(--text-on-inverse)",
  "on-brand": "var(--text-on-brand)", danger: "var(--status-danger)",
};

/** Every piece of text in the system. Locks the type ramp so nothing is ad-hoc. */
export function Text({ children, variant = "body", tone, as, weight, align, fluid, clamp, measure, style, ...rest }) {
  const v = V[variant] || V.body;
  const Tag = as || v.tag || "span";
  const fluidMap = { "display-1": "--fs-display-1-fluid", "display-2": "--fs-display-2-fluid", h1: "--fs-h1-fluid", h2: "--fs-h2-fluid", h3: "--fs-h3-fluid", h4: "--fs-h4-fluid", body: "--fs-body-fluid" };
  const fs = fluid && fluidMap[variant] ? `var(${fluidMap[variant]})` : v.fs;
  const clampStyle = clamp ? { display: "-webkit-box", WebkitLineClamp: clamp, WebkitBoxOrient: "vertical", overflow: "hidden" } : null;
  return (
    <Tag
      style={{
        margin: 0,
        fontFamily: v.f === "display" ? "var(--font-display)" : v.f === "mono" ? "var(--font-mono)" : "var(--font-body)",
        fontWeight: weight != null ? weight : v.w,
        fontSize: fs, lineHeight: v.lh, letterSpacing: v.ls,
        textTransform: v.caps ? "uppercase" : undefined,
        color: TONE[tone] || (tone ? tone : v.f === "display" && variant !== "overline" ? "var(--text-heading)" : "var(--text-body)"),
        textAlign: align,
        textWrap: v.f === "display" ? "balance" : "pretty",
        maxWidth: measure === "prose" ? "var(--measure-prose)" : measure === "narrow" ? "var(--measure-narrow)" : measure,
        ...clampStyle, ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
