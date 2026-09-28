import type { ComponentProps } from "react";

import { formatRupeeRange, formatRupees } from "@pink-paprikaa-web/utils";

import { componentVariants } from "../../lib/component-variants";

/** Size on the tag, amount and struck price in em — one class scales the whole price. */
const priceTag = componentVariants({
  slots: {
    root: "inline-flex flex-wrap items-baseline gap-2",
    amount: "font-display text-price-amount font-bold",
    was: "font-body text-price-was text-text-subtle",
  },
  variants: {
    size: {
      sm: { root: "text-price-sm" },
      md: { root: "text-price-md" },
      lg: { root: "text-price-lg" },
      canvas: { root: "text-price-canvas" },
    },
    tone: {
      ink: { amount: "text-text-heading" },
      brand: { amount: "text-text-brand" },
      inverse: { amount: "text-text-on-inverse" },
    },
  },
  defaultVariants: { size: "md", tone: "ink" },
});

export interface PriceTagProps extends ComponentProps<"span"> {
  /** Whole rupees. */
  amount: number;
  /** The original price, struck through. Must be higher than the price it replaces. */
  was?: number | undefined;
  /** Upper bound: renders "₹180–₹320". Must not be below `amount`. */
  to?: number | undefined;
  /** sm 14 · md 17 · lg 22px · canvas 56px (1080px artboards); a text class also scales the tag. = "md" */
  size?: "sm" | "md" | "lg" | "canvas" | undefined;
  /** `inverse` on pink or ink panels (`ink` already follows the surface). = "ink" */
  tone?: "ink" | "brand" | "inverse" | undefined;
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
  tone = "ink",
  className,
  ...props
}: PriceTagProps) {
  const price = to ?? amount;
  if (was !== undefined && was <= price) {
    throw new RangeError(
      `PriceTag: was (${String(was)}) must be more than the price it strikes through (${String(price)})`
    );
  }
  const styles = priceTag({ size, tone });

  return (
    <span className={styles.root({ className })} {...props}>
      <span className={styles.amount()}>
        {to === undefined ? formatRupees(amount) : formatRupeeRange(amount, to)}
      </span>
      {was === undefined ? null : (
        <s className={styles.was()}>
          <span className="sr-only">was </span>
          {formatRupees(was)}
        </s>
      )}
    </span>
  );
}
