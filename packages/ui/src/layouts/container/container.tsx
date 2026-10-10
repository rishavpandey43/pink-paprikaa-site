import type { BaseProps } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

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

export interface ContainerProps extends BaseProps<"div"> {
  /** content 1200 · wide 1440 · narrow 960 · article 760 · prose 64ch · full (no cap). */
  size?: ContainerSize | undefined;
  /** Drop the gutters, for a child that must run edge to edge. */
  isBleed?: boolean | undefined;
  as?: "div" | "main" | "section" | "article" | "header" | "footer" | "nav" | undefined;
}

/**
 * The only correct way to constrain page width: a centred width cap with the fluid gutter
 * clamp(20px, 4vw, 40px) — the design system's layout rhythm, so 360px screens keep 20px each side.
 */
export function Container({
  as = "div",
  size = "content",
  isBleed = false,
  sx,
  className,
  ...props
}: ContainerProps) {
  // A narrow cast (the Stack trap): every member of the `as` union takes the same props, and the
  // spread props stay type-checked, which `ElementType` would not do.
  const Element = as as "div";
  return (
    <Element
      className={container({ size, isBleed, className: withSx(sx, className) })}
      {...props}
    />
  );
}
