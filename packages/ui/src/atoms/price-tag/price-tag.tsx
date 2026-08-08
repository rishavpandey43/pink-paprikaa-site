import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const priceTag = componentVariants({
  slots: {
    // Baseline alignment, not centre: the struck original must sit on the same line as the price.
    root: "inline-flex flex-wrap items-baseline gap-2",
    // Raw type classes rather than the `Text` atom: a price is display-face and bold at *every*
    // size, and no single step of the ramp carries that pairing at 14px (`body2` is body-face).
    amount: "font-display font-bold tracking-subtitle1",
    original: "font-body line-through",
  },
  variants: {
    /** 14 / 20 / 25px. `sm` is the menu row, `md` the card, `lg` the item page and the cart bar. */
    size: {
      sm: { amount: "text-body2", original: "text-caption" },
      md: { amount: "text-subtitle1", original: "text-body2" },
      lg: { amount: "text-h3", original: "text-body1" },
    },
    /** `inverse` on a flooded pink or ink panel — the ink tones vanish there. */
    tone: {
      ink: { amount: "text-text-heading", original: "text-text-subtle" },
      brand: { amount: "text-text-link", original: "text-text-subtle" },
      inverse: { amount: "text-text-on-inverse", original: "text-glass-white" },
    },
  },
  defaultVariants: { size: "md", tone: "ink" },
});

/**
 * The one correct way to print a price here: rupee sign with no space, Indian digit grouping, and
 * no decimals on a whole-rupee amount. Never hand-write a price string.
 */
function formatRupees(value: number): string {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  })}`;
}

export interface PriceTagProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children">, VariantProps<typeof priceTag> {
  /** The price to print, in rupees. */
  amount: number;
  // `| undefined` is explicit on every optional below: the workspace sets
  // `exactOptionalPropertyTypes`, under which `prop?: T` REJECTS an explicitly-passed
  // `undefined`. Without it a consumer cannot forward its own optional straight through
  // (`<Thing src={item.photo} />` fails when `photo` is `string | undefined`).
  /** Upper bound of a range — prints `₹180–₹320` with an en dash. */
  to?: number | undefined;
  /** The pre-discount price, printed struck through after the live one. */
  was?: number | undefined;
}

export function PriceTag({ amount, to, was, className, size, tone, ...props }: PriceTagProps) {
  const parts = priceTag({ size, tone });
  return (
    <span className={parts.root({ className })} {...props}>
      <span className={parts.amount()}>
        {to === undefined ? formatRupees(amount) : `${formatRupees(amount)}–${formatRupees(to)}`}
      </span>
      {was === undefined ? null : (
        <>
          {/* A strikethrough is a visual cue only, so the relationship is said out loud too. The
              prefix sits outside the `<s>` so the struck price stays one uninterrupted string. */}
          <span className="sr-only">Was</span>
          <s className={parts.original()}>{formatRupees(was)}</s>
        </>
      )}
    </span>
  );
}
