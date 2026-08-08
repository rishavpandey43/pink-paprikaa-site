import type { ComponentPropsWithoutRef, ElementType } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

/** Gap overrides. Static strings — Tailwind scans source text, so `gap-${space}` never generates. */
const GAP = {
  0: "gap-0",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
} as const;

export type AutoGridSpace = keyof typeof GAP;

/**
 * Fixed column counts, for the rare editorial grid that must not reflow. Every track is
 * `minmax(0,1fr)` so a long label wraps instead of widening its column.
 */
const COLUMNS = {
  1: "grid-cols-[repeat(1,minmax(0,1fr))]",
  2: "grid-cols-[repeat(2,minmax(0,1fr))]",
  3: "grid-cols-[repeat(3,minmax(0,1fr))]",
  4: "grid-cols-[repeat(4,minmax(0,1fr))]",
} as const;

export type AutoGridColumns = keyof typeof COLUMNS;

const autoGrid = componentVariants({
  base: "grid gap-(--layout-gap-grid)",
  variants: {
    /**
     * The width a track has to lose before a column drops. Every track is
     * `minmax(min(<step>,100%),1fr)` — the `min(…,100%)` is load-bearing: a bare `1fr` track keeps
     * a min-content floor, so one long uppercase label overflows the whole row.
     */
    size: {
      narrow: "grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))]",
      card: "grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))]",
      panel: "grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]",
    },
  },
  defaultVariants: { size: "card" },
});

export interface AutoGridProps
  extends ComponentPropsWithoutRef<"div">, VariantProps<typeof autoGrid> {
  /** Override the rendered element — `as="ul"` when the grid is a real list of cards. */
  as?: ElementType | undefined;
  /**
   * Freeze the column count instead of letting tracks collapse. Prefer `size`: a fixed count cannot
   * survive 360px on its own, so pair this with a responsive `className` when you reach for it.
   */
  columns?: AutoGridColumns | undefined;
  /** Gap override. Defaults to the `--layout-gap-grid` token, clamp(16px, 2vw, 24px). */
  space?: AutoGridSpace | undefined;
}

export function AutoGrid({
  as: Component = "div",
  children,
  className,
  columns,
  size,
  space,
  ...props
}: AutoGridProps) {
  return (
    <Component
      className={autoGrid({
        size,
        className: [
          space === undefined ? undefined : GAP[space],
          columns === undefined ? undefined : COLUMNS[columns],
          className,
        ],
      })}
      {...props}
    >
      {children}
    </Component>
  );
}
