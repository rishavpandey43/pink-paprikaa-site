import type { ComponentPropsWithoutRef, ElementType } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

/**
 * The gap steps a `Cluster` can take. Static strings, because Tailwind scans source text — a
 * computed `gap-${space}` would never be generated. The step number **is** the multiple of 4px.
 */
const GAP = {
  0: "gap-0",
  0.5: "gap-0-5",
  1: "gap-1",
  1.5: "gap-1-5",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
} as const;

export type ClusterSpace = keyof typeof GAP;

const cluster = componentVariants({
  // Wrapping is the default on purpose: the responsive contract says a row that can run out of
  // room wraps on a gap, never on per-child margins, so a long run of tags can never clip.
  base: "flex min-w-0",
  variants: {
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
    /** Refuse to wrap. Use only where the row is provably short — it can overflow. */
    isNowrap: { true: "flex-nowrap", false: "flex-wrap" },
    /**
     * Scroll sideways instead of wrapping: the app's category rail and the mobile filter bar. The
     * rail becomes keyboard-focusable, so give it an `aria-label` — that is what turns it into a
     * named region rather than an anonymous tab stop.
     */
    isScrollable: { true: "flex-nowrap overflow-x-auto pb-1", false: "" },
  },
  defaultVariants: { align: "center", justify: "start", isNowrap: false, isScrollable: false },
});

export interface ClusterProps
  extends ComponentPropsWithoutRef<"div">, VariantProps<typeof cluster> {
  /** Override the rendered element — `as="ul"` when the run is a real list of tags. */
  as?: ElementType | undefined;
  /** Spacing step: the number **is** the multiple of 4px, so `3` is 12px. Half steps 0.5 and 1.5. */
  space?: ClusterSpace | undefined;
}

/**
 * A sideways rail is a scroll container, and a scroll container that cannot take focus is
 * unreachable by keyboard — nothing past the fold can be scrolled to without a mouse or a trackpad
 * (axe `scrollable-region-focusable`). So `isScrollable` makes the rail focusable, and names it as
 * a region **only** when the caller has given it an accessible name: an unnamed `role="region"`
 * announces as "region" and buries whatever list role the element had.
 */
function scrollableRegionProps(props: Pick<ClusterProps, "aria-label" | "aria-labelledby">): {
  role?: "region";
  tabIndex: number;
} {
  const hasName = props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;

  return hasName ? { role: "region", tabIndex: 0 } : { tabIndex: 0 };
}

export function Cluster({
  align,
  as: Component = "div",
  children,
  className,
  isNowrap,
  isScrollable,
  justify,
  space = 3,
  ...props
}: ClusterProps) {
  return (
    <Component
      className={cluster({
        align,
        justify,
        isNowrap,
        isScrollable,
        className: [GAP[space], className],
      })}
      {...(isScrollable === true ? scrollableRegionProps(props) : {})}
      {...props}
    >
      {children}
    </Component>
  );
}
