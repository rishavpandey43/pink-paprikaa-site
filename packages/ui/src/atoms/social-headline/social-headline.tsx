import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";

export interface SocialHeadlineProps extends ComponentProps<"h2"> {
  /** Canvas px: hero 132 · h1 96 · h2 72 · body 34 · caption 26 · overline 24. */
  size?: "hero" | "h1" | "h2" | "body" | "caption" | "overline" | undefined;
  align?: "start" | "center" | "end" | undefined;
  /** Line-length cap: tight 12ch · default 18ch (2–3 balanced lines) · wide 30ch (body copy). */
  measure?: "tight" | "default" | "wide" | undefined;
  /** Element. Default: `h2` for hero, h1 and h2; `p` for body, caption and overline. */
  as?: "h1" | "h2" | "h3" | "p" | "span" | undefined;
}

type Size = NonNullable<SocialHeadlineProps["size"]>;

const DEFAULT_ELEMENT: Readonly<Record<Size, "h2" | "p">> = {
  hero: "h2",
  h1: "h2",
  h2: "h2",
  body: "p",
  caption: "p",
  overline: "p",
};

const socialHeadline = componentVariants({
  base: "m-0 text-balance text-text-heading",
  variants: {
    size: {
      hero: "font-display text-canvas-hero",
      h1: "font-display text-canvas-h1",
      h2: "font-display text-canvas-h2",
      body: "font-body text-canvas-body text-text-body",
      caption: "font-body text-canvas-caption text-text-body",
      overline: "font-display text-canvas-overline uppercase",
    },
    align: { start: "text-start", center: "mx-auto text-center", end: "text-end" },
    measure: {
      tight: "max-w-social-headline-tight",
      default: "max-w-social-headline-default",
      wide: "max-w-social-headline-wide",
    },
  },
  defaultVariants: { size: "h1", align: "start", measure: "default" },
});

/** Canvas-scale type for marketing artboards. Balanced wrapping, never clipped. */
export function SocialHeadline({
  size = "h1",
  align,
  measure,
  as,
  className,
  ...props
}: SocialHeadlineProps) {
  // Every allowed element takes the heading's props (the contract types them as `<h2>`'s).
  // TypeScript checks a union tag against each element's own `ref` type, so the tag is typed as
  // the `<h2>`.
  const Component = (as ?? DEFAULT_ELEMENT[size]) as "h2";
  return <Component className={socialHeadline({ size, align, measure, className })} {...props} />;
}
