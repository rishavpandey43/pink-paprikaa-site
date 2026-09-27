import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";

export type TextVariant =
  | "display-1"
  | "display-2"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body-lg"
  | "body"
  | "body-sm"
  | "caption"
  | "overline"
  | "mono";

export type TextTone =
  "heading" | "body" | "muted" | "subtle" | "brand" | "on-brand" | "inverse" | "danger";

type TextElement =
  | "p"
  | "span"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "label"
  | "strong"
  | "em"
  | "small"
  | "li"
  | "dt"
  | "dd"
  | "figcaption"
  | "blockquote"
  | "time";

export interface TextProps extends ComponentProps<"p"> {
  /** The type ramp step. */
  variant?: TextVariant | undefined;
  /** Semantic colour; follows the surface. Default: `heading` for display and h steps, `body` otherwise. */
  tone?: TextTone | undefined;
  /** The rendered element. The ramp step never changes with it. */
  as?: TextElement | undefined;
  weight?: "regular" | "medium" | "semibold" | "bold" | "black" | undefined;
  align?: "start" | "center" | "end" | undefined;
  /** Use the step's clamp() size (display-1/2, h1–h4, body) — always, in responsive layouts. */
  isFluid?: boolean | undefined;
  /** Truncate to N lines. */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  /** Line-length cap: prose 64ch, narrow 44ch. */
  measure?: "prose" | "narrow" | undefined;
  /** `text-wrap: balance` for body copy. Display and heading steps balance by default; `false` sets them `pretty`. */
  isBalanced?: boolean | undefined;
}

/** The element each step renders when `as` is not given — the design system's defaults. */
const DEFAULT_ELEMENT: Readonly<Record<TextVariant, TextElement>> = {
  "display-1": "span",
  "display-2": "span",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  "body-lg": "p",
  body: "p",
  "body-sm": "p",
  caption: "span",
  overline: "span",
  mono: "span",
};

/*
 * Each step carries its face, its ramp class (size, line height, tracking and weight in one) and
 * its default tone. `tone` is declared after `variant`, so a given tone replaces the default in
 * the merge; `componentVariants` keeps `text-h1` (a size) and `text-text-muted` (a colour) apart.
 */
const text = componentVariants({
  base: "m-0",
  variants: {
    variant: {
      "display-1": "font-display text-display-1 text-balance text-text-heading",
      "display-2": "font-display text-display-2 text-balance text-text-heading",
      h1: "font-display text-h1 text-balance text-text-heading",
      h2: "font-display text-h2 text-balance text-text-heading",
      h3: "font-display text-h3 text-balance text-text-heading",
      h4: "font-display text-h4 text-balance text-text-heading",
      "body-lg": "font-body text-body-lg text-pretty text-text-body",
      body: "font-body text-body text-pretty text-text-body",
      "body-sm": "font-body text-body-sm text-pretty text-text-body",
      caption: "font-body text-caption text-pretty text-text-body",
      overline: "font-display text-overline text-balance text-text-body uppercase",
      mono: "font-mono text-mono text-pretty text-text-body",
    },
    tone: {
      heading: "text-text-heading",
      body: "text-text-body",
      muted: "text-text-muted",
      subtle: "text-text-subtle",
      brand: "text-text-brand",
      "on-brand": "text-text-on-brand",
      inverse: "text-text-on-inverse",
      danger: "text-text-danger",
    },
    weight: {
      regular: "font-regular",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      black: "font-black",
    },
    align: { start: "text-start", center: "text-center", end: "text-end" },
    isFluid: { true: "" },
    lineClamp: {
      1: "line-clamp-1",
      2: "line-clamp-2",
      3: "line-clamp-3",
      4: "line-clamp-4",
      5: "line-clamp-5",
      6: "line-clamp-6",
    },
    measure: { prose: "max-w-text-measure-prose", narrow: "max-w-text-measure-narrow" },
    isBalanced: { true: "text-balance" },
  },
  compoundVariants: [
    { variant: "display-1", isFluid: true, class: "text-display-1-fluid" },
    { variant: "display-2", isFluid: true, class: "text-display-2-fluid" },
    { variant: "h1", isFluid: true, class: "text-h1-fluid" },
    { variant: "h2", isFluid: true, class: "text-h2-fluid" },
    { variant: "h3", isFluid: true, class: "text-h3-fluid" },
    { variant: "h4", isFluid: true, class: "text-h4-fluid" },
    { variant: "body", isFluid: true, class: "text-body-fluid" },
  ],
  defaultVariants: { variant: "body" },
});

/** Every piece of text in the system. Locks the type ramp, so nothing is ad hoc. */
export function Text({
  variant = "body",
  tone,
  as,
  weight,
  align,
  isFluid,
  lineClamp,
  measure,
  isBalanced,
  className,
  ...props
}: TextProps) {
  // Every TextElement takes the paragraph's props (the contract types them as `<p>`'s). TypeScript
  // checks a union tag against each element's own `ref` type, so the tag is typed as the `<p>`.
  const Component = (as ?? DEFAULT_ELEMENT[variant]) as "p";
  return (
    <Component
      className={text({
        variant,
        tone,
        weight,
        align,
        isFluid,
        lineClamp,
        measure,
        isBalanced,
        // `isBalanced={false}` opts a display or heading step out of balance. tailwind-variants
        // reads an unset boolean as `false`, so the opt-out cannot be a variant; it merges after
        // the step's `text-balance` and replaces it.
        className: [isBalanced === false ? "text-pretty" : undefined, className],
      })}
      {...props}
    />
  );
}
