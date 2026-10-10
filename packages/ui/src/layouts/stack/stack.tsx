import { Children, type ElementType, Fragment, isValidElement } from "react";

import type { BaseProps } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { GAP_CLASS, type SpaceStep } from "../../lib/space";
import { withSx } from "../../lib/sx";

const stack = componentVariants({
  slots: {
    // One minmax(0, 1fr) column: a long word overflows its row instead of widening the stack past
    // its parent (readme §3.10 — never a track with a min-content floor).
    base: "grid min-w-0 grid-cols-1",
    rule: "h-px bg-border-subtle",
  },
  variants: {
    space: GAP_CLASS,
    align: {
      start: "justify-items-start",
      center: "justify-items-center",
      end: "justify-items-end",
      stretch: "justify-items-stretch",
    },
    justify: {
      start: "content-start",
      center: "content-center",
      end: "content-end",
      between: "content-between",
    },
  },
});

export interface StackProps extends BaseProps<"div"> {
  /** Spacing step between rows: N × 4px (`6` is 24px). */
  space?: SpaceStep | undefined;
  /** Inline alignment of every row (grid `justify-items`). Default: stretch. */
  align?: "start" | "center" | "end" | "stretch" | undefined;
  /** Block distribution when the stack is taller than its rows (grid `align-content`). */
  justify?: "start" | "center" | "end" | "between" | undefined;
  /** A hairline rule between rows — menu rows, list items. The rule follows the surface. */
  isDivided?: boolean | undefined;
  as?: "div" | "ul" | "ol" | "section" | "article" | undefined;
}

/** Vertical rhythm: gap-based, never margins. Each direct child is one row. */
export function Stack({
  as = "div",
  space = 4,
  align,
  justify,
  isDivided = false,
  sx,
  className,
  children,
  ...props
}: StackProps) {
  // tsc -b TS2322: the spread `ref` is a div ref, which ul/ol refs reject. A narrow cast, not a
  // looser type — every member of the `as` union is an HTMLElement with the same props shape.
  const Element = as as "div";
  // Inside a list a rule must itself be a list item; aria-hidden keeps it out of the item count.
  const Rule: ElementType = as === "ul" || as === "ol" ? "li" : "div";
  const slots = stack({ space, align, justify });

  return (
    <Element className={slots.base({ className: withSx(sx, className) })} {...props}>
      {isDivided
        ? Children.toArray(children).map((child, index) => (
            <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>
              {index > 0 ? <Rule aria-hidden className={slots.rule()} /> : null}
              {child}
            </Fragment>
          ))
        : children}
    </Element>
  );
}
