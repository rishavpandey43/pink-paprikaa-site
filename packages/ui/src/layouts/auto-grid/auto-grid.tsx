import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { GAP_CLASS, type SpaceStep } from "../../lib/space";

/** Minimum track before a column drops: xs 140 · sm 200 · md 260 · lg 320 · xl 380 · 2xl 420 px. */
export type AutoGridMin = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const autoGrid = componentVariants({
  base: "grid gap-grid-gap",
  variants: {
    // styles.css `autogrid-min-*`: repeat(auto-fit, minmax(min(<step>, 100%), 1fr)).
    min: {
      xs: "autogrid-min-xs",
      sm: "autogrid-min-sm",
      md: "autogrid-min-md",
      lg: "autogrid-min-lg",
      xl: "autogrid-min-xl",
      "2xl": "autogrid-min-2xl",
    },
    // Tailwind's grid-cols-N is repeat(N, minmax(0, 1fr)) — never a bare 1fr.
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    },
    space: GAP_CLASS,
  },
});

export interface AutoGridProps extends ComponentProps<"div"> {
  /** Auto-fit track minimum — the width at which a column drops. Handoff values snap to a step. */
  min?: AutoGridMin | undefined;
  /** A fixed column count instead of auto-fit; `min` is then ignored. */
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  /** Gap step. Default: the fluid grid gap clamp(16px, 2vw, 24px). */
  space?: SpaceStep | undefined;
  as?: "div" | "ul" | "ol" | "section" | undefined;
}

/** Every card grid in the system: it drops columns instead of squashing them. */
export function AutoGrid({
  as = "div",
  min = "md",
  columns,
  space,
  className,
  ...props
}: AutoGridProps) {
  // tsc -b TS2322: the spread `ref` is a div ref, which ul/ol refs reject. A narrow cast, not a
  // looser type — every member of the `as` union is an HTMLElement with the same props shape.
  const Element = as as "div";
  return (
    <Element
      className={autoGrid({
        min: columns === undefined ? min : undefined,
        columns,
        space,
        className,
      })}
      {...props}
    />
  );
}
