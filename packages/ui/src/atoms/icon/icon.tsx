import type { ComponentProps, ComponentType, SVGProps } from "react";

import type { SxProp } from "../../lib/common-props";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

/**
 * Anything that renders an icon glyph: a lucide-react icon or one of the brand glyphs. The SVG
 * attributes are picked from React's own types (not spelled out) so `aria-hidden` keeps its
 * exact type and a hyphenated key never has to be declared here.
 *
 * `size` is the one optional without `| undefined` (R13's exception): this type lists what `Icon`
 * passes a glyph, and a lucide-react icon declares `size?: string | number`, so with
 * `exactOptionalPropertyTypes` a widened `size` would stop every lucide icon being assignable.
 */
export type IconComponent = ComponentType<
  Pick<SVGProps<SVGSVGElement>, "strokeWidth" | "aria-hidden" | "focusable"> & {
    size?: number | string;
  }
>;

const icon = componentVariants({
  base: "inline-flex shrink-0 items-center justify-center leading-none",
  variants: {
    size: {
      xs: "size-icon-xs",
      sm: "size-icon-sm",
      md: "size-icon-md",
      lg: "size-icon-lg",
      xl: "size-icon-xl",
    },
  },
  defaultVariants: { size: "md" },
});

type IconSize = NonNullable<VariantProps<typeof icon>["size"]>;

/** Design system rule: stroke 2 at 16px and below, 1.75 above. */
const STROKE_WIDTH: Readonly<Record<IconSize, number>> = {
  xs: 2,
  sm: 2,
  md: 1.75,
  lg: 1.75,
  xl: 1.75,
};

export interface IconProps
  extends Omit<ComponentProps<"span">, "children">, VariantProps<typeof icon>, SxProp {
  icon: IconComponent;
  /** Accessible name. Omit for a decorative icon (then it is hidden from assistive tech). */
  label?: string | undefined;
}

/** A Lucide-style glyph in the system's sizes, painted with `currentColor`. */
export function Icon({ icon: Glyph, size = "md", label, sx, className, ...props }: IconProps) {
  return (
    <span
      className={icon({ size, className: withSx(sx, className) })}
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
      {...props}
    >
      <Glyph size="100%" strokeWidth={STROKE_WIDTH[size]} aria-hidden focusable="false" />
    </span>
  );
}
