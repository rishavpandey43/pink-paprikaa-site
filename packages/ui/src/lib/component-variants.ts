import { createTV, type TWMergeConfig } from "tailwind-variants";

/**
 * Custom theme scales emitted by `@pink-paprikaa-web/design-tokens`.
 *
 * `tailwind-variants` resolves conflicting classes through `tailwind-merge`, which classifies a
 * utility by inspecting the part after the prefix against its known scales. Our token names are
 * not t-shirt sizes, so without this config `tailwind-merge` guesses wrong in ways that silently
 * delete classes — the worst failure mode there is:
 *
 *   `text-h1` (a font size) is not a recognised size, so it falls through to the *text colour*
 *   group. A component declaring `base: "text-h1"` and `tone: { muted: "text-text-muted" }` then
 *   has the two merged as one colour decision, and `text-h1` disappears from the output.
 *
 * Every list below mirrors a token namespace in `packages/design-tokens/tokens/*.json`.
 * `component-variants.spec.ts` asserts each list against the generated `dist/tokens.json`, so a
 * token added there and forgotten here fails the test rather than corrupting class output.
 */
const FONT_SIZES = [
  "display1",
  "display2",
  "h1",
  "h2",
  "h3",
  "subtitle1",
  "subtitle2",
  "body1",
  "body2",
  "caption",
  "overline",
  "mono",
  "display1-fluid",
  "display2-fluid",
  "h1-fluid",
  "h2-fluid",
  "h3-fluid",
  "subtitle1-fluid",
  "body1-fluid",
  "canvas-hero",
  "canvas-h1",
  "canvas-h2",
  "canvas-body",
  "canvas-caption",
  "canvas-overline",
];

const RADII = ["1", "2", "3", "4", "5", "6"];

const SHADOWS = [
  "elevation1",
  "elevation2",
  "elevation3",
  "elevation4",
  "brand",
  "inset",
  "focus-ring",
  "focus-ring-inverse",
];

const EASINGS = ["out", "in-out", "entrance", "pop"];

const TRACKINGS = ["display1", "display2", "h1", "h2", "h3", "subtitle1", "overline", "mono"];

const LEADINGS = [
  "display1",
  "display2",
  "h1",
  "h2",
  "h3",
  "subtitle1",
  "subtitle2",
  "body1",
  "body2",
  "caption",
  "overline",
  "mono",
];

const FONT_FAMILIES = ["display", "body", "devanagari", "mono"];

/** Half-steps only: whole numbers already resolve through `tailwind-merge`'s number validator. */
const SPACINGS = ["0-5", "1-5"];

export const twMergeConfig: TWMergeConfig = {
  extend: {
    theme: {
      text: FONT_SIZES,
      radius: RADII,
      shadow: SHADOWS,
      ease: EASINGS,
      tracking: TRACKINGS,
      leading: LEADINGS,
      font: FONT_FAMILIES,
      spacing: SPACINGS,
    },
  },
};

/**
 * The design system's variant builder — every component declares its classes through this.
 *
 * It is `tailwind-variants`' `tv` (the shape the engineering handbook makes canonical, 03 §1)
 * pre-configured with the scales above. Never import the bare `tv` from `tailwind-variants`
 * directly: that instance merges against stock Tailwind scales only and drops our token classes.
 *
 * ```tsx
 * const button = componentVariants({
 *   base: "inline-flex items-center justify-center rounded-6 font-display",
 *   variants: {
 *     variant: { primary: "bg-brand-primary text-text-on-brand shadow-brand" },
 *     size: { md: "h-(--button-h-md) px-(--button-px-md) text-body2" },
 *   },
 *   defaultVariants: { variant: "primary", size: "md" },
 * });
 * ```
 */
export const componentVariants = createTV({ twMergeConfig });

/** Props a `componentVariants` definition contributes to a component's public props. */
export type { VariantProps } from "tailwind-variants";
