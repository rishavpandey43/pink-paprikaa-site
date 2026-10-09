import type { ComponentProps } from "react";

import { formatCount } from "@pink-paprikaa-web/utils";

import { BrandDiamond, type BrandDiamondSize } from "../../lib/brand-diamond";
import type { SxProp } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { SymbolMark } from "../../lib/symbol-mark";

type RatingSize = "sm" | "md" | "lg";

/** Rating.card.html's sizes, as diamond edge lengths. */
const DIAMOND_SIZE: Readonly<Record<RatingSize, BrandDiamondSize>> = {
  sm: "12px",
  md: "16px",
  lg: "24px",
};

const rating = componentVariants({
  slots: {
    root: "inline-flex items-center gap-2",
    units: "inline-flex items-center",
    value: "font-display text-rating-value font-bold text-text-heading tabular-nums",
    count: "font-body text-rating-count text-text-subtle tabular-nums",
  },
  variants: {
    variant: {
      diamond: { units: "gap-1" },
      symbol: { units: "gap-0.75" },
    },
  },
  defaultVariants: { variant: "diamond" },
});

const symbolUnit = componentVariants({
  slots: {
    unit: "relative shrink-0",
    track: "absolute inset-0 size-full text-pink-500 opacity-22",
    fill: "absolute inset-0 size-full text-pink-500",
  },
  variants: {
    size: {
      sm: { unit: "size-brand-diamond-12" },
      md: { unit: "size-brand-diamond-16" },
      lg: { unit: "size-brand-diamond-24" },
    },
  },
  defaultVariants: { size: "md" },
});

/** Clips a fill layer to `fraction` of its unrotated box, left to right — screen space. */
function clipTo(fraction: number) {
  if (fraction >= 1) return undefined;
  const hidden = Math.round((1 - fraction) * 1000) / 10;
  return { clipPath: `inset(0 ${String(hidden)}% 0 0)` };
}

interface UnitProps {
  /** 0…1: how much of this unit is filled. */
  fill: number;
  size: RatingSize;
}

function DiamondUnit({ fill, size }: UnitProps) {
  return (
    <span className="relative grid shrink-0">
      <BrandDiamond size={DIAMOND_SIZE[size]} fill="empty" />
      {fill > 0 ? (
        <span className="absolute inset-0" style={clipTo(fill)}>
          <BrandDiamond size={DIAMOND_SIZE[size]} fill="brand" />
        </span>
      ) : null}
    </span>
  );
}

function SymbolUnit({ fill, size }: UnitProps) {
  const styles = symbolUnit({ size });
  return (
    <span className={styles.unit()}>
      <SymbolMark className={styles.track()} />
      {fill > 0 ? <SymbolMark className={styles.fill()} style={clipTo(fill)} /> : null}
    </span>
  );
}

export interface RatingProps extends ComponentProps<"span">, SxProp {
  /** 0…max; any fraction (4.3 fills 30% of the fifth diamond). */
  value: number;
  /** = 5 */
  max?: number | undefined;
  /** Review count, a whole number ≥ 0, shown in brackets with Indian digit grouping and read in the name. */
  count?: number | undefined;
  /** sm 12 · md 16 · lg 24px diamonds. = "md" */
  size?: RatingSize | undefined;
  /** `symbol` swaps the diamond for the bare brand mark (ReviewCard, marketing artwork). */
  variant?: "diamond" | "symbol" | undefined;
  /** = true: show the score to one decimal. */
  hasValue?: boolean | undefined;
}

/** Review score: brand diamonds, not stars. One image, named with the score (and the count). */
export function Rating({
  value,
  max = 5,
  count,
  size = "md",
  variant = "diamond",
  hasValue = true,
  sx,
  className,
  ...props
}: RatingProps) {
  if (!Number.isInteger(max) || max < 1 || !Number.isFinite(value) || value < 0 || value > max) {
    throw new RangeError(
      `Rating: value must be between 0 and a whole max of at least 1, got ${String(value)} of ${String(max)}`
    );
  }
  if (count !== undefined && (!Number.isInteger(count) || count < 0)) {
    throw new RangeError(`Rating: count must be a whole number of reviews, got ${String(count)}`);
  }
  const styles = rating({ variant });
  // Rounded once and printed one way, so the name and the visible score never disagree
  // (4.25 → "4.3" and 4 → "4.0" in both).
  const shown = (Math.round(value * 10) / 10).toFixed(1);
  const score = `${shown} out of ${String(max)}`;
  const name = count === undefined ? score : `${score}, ${formatCount(count)} reviews`;

  return (
    <span
      role="img"
      aria-label={name}
      className={styles.root({ className: withSx(sx, className) })}
      {...props}
    >
      <span className={styles.units()}>
        {Array.from({ length: max }, (_, index) => {
          const fill = Math.min(Math.max(value - index, 0), 1);
          return variant === "symbol" ? (
            <SymbolUnit key={index} fill={fill} size={size} />
          ) : (
            <DiamondUnit key={index} fill={fill} size={size} />
          );
        })}
      </span>
      {hasValue ? <span className={styles.value()}>{shown}</span> : null}
      {count === undefined ? null : <span className={styles.count()}>({formatCount(count)})</span>}
    </span>
  );
}
