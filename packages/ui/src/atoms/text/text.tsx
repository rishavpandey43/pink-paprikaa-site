import type { ElementType, ReactNode } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const text = componentVariants({
  base: "m-0",
  variants: {
    /**
     * The type ramp. Display and headings set in Poppins with negative tracking; running text and
     * UI in DM Sans; `mono` in Space Mono for order codes and receipt lines only.
     */
    variant: {
      display1: "font-display font-extrabold text-display1 leading-display1 tracking-display1",
      display2: "font-display font-extrabold text-display2 leading-display2 tracking-display2",
      h1: "font-display font-bold text-h1 leading-h1 tracking-h1",
      h2: "font-display font-bold text-h2 leading-h2 tracking-h2",
      h3: "font-display font-bold text-h3 leading-h3 tracking-h3",
      subtitle1: "font-display font-bold text-subtitle1 leading-subtitle1 tracking-subtitle1",
      subtitle2: "font-body text-subtitle2 leading-subtitle2",
      body1: "font-body text-body1 leading-body1",
      body2: "font-body text-body2 leading-body2",
      caption: "font-body text-caption leading-caption",
      overline: "font-display font-bold text-overline uppercase leading-overline tracking-overline",
      mono: "font-mono text-mono leading-mono tracking-mono",
    },
    tone: {
      heading: "text-text-heading",
      body: "text-text-body",
      muted: "text-text-muted",
      subtle: "text-text-subtle",
      brand: "text-text-brand",
      inverse: "text-text-on-inverse",
      onBrand: "text-text-on-brand",
      danger: "text-status-danger",
    },
    /** `inherit` is the default — the block takes whatever alignment it sits in. */
    align: { inherit: "", left: "text-left", center: "text-center", right: "text-right" },
    /**
     * Swaps the fixed size for its `clamp()` twin. Always set this in a responsive layout; leave it
     * off in type specimens and on fixed-size marketing canvases.
     */
    isFluid: { true: "", false: "" },
    /** Line length caps. Long-form prose is unreadable at full container width. */
    measure: {
      none: "",
      prose: "max-w-(--measure-prose)",
      narrow: "max-w-(--measure-narrow)",
    },
    /** Headings balance across lines; running text avoids orphans. */
    isBalanced: { true: "text-balance", false: "text-pretty" },
  },
  compoundVariants: [
    // Only seven steps have a fluid twin — the small end of the ramp is already a comfortable size
    // at every width, and scaling it down would break the 44px hit-target floor.
    { isFluid: true, variant: "display1", class: "text-display1-fluid" },
    { isFluid: true, variant: "display2", class: "text-display2-fluid" },
    { isFluid: true, variant: "h1", class: "text-h1-fluid" },
    { isFluid: true, variant: "h2", class: "text-h2-fluid" },
    { isFluid: true, variant: "h3", class: "text-h3-fluid" },
    { isFluid: true, variant: "subtitle1", class: "text-subtitle1-fluid" },
    { isFluid: true, variant: "body1", class: "text-body1-fluid" },
  ],
  // Every axis carries a default so `<Text>…</Text>` renders correctly bare. `tone` and
  // `isBalanced` are always resolved per ramp step below before the class call, so their entries
  // here only mirror what the default `body1` step would pick; `align` and `measure` default to
  // their no-class values, which is exactly what a bare `Text` has always rendered.
  defaultVariants: {
    variant: "body1",
    tone: "body",
    align: "inherit",
    isFluid: false,
    measure: "none",
    isBalanced: false,
  },
});

/** Which element each step renders as when the caller does not say. */
const DEFAULT_ELEMENT = {
  display1: "p",
  display2: "p",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  subtitle1: "p",
  subtitle2: "p",
  body1: "p",
  body2: "p",
  caption: "span",
  overline: "span",
  mono: "span",
} as const;

/** Which tone each step takes when the caller does not say. */
const DEFAULT_TONE = {
  display1: "heading",
  display2: "heading",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  subtitle1: "heading",
  subtitle2: "body",
  body1: "body",
  body2: "body",
  caption: "muted",
  overline: "muted",
  mono: "body",
} as const;

export interface TextProps extends VariantProps<typeof text> {
  children?: ReactNode | undefined;
  /**
   * Override the rendered element. The ramp step chooses a sensible default (`h1` renders `<h1>`),
   * so reach for this when the visual level and the document outline need to differ — a section
   * that looks like an `h2` but is the page's `<h1>`, for instance.
   */
  as?: ElementType | undefined;
  /**
   * Truncate to N lines. Capped at six because the classes are static: Tailwind scans source text,
   * so a computed `line-clamp-${n}` would never be generated.
   */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  className?: string | undefined;
}

const LINE_CLAMP = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
} as const;

export function Text({
  children,
  as,
  variant = "body1",
  tone,
  align,
  isFluid,
  measure,
  isBalanced,
  lineClamp,
  className,
}: TextProps) {
  const Component = as ?? DEFAULT_ELEMENT[variant];
  return (
    <Component
      className={text({
        variant,
        tone: tone ?? DEFAULT_TONE[variant],
        align,
        isFluid,
        measure,
        isBalanced: isBalanced ?? (variant.startsWith("display") || variant.startsWith("h")),
        className: [lineClamp === undefined ? undefined : LINE_CLAMP[lineClamp], className],
      })}
    >
      {children}
    </Component>
  );
}
