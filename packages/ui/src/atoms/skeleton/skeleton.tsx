import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const skeleton = componentVariants({
  slots: {
    /** Only used when `lines` is set — otherwise the block below is the whole component. */
    root: "flex w-full flex-col gap-2",
    // Soft pink, never grey, and a straight opacity pulse — never a gradient sweep across the
    // block, which is the one loading treatment the brand does not use.
    block: "block w-full animate-pp-shimmer bg-brand-soft",
  },
  variants: {
    /**
     * `text` is a single line of copy, `block` a photo or card placeholder, `circle` an avatar or
     * a chip. Override the height with a className — the variant only sets a sensible floor.
     */
    variant: {
      text: { block: "h-4 rounded-1" },
      block: { block: "h-20 rounded-3" },
      circle: { block: "size-10 rounded-6" },
    },
  },
  defaultVariants: { variant: "text" },
});

/** Line widths cycle so a stack of lines reads as prose, not as a stack of identical bars. */
const LINE_WIDTHS = ["w-full", "w-11/12", "w-2/3", "w-5/6"] as const;

export interface SkeletonProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children">, VariantProps<typeof skeleton> {
  /**
   * Render N stacked text lines instead of one block. Capped at six because the width classes are
   * static — Tailwind scans source text, so a computed width would never be generated.
   */
  lines?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  /**
   * What is loading, announced politely. Omit it when a parent already says so — a placeholder
   * with no label is hidden from assistive tech rather than read out as empty furniture.
   */
  label?: string | undefined;
}

export function Skeleton({ className, variant, lines, label, ...props }: SkeletonProps) {
  const { root, block } = skeleton({ variant: lines === undefined ? variant : "text" });
  const isDecorative = label === undefined;

  if (lines === undefined) {
    return (
      <span
        aria-hidden={isDecorative ? true : undefined}
        aria-label={label}
        className={block({ className })}
        role={isDecorative ? undefined : "status"}
        {...props}
      />
    );
  }

  return (
    <span
      aria-hidden={isDecorative ? true : undefined}
      aria-label={label}
      className={root({ className })}
      role={isDecorative ? undefined : "status"}
      {...props}
    >
      {Array.from({ length: lines }, (_, index) => (
        <span
          className={block({ className: LINE_WIDTHS[index % LINE_WIDTHS.length] ?? "w-full" })}
          key={index}
        />
      ))}
    </span>
  );
}
