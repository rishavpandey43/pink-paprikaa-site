import type { ElementType, ReactNode } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const socialHeadline = componentVariants({
  // Canvas type always balances its lines — a 132px headline that orphans one word is unusable.
  base: "m-0 text-balance",
  variants: {
    /**
     * The canvas ramp, in canvas pixels: hero 132 · h1 96 · h2 72 · body 34 · caption 26 ·
     * overline 24. Never use the screen `text-h1` steps on a 1080px artboard — they render as
     * fine print.
     *
     * Line height and tracking come from a token wherever one matches the canvas value exactly;
     * the three that have no twin are written as literals because the ramp is canvas-only and
     * `packages/design-tokens` emits no `--leading-canvas-*` scale.
     */
    size: {
      hero: "font-display font-extrabold text-canvas-hero leading-[0.96] tracking-[-0.035em]",
      h1: "font-display font-extrabold text-canvas-h1 leading-[1] tracking-display1",
      h2: "font-display font-extrabold text-canvas-h2 leading-display2 tracking-display2",
      body: "font-body font-medium text-canvas-body leading-[1.45]",
      caption: "font-body font-medium text-canvas-caption leading-[1.4]",
      overline:
        "font-display font-bold text-canvas-overline uppercase leading-overline tracking-overline",
    },
    /** The ground the canvas is flooded with — it decides the ink, nothing else. */
    on: {
      brand: "text-text-on-brand",
      ink: "text-text-on-inverse",
      soft: "text-pink-800",
      light: "text-text-heading",
    },
    align: { start: "text-left", center: "mx-auto text-center", end: "ms-auto text-right" },
    /** Line-length cap. Headlines want 2–3 balanced lines, running text wants more room. */
    measure: {
      narrow: "max-w-[14ch]",
      default: "max-w-[18ch]",
      wide: "max-w-[34ch]",
      none: "max-w-none",
    },
  },
  compoundVariants: [
    // Running text on a dark flood steps back to 88% white so it reads as body, not a second
    // headline. Headings stay at full white.
    { on: "brand", size: "body", class: "text-text-on-brand/88" },
    { on: "brand", size: "caption", class: "text-text-on-brand/88" },
    { on: "ink", size: "body", class: "text-text-on-inverse/88" },
    { on: "ink", size: "caption", class: "text-text-on-inverse/88" },
    // 18ch is a headline measure; the smaller steps need a running-text one, and an overline is a
    // single short line that must never wrap.
    { measure: "default", size: "body", class: "max-w-[34ch]" },
    { measure: "default", size: "caption", class: "max-w-[34ch]" },
    { measure: "default", size: "overline", class: "max-w-none" },
  ],
  defaultVariants: { size: "h1", on: "brand", align: "start", measure: "default" },
});

export interface SocialHeadlineProps extends VariantProps<typeof socialHeadline> {
  children?: ReactNode | undefined;
  className?: string | undefined;
  /**
   * Override the rendered element. Canvases are exported as images, so the default is a plain
   * paragraph — reach for this only when the artboard is also served as markup.
   */
  as?: ElementType | undefined;
}

export function SocialHeadline({
  align,
  as,
  children,
  className,
  measure,
  on,
  size,
}: SocialHeadlineProps) {
  const Component = as ?? "p";
  return (
    <Component className={socialHeadline({ align, measure, on, size, class: className })}>
      {children}
    </Component>
  );
}
