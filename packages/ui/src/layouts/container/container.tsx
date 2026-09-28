import type { ComponentProps, ElementType } from "react";

import { componentVariants } from "../../lib/component-variants";

export type ContainerSize = "content" | "wide" | "narrow" | "article" | "prose" | "full";

const container = componentVariants({
  base: "mx-auto w-full px-gutter",
  variants: {
    size: {
      content: "max-w-content",
      wide: "max-w-wide",
      narrow: "max-w-narrow",
      article: "max-w-article",
      prose: "max-w-text-measure-prose",
      full: "max-w-none",
    },
    isBleed: { true: "px-0" },
  },
});

export interface ContainerProps extends ComponentProps<"div"> {
  /** content 1200 · wide 1440 · narrow 960 · article 760 · prose 64ch · full (no cap). */
  size?: ContainerSize | undefined;
  /** Drop the gutters, for a child that must run edge to edge. */
  isBleed?: boolean | undefined;
  as?: "div" | "main" | "section" | "article" | "header" | "footer" | "nav" | undefined;
}

/**
 * The only correct way to constrain page width: a centred width cap with the fluid gutter
 * clamp(16px, 4vw, 40px) — the handoff value (spec C8), so 360px screens keep 16px each side.
 */
export function Container({
  as = "div",
  size = "content",
  isBleed = false,
  className,
  ...props
}: ContainerProps) {
  const Element: ElementType = as;
  return <Element className={container({ size, isBleed, className })} {...props} />;
}
