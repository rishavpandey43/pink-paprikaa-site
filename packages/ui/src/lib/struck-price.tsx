import type { ComponentProps } from "react";

import { componentVariants } from "./component-variants";

const struckPrice = componentVariants({ base: "text-text-subtle" });

export type StruckPriceProps = ComponentProps<"s">;

/**
 * The original price, struck through, in `text-subtle` (AA on every surface), with the hidden
 * lower-case "was" that tells assistive tech why it is struck (R94). PriceTag, PricingCard and
 * ChoiceCardGroup all draw theirs with it; size it with a class. Format the amount first
 * (`formatRupees`) and guard a numeric pair with `assertStruckAbove`.
 */
export function StruckPrice({ className, children, ...props }: StruckPriceProps) {
  return (
    <s className={struckPrice({ className })} {...props}>
      <span className="sr-only">was</span> {children}
    </s>
  );
}

/**
 * A struck price that is not higher than the price it replaces would mislead a guest: throw
 * instead of rendering it.
 */
export function assertStruckAbove(component: string, was: number | undefined, price: number) {
  if (was !== undefined && was <= price) {
    throw new RangeError(
      `${component}: was (${String(was)}) must be more than the price it strikes through (${String(price)})`
    );
  }
}
