import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { type Sx, withSx } from "../../lib/sx";

export type TypographyVariant =
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
  | "mono"
  | "link-sm"
  | "link-md"
  | "link-lg";

export type TypographyColor =
  | "heading"
  | "body"
  | "muted"
  | "subtle"
  | "brand"
  | "on-brand"
  | "inverse"
  | "danger"
  | "success"
  | "link";

export type TypographyElement =
  | "p"
  | "a"
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

/** The look props Typography owns. Link takes these too (minus its own `variant` and `color`). */
export interface TypographyStyleProps {
  /** The type ramp step. `inherit` sets no size, face or colour: the text takes its parent's. */
  variant?: TypographyVariant | "inherit" | undefined;
  /** Semantic colour; follows the surface. Default: `heading` for display and h steps, `body` otherwise. */
  color?: TypographyColor | undefined;
  weight?: "regular" | "medium" | "semibold" | "bold" | "black" | undefined;
  align?: "start" | "center" | "end" | undefined;
  /** One line, cut with an ellipsis (`truncate`). */
  noWrap?: boolean | undefined;
  /** Use the step's clamp() size (display-1/2, h1–h4, body) — always, in responsive layouts. */
  isFluid?: boolean | undefined;
  /** Truncate to N lines. */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  /** Line-length cap: prose 64ch, narrow 44ch. */
  measure?: "prose" | "narrow" | undefined;
  /** `text-wrap: balance` for body copy. Display and heading steps balance by default; `false` sets them `pretty`. */
  isBalanced?: boolean | undefined;
  /** Token-typed style overrides on the root. `className` still beats it. */
  sx?: Sx | undefined;
}

export interface TypographyProps extends Omit<ComponentProps<"p">, "color">, TypographyStyleProps {
  /** The rendered element. The ramp step never changes with it. */
  as?: TypographyElement | undefined;
}

/** The element each step renders when `as` is not given — the design system's defaults. */
const DEFAULT_ELEMENT: Readonly<Record<TypographyVariant | "inherit", TypographyElement>> = {
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
  "link-sm": "span",
  "link-md": "span",
  "link-lg": "span",
  inherit: "span",
};

/*
 * Each step carries its face, its ramp class (size, line height, tracking and weight in one) and
 * its default colour. `color` is declared after `variant`, so a given colour replaces the default
 * in the merge; `componentVariants` keeps `text-h1` (a size) and `text-text-muted` (a colour)
 * apart. The link steps carry no colour: Link paints its own, and a bare link-md is the size only.
 */
export const typography = componentVariants({
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
      "link-sm": "font-body text-link-sm",
      "link-md": "font-body text-link-md",
      "link-lg": "font-body text-link-lg",
      inherit: "",
    },
    color: {
      heading: "text-text-heading",
      body: "text-text-body",
      muted: "text-text-muted",
      subtle: "text-text-subtle",
      brand: "text-text-brand",
      "on-brand": "text-text-on-brand",
      inverse: "text-text-on-inverse",
      danger: "text-text-danger",
      success: "text-text-success",
      link: "text-text-link",
    },
    weight: {
      regular: "font-regular",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      black: "font-black",
    },
    align: { start: "text-start", center: "text-center", end: "text-end" },
    // `text-nowrap` also replaces the step's `text-pretty`/`text-balance`: `text-wrap` is a shorthand
    // of `white-space`, so either would otherwise let the line wrap despite `truncate`.
    noWrap: { true: "truncate text-nowrap" },
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
export function Typography({
  variant = "body",
  color,
  as,
  weight,
  align,
  noWrap,
  isFluid,
  lineClamp,
  measure,
  isBalanced,
  sx,
  className,
  ...props
}: TypographyProps) {
  // Every TypographyElement takes the paragraph's props (the contract types them as `<p>`'s).
  // TypeScript checks a union tag against each element's own `ref` type, so the tag is typed as `<p>`.
  const Component = (as ?? DEFAULT_ELEMENT[variant]) as "p";
  return (
    <Component
      className={typography({
        variant,
        color,
        weight,
        align,
        noWrap,
        isFluid,
        lineClamp,
        measure,
        isBalanced,
        // `isBalanced={false}` opts a display or heading step out of balance. tailwind-variants
        // reads an unset boolean as `false`, so the opt-out cannot be a variant; it merges after
        // the step's `text-balance` and replaces it. sx comes before className, so className wins.
        className: [isBalanced === false ? "text-pretty" : undefined, withSx(sx, className)],
      })}
      {...props}
    />
  );
}
