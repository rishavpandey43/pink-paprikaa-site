import { createTV, type TWMergeConfig } from "tailwind-variants";

/**
 * The design system's variant builder. Every component declares its classes through this — never
 * through the bare `tv` from tailwind-variants.
 *
 * tailwind-variants resolves conflicts with tailwind-merge, which classifies a class by its value.
 * The token names are not Tailwind's stock scales, so without these lists tailwind-merge guesses
 * wrong and silently deletes classes: `text-h1` would be read as a text *colour* and dropped next
 * to `text-text-muted`, `border-default` as a border colour next to `border-border-subtle`. The
 * stylesheet's own utilities (`z-header`, `duration-fast`, `scrim-*`, `autogrid*`, `pattern-*`)
 * are registered too, so a later one replaces an earlier one. `component-variants.spec.ts`
 * asserts every token list equals the token build (and the stylesheet's animations), so a new
 * token cannot be forgotten here.
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
  "link-sm",
  "link-md",
  "link-lg",
  "button-sm",
  "button-md",
  "button-lg",
  "icon-button-count",
  "tag",
  "image-slot-label",
  "status-dot-label",
  "avatar-xs",
  "avatar-sm",
  "avatar-md",
  "avatar-lg",
  "avatar-xl",
  "field-suffix",
  "control",
  "control-description",
  "progress-label",
  "rating-value",
  "rating-count",
];
const FONT = ["display", "body", "devanagari", "mono"];
const FONT_WEIGHT = ["regular", "medium", "semibold", "bold", "black"];
const RADIUS = ["xs", "sm", "md", "lg", "xl", "pill", "diamond"];
const SHADOW = [
  "1",
  "2",
  "3",
  "4",
  "brand",
  "inset",
  "focus-ring",
  "focus-ring-inverse",
  "button-primary",
  "avatar-ring",
  "field-ring-danger",
  "field-ring-success",
  "field-ring-warning",
];
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
  "icon-xs",
  "icon-sm",
  "icon-md",
  "icon-lg",
  "icon-xl",
  "logo-lockup",
  "logo-wordmark",
  "logo-symbol",
  "text-measure-prose",
  "text-measure-narrow",
  "social-headline-tight",
  "social-headline-default",
  "social-headline-wide",
  "button-h-sm",
  "button-h-md",
  "button-h-lg",
  "icon-button-sm",
  "icon-button-md",
  "icon-button-lg",
  "icon-button-count",
  "tag-h",
  "divider-mark",
  "badge-icon",
  "status-dot-sm",
  "status-dot-md",
  "avatar-xs",
  "avatar-sm",
  "avatar-md",
  "avatar-lg",
  "avatar-xl",
  "field-sm",
  "field-md",
  "field-lg",
  "field-spinner",
  "choice-box",
  "switch-width",
  "switch-height",
  "switch-knob",
  "spinner-sm",
  "spinner-md",
  "spinner-lg",
  "progress-sm",
  "progress-md",
  "brand-diamond-12",
  "brand-diamond-14",
  "brand-diamond-16",
  "brand-diamond-20",
  "brand-diamond-24",
  "brand-diamond-box-12",
  "brand-diamond-box-14",
  "brand-diamond-box-16",
  "brand-diamond-box-20",
  "brand-diamond-box-24",
  "diet-mark-sm",
  "diet-mark-md",
  "diet-mark-lg",
];
const BORDER_WIDTH = ["default", "strong"];
const Z = ["raised", "sticky", "header", "dock", "overlay", "toast"];
const DURATION = ["instant", "fast", "base", "slow", "page"];
/** PatternField's named utilities (`styles.css`): `pattern-tile-*` and `pattern-opacity-*`. */
const PATTERN_TILE = ["56", "64", "72", "80", "86", "96"];
const PATTERN_OPACITY = ["default", "light", "faint"];
/** tailwind-merge keeps a width group per side (`border-w-t` for `border-t-*`, …); all read these. */
const BORDER_SIDES = ["x", "y", "s", "e", "bs", "be", "t", "r", "b", "l"];
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
    classGroups: {
      "border-w": [{ border: BORDER_WIDTH }],
      ...Object.fromEntries(
        BORDER_SIDES.map((side) => [`border-w-${side}`, [{ [`border-${side}`]: BORDER_WIDTH }]])
      ),
      z: [{ z: Z }],
      duration: [{ duration: DURATION }],
      scrim: ["scrim-bottom", "scrim-top"],
      autogrid: ["autogrid", "autogrid-wide"],
      "pattern-tile": [{ "pattern-tile": PATTERN_TILE }],
      "pattern-opacity": [{ "pattern-opacity": PATTERN_OPACITY }],
    },
  },
};

export const componentVariants = createTV({ twMergeConfig });

export type { VariantProps } from "tailwind-variants";
