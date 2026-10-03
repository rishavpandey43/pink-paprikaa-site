import type { ComponentProps } from "react";

import { SURFACE_BG, SURFACE_DATA, type SurfaceProp } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { type Sx, withSx } from "../../lib/sx";

const box = componentVariants({
  variants: {
    // The ground a surface establishes; data-surface (below) makes the text inside follow it.
    surface: SURFACE_BG,
  },
});

type BoxElement =
  | "div"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "main"
  | "nav"
  | "span"
  | "ul"
  | "ol"
  | "li";

export interface BoxProps extends ComponentProps<"div"> {
  as?: BoxElement | undefined;
  /** Sets `data-surface` and its ground, so text inside reads on it. */
  surface?: SurfaceProp | undefined;
  /** Token-typed spacing, look and layout overrides (spec §3). */
  sx?: Sx | undefined;
}

/** A polymorphic wrapper: `as`, `surface` and `sx`. MUI's Box, token-only. */
export function Box({ as = "div", surface, sx, className, ...props }: BoxProps) {
  // tsc -b TS2322: the spread `ref` is a div ref, which the other elements' refs reject (Stack).
  const Element = as as "div";
  return (
    <Element
      data-surface={surface === undefined ? undefined : SURFACE_DATA[surface]}
      className={box({ surface, className: withSx(sx, className) })}
      {...props}
    />
  );
}
