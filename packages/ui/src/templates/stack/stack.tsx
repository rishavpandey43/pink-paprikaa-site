import type { ComponentPropsWithoutRef, ElementType } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

/**
 * The gap steps a `Stack` can take. Static strings, because Tailwind scans source text — a
 * computed `gap-${space}` would never be generated. The step number **is** the multiple of 4px,
 * so `space={6}` is 24px.
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
  16: "gap-16",
} as const;

export type StackSpace = keyof typeof GAP;

const stack = componentVariants({
  // `min-w-0` is the responsive contract: a grid child with long text must be allowed to shrink
  // below its min-content width or it pushes the whole row sideways.
  base: "grid min-w-0",
  variants: {
    /** How children line up across the stack's inline axis. */
    align: {
      start: "justify-items-start",
      center: "justify-items-center",
      end: "justify-items-end",
      stretch: "justify-items-stretch",
    },
    /**
     * How the rows distribute when the stack is taller than its content. `start` is the default
     * because a `Stack` is height-auto unless a caller says otherwise, so rows already pack from
     * the top — naming it changes nothing about the bare render, it only stops the control from
     * showing blank.
     */
    justify: {
      start: "content-start",
      center: "content-center",
      end: "content-end",
      between: "content-between",
    },
    /**
     * The hairline rules used between menu rows and list items. The only colour any flow layout in
     * this package emits, because a divider with no colour inherits `currentColor` and turns into
     * whatever the surrounding text happens to be.
     */
    hasDivider: { true: "divide-y divide-border-subtle", false: "" },
  },
  defaultVariants: { align: "stretch", justify: "start", hasDivider: false },
});

export interface StackProps extends ComponentPropsWithoutRef<"div">, VariantProps<typeof stack> {
  /** Override the rendered element — `as="ul"` for a real list, `as="dl"` for a spec table. */
  as?: ElementType | undefined;
  /** Spacing step: the number **is** the multiple of 4px, so `6` is 24px. Half steps 0.5 and 1.5. */
  space?: StackSpace | undefined;
}

export function Stack({
  align,
  as: Component = "div",
  children,
  className,
  hasDivider,
  justify,
  space = 4,
  ...props
}: StackProps) {
  return (
    <Component
      className={stack({ align, justify, hasDivider, className: [GAP[space], className] })}
      {...props}
    >
      {children}
    </Component>
  );
}
