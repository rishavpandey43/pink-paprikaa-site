import { formatRupeeRange, formatRupees } from "@pink-paprikaa-web/utils";

import type { BasePropsWithColor } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { assertStruckAbove, StruckPrice } from "../../lib/struck-price";
import { withSx } from "../../lib/sx";

/** Size on the tag, amount and struck price in em — one class scales the whole price. */
const priceTag = componentVariants({
  slots: {
    root: "inline-flex flex-wrap items-baseline gap-2",
    amount: "font-display text-price-amount font-bold",
    was: "font-body text-price-was",
  },
  variants: {
    size: {
      sm: { root: "text-price-sm" },
      md: { root: "text-price-md" },
      lg: { root: "text-price-lg" },
      canvas: { root: "text-price-canvas" },
    },
    color: {
      neutral: { amount: "text-text-heading" },
      brand: { amount: "text-text-brand" },
      inverse: { amount: "text-text-on-inverse" },
    },
  },
  defaultVariants: { size: "md", color: "neutral" },
});

export interface PriceTagProps extends BasePropsWithColor<"span"> {
  /** Whole rupees. */
  amount: number;
  /** The original price, struck through. Must be higher than the price it replaces. */
  was?: number | undefined;
  /** Upper bound: renders "₹180–₹320". Must not be below `amount`. */
  to?: number | undefined;
  /** sm 14 · md 17 · lg 22px · canvas 56px (1080px artboards); a text class also scales the tag. = "md" */
  size?: "sm" | "md" | "lg" | "canvas" | undefined;
  /** `inverse` on pink or ink panels (`neutral` already follows the surface). = "neutral" */
  color?: "neutral" | "brand" | "inverse" | undefined;
}

/**
 * The only correct way to print a price: `₹` with no space, no decimals, Indian grouping, an
 * en-dash range, the original struck through. A struck price that is not higher, or a range that
 * runs backwards, would mislead a guest — both throw instead of rendering.
 */
export function PriceTag({
  amount,
  was,
  to,
  size = "md",
  color = "neutral",
  sx,
  className,
  ...props
}: PriceTagProps) {
  assertStruckAbove("PriceTag", was, to ?? amount);
  const styles = priceTag({ size, color });

  return (
    <span className={styles.root({ className: withSx(sx, className) })} {...props}>
      <span className={styles.amount()}>
        {to === undefined ? formatRupees(amount) : formatRupeeRange(amount, to)}
      </span>
      {was === undefined ? null : (
        <StruckPrice className={styles.was()}>{formatRupees(was)}</StruckPrice>
      )}
    </span>
  );
}
