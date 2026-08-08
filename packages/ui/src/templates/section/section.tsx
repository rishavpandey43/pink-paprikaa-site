import type { ComponentProps, ComponentPropsWithoutRef, ElementType } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { Container } from "../container/container";

const section = componentVariants({
  // One page band. It owns the vertical rhythm and nothing else — the band's background is a
  // caller decision passed through `className` (`bg-surface-page-alt`, `bg-surface-brand`), which
  // keeps every layout in this package free of colour.
  base: "w-full",
  variants: {
    /** Vertical rhythm. `default` is the token rhythm; the others are the two sanctioned escapes. */
    padding: {
      none: "py-0",
      tight: "py-[clamp(36px,4vw,56px)]",
      default: "py-(--layout-section-y-fluid)",
      loose: "py-[clamp(72px,9vw,128px)]",
    },
  },
  defaultVariants: { padding: "default" },
});

/** The width caps `Container` understands, re-exposed so `Section` cannot drift from it. */
type ContainerSize = NonNullable<ComponentProps<typeof Container>["size"]>;

export interface SectionProps
  extends ComponentPropsWithoutRef<"section">, VariantProps<typeof section> {
  /** Override the rendered element — `as="header"` or `as="footer"` for the page's outer bands. */
  as?: ElementType | undefined;
  /**
   * Skip the inner `Container` because the child handles its own width — a full-bleed carousel
   * that must scroll past the gutter, for instance.
   */
  bare?: boolean | undefined;
  /** Passed straight through to the inner `Container`. Ignored when `bare` is set. */
  size?: ContainerSize | undefined;
}

export function Section({
  as: Component = "section",
  bare = false,
  children,
  className,
  padding,
  size,
  ...props
}: SectionProps) {
  return (
    <Component className={section({ padding, className })} {...props}>
      {bare ? children : <Container size={size}>{children}</Container>}
    </Component>
  );
}
