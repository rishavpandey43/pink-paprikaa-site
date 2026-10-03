import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { GAP_CLASS, type SpaceStep } from "../../lib/space";
import { type Sx, withSx } from "../../lib/sx";

type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";
export type GridSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";
export type GridStart = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
/** A value, or one per breakpoint, mobile first: `{ sm: 6, lg: 4 }` is full width, then 6, then 4. */
export type GridResponsive<T> = T | Partial<Record<Breakpoint, T | undefined>>;

const BREAKPOINTS: readonly Breakpoint[] = ["base", "sm", "md", "lg", "xl"];

/* Every class a complete literal, so Tailwind's scanner sees it — never assembled at runtime. */
const SPAN = {
  base: {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6",
    7: "col-span-7",
    8: "col-span-8",
    9: "col-span-9",
    10: "col-span-10",
    11: "col-span-11",
    12: "col-span-12",
    full: "col-span-full",
  },
  sm: {
    1: "sm:col-span-1",
    2: "sm:col-span-2",
    3: "sm:col-span-3",
    4: "sm:col-span-4",
    5: "sm:col-span-5",
    6: "sm:col-span-6",
    7: "sm:col-span-7",
    8: "sm:col-span-8",
    9: "sm:col-span-9",
    10: "sm:col-span-10",
    11: "sm:col-span-11",
    12: "sm:col-span-12",
    full: "sm:col-span-full",
  },
  md: {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
    5: "md:col-span-5",
    6: "md:col-span-6",
    7: "md:col-span-7",
    8: "md:col-span-8",
    9: "md:col-span-9",
    10: "md:col-span-10",
    11: "md:col-span-11",
    12: "md:col-span-12",
    full: "md:col-span-full",
  },
  lg: {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
    7: "lg:col-span-7",
    8: "lg:col-span-8",
    9: "lg:col-span-9",
    10: "lg:col-span-10",
    11: "lg:col-span-11",
    12: "lg:col-span-12",
    full: "lg:col-span-full",
  },
  xl: {
    1: "xl:col-span-1",
    2: "xl:col-span-2",
    3: "xl:col-span-3",
    4: "xl:col-span-4",
    5: "xl:col-span-5",
    6: "xl:col-span-6",
    7: "xl:col-span-7",
    8: "xl:col-span-8",
    9: "xl:col-span-9",
    10: "xl:col-span-10",
    11: "xl:col-span-11",
    12: "xl:col-span-12",
    full: "xl:col-span-full",
  },
} as const satisfies Record<Breakpoint, Record<GridSpan, string>>;

const START = {
  base: {
    1: "col-start-1",
    2: "col-start-2",
    3: "col-start-3",
    4: "col-start-4",
    5: "col-start-5",
    6: "col-start-6",
    7: "col-start-7",
    8: "col-start-8",
    9: "col-start-9",
    10: "col-start-10",
    11: "col-start-11",
    12: "col-start-12",
  },
  sm: {
    1: "sm:col-start-1",
    2: "sm:col-start-2",
    3: "sm:col-start-3",
    4: "sm:col-start-4",
    5: "sm:col-start-5",
    6: "sm:col-start-6",
    7: "sm:col-start-7",
    8: "sm:col-start-8",
    9: "sm:col-start-9",
    10: "sm:col-start-10",
    11: "sm:col-start-11",
    12: "sm:col-start-12",
  },
  md: {
    1: "md:col-start-1",
    2: "md:col-start-2",
    3: "md:col-start-3",
    4: "md:col-start-4",
    5: "md:col-start-5",
    6: "md:col-start-6",
    7: "md:col-start-7",
    8: "md:col-start-8",
    9: "md:col-start-9",
    10: "md:col-start-10",
    11: "md:col-start-11",
    12: "md:col-start-12",
  },
  lg: {
    1: "lg:col-start-1",
    2: "lg:col-start-2",
    3: "lg:col-start-3",
    4: "lg:col-start-4",
    5: "lg:col-start-5",
    6: "lg:col-start-6",
    7: "lg:col-start-7",
    8: "lg:col-start-8",
    9: "lg:col-start-9",
    10: "lg:col-start-10",
    11: "lg:col-start-11",
    12: "lg:col-start-12",
  },
  xl: {
    1: "xl:col-start-1",
    2: "xl:col-start-2",
    3: "xl:col-start-3",
    4: "xl:col-start-4",
    5: "xl:col-start-5",
    6: "xl:col-start-6",
    7: "xl:col-start-7",
    8: "xl:col-start-8",
    9: "xl:col-start-9",
    10: "xl:col-start-10",
    11: "xl:col-start-11",
    12: "xl:col-start-12",
  },
} as const satisfies Record<Breakpoint, Record<GridStart, string>>;

const grid = componentVariants({
  // The default gap is AutoGrid's grid-gap token, clamp(16px, 2vw, 24px).
  base: "grid min-w-0 gap-grid-gap",
  variants: {
    columns: { 12: "grid-cols-12", 6: "grid-cols-6", 4: "grid-cols-4" },
    gap: GAP_CLASS,
  },
  defaultVariants: { columns: 12 },
});

// min-w-0: a long word overflows its cell instead of widening the track (readme §3.10).
const gridItem = componentVariants({ base: "min-w-0" });

export interface GridProps extends ComponentProps<"div"> {
  /** Column count of the track. Default: 12. */
  columns?: 12 | 6 | 4 | undefined;
  /** Gap step between rows and columns: N × 4px. Default: the grid-gap token (16–24px). */
  gap?: SpaceStep | undefined;
  as?: "div" | "section" | "ul" | "ol" | undefined;
  /** Token-typed spacing, look and layout overrides (spec §3). */
  sx?: Sx | undefined;
}

/** A fixed-column page grid (12 by default). Place children with GridItem; for cards use AutoGrid. */
export function Grid({ as = "div", columns, gap, sx, className, ...props }: GridProps) {
  // tsc -b TS2322: the spread `ref` is a div ref, which the other elements' refs reject (Stack).
  const Element = as as "div";
  return (
    <Element className={grid({ columns, gap, className: withSx(sx, className) })} {...props} />
  );
}

export interface GridItemProps extends ComponentProps<"div"> {
  /** Columns spanned — a number, `"full"`, or one per breakpoint. Unset base: the full row. */
  span?: GridResponsive<GridSpan> | undefined;
  /** The column the item starts at — a number or one per breakpoint. */
  start?: GridResponsive<GridStart> | undefined;
  as?: "div" | "li" | "article" | "section" | undefined;
  /** Token-typed spacing, look and layout overrides (spec §3). */
  sx?: Sx | undefined;
}

/** One cell of a Grid. Mobile first: without a base `span` it takes the whole row. */
export function GridItem({ as = "div", span, start, sx, className, ...props }: GridItemProps) {
  const spans: Partial<Record<Breakpoint, GridSpan | undefined>> =
    typeof span === "object" ? span : { base: span };
  const starts: Partial<Record<Breakpoint, GridStart | undefined>> =
    typeof start === "object" ? start : { base: start };
  const classes = BREAKPOINTS.flatMap((bp) => {
    const spanAt = bp === "base" ? (spans.base ?? "full") : spans[bp];
    const startAt = starts[bp];
    return [
      spanAt === undefined ? undefined : SPAN[bp][spanAt],
      startAt === undefined ? undefined : START[bp][startAt],
    ];
  });
  const Element = as as "div";
  return (
    <Element className={gridItem({ className: [...classes, withSx(sx, className)] })} {...props} />
  );
}
