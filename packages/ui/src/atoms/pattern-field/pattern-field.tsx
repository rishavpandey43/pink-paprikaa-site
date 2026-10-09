import { Slot } from "radix-ui";
import type { ElementType } from "react";

import { type BaseProps, SURFACE_DATA, type SurfaceProp } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

export interface PatternFieldProps extends BaseProps<"div"> {
  /** The field colour; also its `data-surface`, so everything inside follows it. */
  surface?: Extract<SurfaceProp, "brand" | "ink" | "soft" | "page"> | undefined;
  /** Tile size in px — 96 on a 1080 canvas, 56–72 on screen. */
  tile?: 56 | 64 | 72 | 80 | 86 | 96 | undefined;
  /** default = 8% on brand/ink, 9% on soft/light · faint = 4% (the handoff's ink sections). */
  density?: "default" | "faint" | undefined;
  radius?: "none" | "md" | "lg" | "xl" | undefined;
  /** Pattern an existing element (e.g. a `<section>`) instead of rendering a `<div>`. */
  asChild?: boolean | undefined;
}

/** One white symbol tile (R19), used as a mask: the colour painted through it comes from the surface. */
const PATTERN_MASK = { maskImage: "var(--pp-symbol-mask)" } as const;

const patternField = componentVariants({
  slots: {
    // `isolate`: the texture's stacking context stays inside the panel, so an overlapping card
    // cannot slide underneath it.
    root: "relative isolate overflow-hidden",
    pattern: "pointer-events-none absolute inset-0",
    content: "relative h-full",
  },
  variants: {
    // Each surface carries its field's default opacity; `density="faint"` is declared later, so the
    // merge (`pattern-opacity-*` is a registered class group) replaces it: one opacity per field.
    surface: {
      brand: { root: "bg-surface-brand", pattern: "bg-ink-000 pattern-opacity-default" },
      ink: { root: "bg-surface-inverse", pattern: "bg-ink-000 pattern-opacity-default" },
      soft: { root: "bg-surface-brand-soft", pattern: "bg-pink-500 pattern-opacity-light" },
      page: { root: "bg-surface-page", pattern: "bg-pink-500 pattern-opacity-light" },
    },
    tile: {
      56: { pattern: "pattern-tile-56" },
      64: { pattern: "pattern-tile-64" },
      72: { pattern: "pattern-tile-72" },
      80: { pattern: "pattern-tile-80" },
      86: { pattern: "pattern-tile-86" },
      96: { pattern: "pattern-tile-96" },
    },
    density: { default: {}, faint: { pattern: "pattern-opacity-faint" } },
    radius: {
      none: { root: "rounded-none" },
      md: { root: "rounded-md" },
      lg: { root: "rounded-lg" },
      xl: { root: "rounded-xl" },
    },
  },
  defaultVariants: { surface: "brand", tile: 64, density: "default", radius: "none" },
});

/** The brand's only texture: the diamond symbol tiled at low opacity over a flooded field. */
export function PatternField({
  surface = "brand",
  tile,
  density,
  radius,
  asChild = false,
  sx,
  className,
  children,
  ...props
}: PatternFieldProps) {
  const slots = patternField({ surface, tile, density, radius });
  const Component: ElementType = asChild ? Slot.Root : "div";
  return (
    <Component
      data-surface={SURFACE_DATA[surface]}
      className={slots.root({ className: withSx(sx, className) })}
      {...props}
    >
      <span aria-hidden className={slots.pattern()} style={PATTERN_MASK} />
      <Slot.Slottable child={children}>
        {(content) => <div className={slots.content()}>{content}</div>}
      </Slot.Slottable>
    </Component>
  );
}
