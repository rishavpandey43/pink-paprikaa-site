import { createTV, type TWMergeConfig } from "tailwind-variants";

/**
 * The design system's variant builder. Every component declares its classes through this — never
 * through the bare `tv` from tailwind-variants.
 *
 * tailwind-variants resolves conflicts with tailwind-merge, which classifies a class by its value.
 * The token names are not Tailwind's stock scales, so without these lists tailwind-merge guesses
 * wrong and silently deletes classes: `text-h1` would be read as a text *colour* and dropped next
 * to `text-text-muted`. `component-variants.spec.ts` asserts every list equals the token build
 * (and the stylesheet's animations), so a new token cannot be forgotten here.
 */
const TEXT = [
  "display-1",
  "display-2",
  "h1",
  "h2",
  "h3",
  "h4",
  "body-lg",
  "body",
  "body-sm",
  "caption",
  "overline",
  "mono",
  "display-1-fluid",
  "display-2-fluid",
  "h1-fluid",
  "h2-fluid",
  "h3-fluid",
  "h4-fluid",
  "body-fluid",
  "canvas-hero",
  "canvas-h1",
  "canvas-h2",
  "canvas-body",
  "canvas-caption",
  "canvas-overline",
];
const FONT = ["display", "body", "devanagari", "mono"];
const FONT_WEIGHT = ["regular", "medium", "semibold", "bold", "black"];
const RADIUS = ["xs", "sm", "md", "lg", "xl", "pill"];
const SHADOW = ["1", "2", "3", "4", "brand", "inset", "focus-ring", "focus-ring-inverse"];
const BLUR = ["glass"];
const EASE = ["out", "in-out", "entrance", "pop"];
const CONTAINER = ["content", "wide", "narrow", "article", "prose", "prose-narrow"];
const ASPECT = ["square", "4-3", "3-4", "4-5", "16-9", "16-10", "wide"];
const BREAKPOINT = ["sm", "md", "lg", "xl", "2xl"];
const SPACING = [
  "gutter",
  "gutter-mobile",
  "gutter-desktop",
  "section",
  "section-mobile",
  "section-desktop",
  "grid-gap",
  "header",
  "header-compact",
  "tabbar",
  "hit",
  "card-min",
  "card-min-wide",
  "dock-clearance",
];
const ANIMATE = [
  "skeleton",
  "mark-pulse",
  "spin-pulse",
  "dot-pulse",
  "rotate",
  "sheet-in",
  "toast-pop",
];

export const twMergeConfig: TWMergeConfig = {
  extend: {
    theme: {
      text: TEXT,
      font: FONT,
      "font-weight": FONT_WEIGHT,
      radius: RADIUS,
      shadow: SHADOW,
      blur: BLUR,
      ease: EASE,
      container: CONTAINER,
      aspect: ASPECT,
      breakpoint: BREAKPOINT,
      spacing: SPACING,
      animate: ANIMATE,
    },
  },
};

export const componentVariants = createTV({ twMergeConfig });

export type { VariantProps } from "tailwind-variants";
