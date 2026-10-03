import type { ReactNode } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import type { BaseProps } from "../../lib/common-props";

import { PriceTag } from "../../atoms/price-tag/price-tag";
import { componentVariants } from "../../lib/component-variants";
import { isShown } from "../../lib/is-shown";
import { withSx } from "../../lib/sx";

const priceSummary = componentVariants({
  slots: {
    root: "grid gap-2",
    list: "m-0 grid gap-2",
    line: "flex justify-between gap-4 text-body-sm",
    label: "text-text-muted",
    amount: "m-0 text-text-body tabular-nums",
    totalLine: "mt-1 flex items-center justify-between gap-4 border-t border-border-subtle pt-3",
    totalLabel: "font-display text-h4 text-text-heading",
    total: "m-0",
    note: "m-0 text-caption text-text-subtle",
  },
  variants: {
    isStrong: { true: { label: "text-text-heading", amount: "font-medium" } },
    isDiscount: { true: { amount: "text-price-summary-discount" } },
  },
  defaultVariants: { isStrong: false, isDiscount: false },
});

export interface PriceLine {
  label: ReactNode;
  /** Whole rupees. */
  amount: number;
  /** Prints with a leading minus in the discount colour (the sign given is ignored). */
  isDiscount?: boolean | undefined;
  isStrong?: boolean | undefined;
}

export interface PriceSummaryProps extends BaseProps<"div"> {
  lines: PriceLine[];
  /** Whole rupees. */
  total: number;
  totalLabel?: string | undefined;
  /** Fine print under the total, e.g. "Inclusive of all taxes." */
  note?: ReactNode;
}

/**
 * Cart totals, checkout summary, order receipts — and, with PriceTag, the only correct source of a
 * rupee amount. Follows the surface: on an ink or pink field every line turns light.
 */
export function PriceSummary({
  lines,
  total,
  totalLabel = "Total",
  note,
  sx,
  className,
  ...props
}: PriceSummaryProps) {
  const styles = priceSummary();

  return (
    <div className={styles.root({ className: withSx(sx, className) })} {...props}>
      <dl className={styles.list()}>
        {lines.map((line, index) => {
          const isDiscount = line.isDiscount === true;
          const isStrong = line.isStrong === true;
          return (
            <div key={index} className={styles.line()}>
              <dt className={styles.label({ isStrong })}>{line.label}</dt>
              <dd className={styles.amount({ isStrong, isDiscount })}>
                {formatRupees(isDiscount ? -Math.abs(line.amount) : line.amount)}
              </dd>
            </div>
          );
        })}
        <div className={styles.totalLine()}>
          <dt className={styles.totalLabel()}>{totalLabel}</dt>
          <dd className={styles.total()}>
            <PriceTag amount={total} size="lg" />
          </dd>
        </div>
      </dl>
      {isShown(note) ? <p className={styles.note()}>{note}</p> : null}
    </div>
  );
}
