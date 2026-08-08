import type { ComponentPropsWithoutRef } from "react";

import { Fragment } from "react";

import { Divider } from "../../atoms/divider/divider";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const priceSummary = componentVariants({
  slots: {
    // Two tracks: labels take the room that is left, amounts take exactly what they need, so every
    // rupee figure ends on the same right edge. `auto` rather than a fixed track so a five-figure
    // total cannot clip.
    root: "grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-2",
    rule: "col-span-2 my-1",
    totalLabel: "font-display font-bold text-subtitle1 leading-subtitle1 tracking-subtitle1",
    totalAmount: "justify-self-end font-mono font-bold text-h3 leading-h3",
    note: "col-span-2",
  },
  variants: {
    /** `inverse` on a flooded ink or pink panel, e.g. the checkout summary card. */
    tone: {
      light: { totalLabel: "text-text-heading", totalAmount: "text-text-heading" },
      inverse: { totalLabel: "text-text-on-inverse", totalAmount: "text-text-on-inverse" },
    },
  },
  defaultVariants: { tone: "light" },
});

// Raw type classes on the label and amount themselves rather than a nested `Text`: these two
// elements are the grid items that align the money column, so the type and the alignment have to be
// one decision on one element. The figures are mono at a body size, a pairing the ramp has no step
// for (`mono` is a fixed 13px), which is the same reason `PriceTag` sets its own type.
const lineLabel = componentVariants({
  base: "min-w-0 font-body text-body2 leading-body2",
  variants: {
    tone: { light: "text-text-muted", inverse: "text-text-on-inverse/75" },
    isStrong: { true: "font-medium", false: "" },
  },
  compoundVariants: [
    { tone: "light", isStrong: true, class: "text-text-heading" },
    { tone: "inverse", isStrong: true, class: "text-text-on-inverse" },
  ],
  defaultVariants: { tone: "light", isStrong: false },
});

const lineAmount = componentVariants({
  base: "justify-self-end font-mono text-body2 leading-body2",
  variants: {
    tone: { light: "text-text-body", inverse: "text-text-on-inverse/90" },
    isDiscount: { true: "", false: "" },
    isStrong: { true: "font-medium", false: "" },
  },
  compoundVariants: [
    { tone: "light", isStrong: true, class: "text-text-heading" },
    { tone: "inverse", isStrong: true, class: "text-text-on-inverse" },
    // A saving reads mint. On ink the full-strength mint has nothing to sit against, so it lifts
    // to the soft tint.
    { tone: "light", isDiscount: true, class: "text-status-success" },
    { tone: "inverse", isDiscount: true, class: "text-mint-soft" },
  ],
  defaultVariants: { tone: "light", isDiscount: false, isStrong: false },
});

/**
 * The one correct way to print a rupee figure in this block: rupee sign with no space, Indian digit
 * grouping, and no decimals on a whole-rupee amount. Never hand-write a price string.
 *
 * `Math.abs` because a saving carries its own leading minus — a `-` in the middle of `₹-100` would
 * be wrong twice over.
 */
function formatRupees(value: number): string {
  return `₹${Math.abs(value).toLocaleString("en-IN", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  })}`;
}

export interface PriceLine {
  /** What the amount is for — sentence case, e.g. "GST (5%)". */
  label: string;
  /** Whole rupees. Pass the amount as a positive number even on a saving. */
  amount: number;
  /** A saving — prints in mint with a leading minus. */
  isDiscount?: boolean;
  /** Pulls one line up to heading weight, e.g. a running subtotal above the taxes. */
  isStrong?: boolean;
}

export interface PriceSummaryProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">, VariantProps<typeof priceSummary> {
  /** The lines above the rule, in the order they should be read. */
  lines?: PriceLine[] | undefined;
  /** The amount actually payable, in whole rupees. */
  total: number;
  /** Overrides the total's label — "Amount Paid" on a receipt, "To Pay" in the cart. */
  totalLabel?: string | undefined;
  /** Fine print under the total, e.g. "Inclusive of all taxes." */
  note?: string | undefined;
}

export function PriceSummary({
  className,
  lines = [],
  note,
  tone,
  total,
  totalLabel = "Total",
  ...props
}: PriceSummaryProps) {
  const parts = priceSummary({ tone });
  return (
    <div className={parts.root({ className })} {...props}>
      {lines.map((line) => (
        <Fragment key={line.label}>
          <span className={lineLabel({ isStrong: line.isStrong, tone })}>{line.label}</span>
          <span
            className={lineAmount({ isDiscount: line.isDiscount, isStrong: line.isStrong, tone })}
          >
            {line.isDiscount === true ? "−" : ""}
            {formatRupees(line.amount)}
          </span>
        </Fragment>
      ))}
      <Divider className={parts.rule()} on={tone === "inverse" ? "brand" : "light"} />
      <span className={parts.totalLabel()}>{totalLabel}</span>
      <span className={parts.totalAmount()}>{formatRupees(total)}</span>
      {note === undefined ? null : (
        <Text
          as="div"
          className={parts.note()}
          tone={tone === "inverse" ? "inverse" : "subtle"}
          variant="caption"
        >
          {note}
        </Text>
      )}
    </div>
  );
}
