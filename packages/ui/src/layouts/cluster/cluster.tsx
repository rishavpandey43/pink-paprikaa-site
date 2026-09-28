import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { GAP_CLASS, type SpaceStep } from "../../lib/space";

const cluster = componentVariants({
  base: "flex min-w-0",
  variants: {
    space: GAP_CLASS,
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    isNowrap: { true: "flex-nowrap", false: "flex-wrap" },
    // The rail: one scrolling row whose items keep their size. Overflow clips at the padding box,
    // so 4px of padding (cancelled by a -4px margin — content stays aligned) plus 4px of scroll
    // padding leave room for the 2px focus outline at 2px offset, at rest and when scrolled to.
    isScrollable: { true: "-m-1 scroll-px-1 flex-nowrap overflow-x-auto p-1 *:shrink-0" },
  },
});

export interface ClusterProps extends ComponentProps<"div"> {
  /** Spacing step between items: N × 4px (`3` is 12px). */
  space?: SpaceStep | undefined;
  align?: "start" | "center" | "end" | "baseline" | undefined;
  justify?: "start" | "center" | "end" | "between" | undefined;
  /** Never wrap — use with care: a long row can overflow. */
  isNowrap?: boolean | undefined;
  /**
   * Scroll sideways instead of wrapping — the mobile category rail. The rail is a tab stop so the
   * keyboard can scroll it; name it with `aria-label` (plus `role="group"` on a `div` — never on a
   * `ul`, which keeps its list role), and pass `tabIndex={-1}` when every item is itself focusable.
   */
  isScrollable?: boolean | undefined;
  as?: "div" | "ul" | "ol" | "nav" | undefined;
}

/** Any horizontal run of small things — buttons, tags, badges, meta. Wraps, so a row can never clip. */
export function Cluster({
  as = "div",
  space = 3,
  align = "center",
  justify = "start",
  isNowrap = false,
  isScrollable = false,
  className,
  ...props
}: ClusterProps) {
  // tsc -b TS2322: the spread `ref` is a div ref, which ul/ol refs reject (the Stack trap). A narrow
  // cast — every member of the `as` union takes the same props.
  const Element = as as "div";
  // A scroll container the keyboard cannot reach cannot be scrolled without a pointer (WCAG 2.1.1).
  const tabIndex = isScrollable ? 0 : undefined;
  return (
    <Element
      tabIndex={tabIndex}
      className={cluster({ space, align, justify, isNowrap, isScrollable, className })}
      {...props}
    />
  );
}
