import type { ComponentProps, ElementType } from "react";

import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";

export interface PatternFieldProps extends ComponentProps<"div"> {
  /** The field colour; also its `data-surface`, so everything inside follows it. */
  tone?: "brand" | "ink" | "soft" | "light" | undefined;
  /** Tile size in px — 96 on a 1080 canvas, 56–72 on screen. */
  tile?: 56 | 64 | 72 | 80 | 86 | 96 | undefined;
  /** default = 8% on brand/ink, 9% on soft/light · faint = 4% (the handoff's ink sections). */
  density?: "default" | "faint" | undefined;
  radius?: "none" | "md" | "lg" | "xl" | undefined;
  /** Pattern an existing element (e.g. a `<section>`) instead of rendering a `<div>`. */
  asChild?: boolean | undefined;
}

/** One white symbol tile (R19), used as a mask: the colour painted through it comes from the tone. */
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
    // Each tone carries its field's default opacity; `density="faint"` is declared later, so the
    // merge (`pattern-opacity-*` is a registered class group) replaces it: one opacity per field.
    tone: {
      brand: { root: "bg-surface-brand", pattern: "bg-ink-000 pattern-opacity-default" },
      ink: { root: "bg-surface-inverse", pattern: "bg-ink-000 pattern-opacity-default" },
      soft: { root: "bg-surface-brand-soft", pattern: "bg-pink-500 pattern-opacity-light" },
      light: { root: "bg-surface-page", pattern: "bg-pink-500 pattern-opacity-light" },
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
  defaultVariants: { tone: "brand", tile: 64, density: "default", radius: "none" },
});

/** The brand's only texture: the diamond symbol tiled at low opacity over a flooded field. */
export function PatternField({
  tone = "brand",
  tile,
  density,
  radius,
  asChild = false,
  className,
  children,
  ...props
}: PatternFieldProps) {
  const slots = patternField({ tone, tile, density, radius });
  const Component: ElementType = asChild ? Slot.Root : "div";
  return (
    <Component data-surface={tone} className={slots.root({ className })} {...props}>
      <span aria-hidden className={slots.pattern()} style={PATTERN_MASK} />
      <Slot.Slottable child={children}>
        {(content) => <div className={slots.content()}>{content}</div>}
      </Slot.Slottable>
    </Component>
  );
}
