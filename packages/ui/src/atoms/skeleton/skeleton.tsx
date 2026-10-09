import type { BaseProps } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

/** The design system's line widths (100 / 92 / 68 / 84%) on Tailwind's fraction steps, cycling. */
const LINE_WIDTHS = ["w-full", "w-11/12", "w-2/3", "w-5/6"] as const;

/** Light-pink placeholders — never grey, never a gradient (readme §3.8). */
const skeleton = componentVariants({
  slots: {
    root: "",
    line: "block h-4 rounded-sm bg-pink-100 motion-safe:animate-skeleton",
  },
  variants: {
    variant: {
      block: { root: "block h-4 w-full rounded-sm bg-pink-100 motion-safe:animate-skeleton" },
      circle: { root: "block size-10 rounded-pill bg-pink-100 motion-safe:animate-skeleton" },
      text: { root: "grid gap-2" },
    },
  },
  defaultVariants: { variant: "block" },
});

export interface SkeletonProps extends BaseProps<"div"> {
  /** = "block" */
  variant?: "text" | "block" | "circle" | undefined;
  /** Number of text lines (variant `text`). = 3 */
  lines?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
}

/** Loading placeholder, sized with `className` (`h-18 rounded-lg`, `size-8`). */
export function Skeleton({ variant = "block", lines = 3, sx, className, ...props }: SkeletonProps) {
  const styles = skeleton({ variant });
  return (
    <div
      aria-hidden="true"
      className={styles.root({ className: withSx(sx, className) })}
      {...props}
    >
      {variant === "text"
        ? Array.from({ length: lines }, (_, index) => (
            <div
              key={index}
              className={styles.line({ className: LINE_WIDTHS[index % LINE_WIDTHS.length] })}
            />
          ))
        : null}
    </div>
  );
}
