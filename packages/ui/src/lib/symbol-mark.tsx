import type { ComponentProps } from "react";

import { componentVariants } from "./component-variants";

export type SymbolMarkProps = Omit<ComponentProps<"span">, "children" | "dangerouslySetInnerHTML">;

const symbolMark = componentVariants({ base: "inline-block shrink-0 mask-symbol" });

/**
 * The brand's diamond symbol, painted in `currentColor` — the mark every small diamond in the
 * system carries (Divider, StatusDot here; Spinner, Rating, SpiceLevel reuse it). Size it with a
 * class (`size-4`). Always decorative: the component that places it owns the accessible name.
 *
 * A `mask-symbol` span, never inline SVG (rulings R19/R25): the mask is defined once in
 * `brand-artwork.css`, so a menu page of spice levels ships the symbol's path data once, not per mark.
 */
export function SymbolMark({ className, ...props }: SymbolMarkProps) {
  return <span aria-hidden="true" className={symbolMark({ className })} {...props} />;
}
