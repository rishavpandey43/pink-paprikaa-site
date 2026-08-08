import type { ComponentPropsWithoutRef, ElementType } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const container = componentVariants({
  // The horizontal page frame and nothing else: a max width, a fluid gutter, centred. It carries
  // no colour, no border and no type — a layout that paints is a layout two components are
  // fighting over.
  base: "mx-auto w-full",
  variants: {
    size: {
      default: "max-w-(--layout-container-max)",
      wide: "max-w-(--layout-container-wide)",
      prose: "max-w-(--measure-prose)",
      full: "max-w-full",
    },
    /** Drops the gutters so a child can run edge to edge (a full-bleed image band). */
    isFullBleed: { true: "px-0", false: "px-(--layout-gutter-fluid)" },
  },
  defaultVariants: { size: "default", isFullBleed: false },
});

export interface ContainerProps
  extends ComponentPropsWithoutRef<"div">, VariantProps<typeof container> {
  /**
   * Override the rendered element when the band needs real semantics — `as="main"` for the page's
   * primary content, `as="ul"` for a list that also needs the page gutter.
   */
  as?: ElementType | undefined;
}

export function Container({
  as: Component = "div",
  children,
  className,
  isFullBleed,
  size,
  ...props
}: ContainerProps) {
  return (
    <Component className={container({ size, isFullBleed, className })} {...props}>
      {children}
    </Component>
  );
}
