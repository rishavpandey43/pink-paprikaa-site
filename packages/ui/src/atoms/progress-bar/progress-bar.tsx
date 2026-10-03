import { useId } from "react";

import type { BasePropsWithColor } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

/**
 * A continuous bar is one track segment holding a fill; a stamp bar is N segments, the earned
 * ones holding a full fill. One shape, one set of colours, both modes.
 */
const progressBar = componentVariants({
  slots: {
    root: "grid gap-2",
    label: "font-body text-progress-label text-text-muted",
    track: "flex w-full gap-1.25",
    segment: "flex-1 overflow-hidden rounded-pill",
    bar: "block h-full rounded-pill transition-all duration-slow ease-out",
    stamp:
      "block size-full rounded-pill transition-opacity duration-base ease-out starting:opacity-0",
  },
  variants: {
    color: {
      brand: { segment: "bg-pink-200", bar: "bg-pink-500", stamp: "bg-pink-500" },
      success: { segment: "bg-pink-200", bar: "bg-mint", stamp: "bg-mint" },
      inverse: { segment: "bg-white-alpha-28", bar: "bg-ink-000", stamp: "bg-ink-000" },
    },
    size: {
      sm: { track: "h-progress-sm" },
      md: { track: "h-progress-md" },
    },
    isLabelHidden: { true: { label: "sr-only" } },
  },
  defaultVariants: { color: "brand", size: "md", isLabelHidden: false },
});

export interface ProgressBarProps extends BasePropsWithColor<"div"> {
  /** Progress so far — or, with `segments`, the number of stamps earned. */
  value: number;
  /** = 100. Ignored with `segments`. */
  max?: number | undefined;
  /** Draw N discrete stamps (the loyalty pattern) instead of a continuous bar. */
  segments?: number | undefined;
  /** The progressbar's accessible name; visible unless `isLabelHidden`. */
  label: string;
  /** `inverse` on pink or ink panels. = "brand" */
  color?: "brand" | "success" | "inverse" | undefined;
  /** sm 6px (inside a LoyaltyCard) · md 8px. = "md" */
  size?: "sm" | "md" | undefined;
  /** Hides the label visually; it stays the accessible name. */
  isLabelHidden?: boolean | undefined;
}

/** Loyalty stamps and checkout/upload progress: pink-200 track, pink-500 fill. */
export function ProgressBar({
  value,
  max = 100,
  segments,
  label,
  color,
  size,
  isLabelHidden,
  sx,
  className,
  ...props
}: ProgressBarProps) {
  const labelId = useId();
  const total = segments ?? max;
  if (
    !Number.isFinite(value) ||
    !(total > 0) ||
    (segments !== undefined && !Number.isInteger(segments))
  ) {
    throw new RangeError(
      `ProgressBar: needs a finite value, a max above 0 and whole segments, got ${String(value)} of ${String(total)}`
    );
  }
  const current = Math.min(Math.max(value, 0), total);
  const styles = progressBar({ color, size, isLabelHidden });

  return (
    <div className={styles.root({ className: withSx(sx, className) })} {...props}>
      <span id={labelId} className={styles.label()}>
        {label}
      </span>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={
          segments === undefined ? undefined : `${String(current)} of ${String(segments)}`
        }
        className={styles.track()}
      >
        {segments === undefined ? (
          <span className={styles.segment()}>
            <span
              className={styles.bar()}
              style={{ width: `${String((current / total) * 100)}%` }}
            />
          </span>
        ) : (
          Array.from({ length: segments }, (_, index) => (
            <span key={index} className={styles.segment()}>
              {index < current ? <span className={styles.stamp()} /> : null}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
