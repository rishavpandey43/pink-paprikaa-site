import type { ComponentProps } from "react";

import type { SpaceStep } from "../../lib/space";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

/* Complete literal class names per step, so Tailwind's scanner sees every one (lib/space). */
const PADDING: Readonly<Record<SpaceStep, string>> = {
  0: "p-0",
  0.5: "p-0.5",
  1: "p-1",
  1.5: "p-1.5",
  2: "p-2",
  3: "p-3",
  4: "p-4",
  5: "p-5",
  6: "p-6",
  7: "p-7",
  8: "p-8",
  9: "p-9",
  10: "p-10",
  11: "p-11",
  12: "p-12",
  14: "p-14",
  16: "p-16",
  18: "p-18",
  20: "p-20",
  24: "p-24",
  32: "p-32",
};
const PADDING_X: Readonly<Record<SpaceStep, string>> = {
  0: "px-0",
  0.5: "px-0.5",
  1: "px-1",
  1.5: "px-1.5",
  2: "px-2",
  3: "px-3",
  4: "px-4",
  5: "px-5",
  6: "px-6",
  7: "px-7",
  8: "px-8",
  9: "px-9",
  10: "px-10",
  11: "px-11",
  12: "px-12",
  14: "px-14",
  16: "px-16",
  18: "px-18",
  20: "px-20",
  24: "px-24",
  32: "px-32",
};
const PADDING_Y: Readonly<Record<SpaceStep, string>> = {
  0: "py-0",
  0.5: "py-0.5",
  1: "py-1",
  1.5: "py-1.5",
  2: "py-2",
  3: "py-3",
  4: "py-4",
  5: "py-5",
  6: "py-6",
  7: "py-7",
  8: "py-8",
  9: "py-9",
  10: "py-10",
  11: "py-11",
  12: "py-12",
  14: "py-14",
  16: "py-16",
  18: "py-18",
  20: "py-20",
  24: "py-24",
  32: "py-32",
};

const box = componentVariants({
  variants: {
    padding: PADDING,
    paddingX: PADDING_X,
    paddingY: PADDING_Y,
    // Section's mapping: the surface a tone establishes, and its ground.
    surface: {
      light: "bg-surface-page",
      soft: "bg-surface-brand-soft",
      brand: "bg-surface-brand",
      ink: "bg-surface-inverse",
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      pill: "rounded-pill",
    },
    hasBorder: { true: "border-default border-border-default" },
    shadow: { 1: "shadow-1", 2: "shadow-2", 3: "shadow-3", 4: "shadow-4" },
  },
});

export interface BoxProps
  extends ComponentProps<"div">, Pick<VariantProps<typeof box>, "radius" | "shadow"> {
  as?:
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
    | "li"
    | undefined;
  /** All-round padding step: N × 4px. */
  padding?: SpaceStep | undefined;
  /** Inline padding step; sits beside `padding`, overriding its sides. */
  paddingX?: SpaceStep | undefined;
  /** Block padding step; sits beside `padding`, overriding its sides. */
  paddingY?: SpaceStep | undefined;
  /** Sets `data-surface` and its ground, so text inside reads on it (Section's mapping). */
  surface?: "light" | "soft" | "brand" | "ink" | undefined;
  /** The default 1px hairline. */
  hasBorder?: boolean | undefined;
}

/**
 * A wrapper with token-only props: padding steps, a surface, a radius, a hairline and a shadow.
 * Not a style escape hatch — there is no `sx` and no arbitrary value; a layout need beyond these
 * belongs in Stack, Cluster, Grid or a component of its own.
 */
export function Box({
  as = "div",
  padding,
  paddingX,
  paddingY,
  surface,
  radius,
  hasBorder = false,
  shadow,
  className,
  ...props
}: BoxProps) {
  // tsc -b TS2322: the spread `ref` is a div ref, which the other elements' refs reject (Stack).
  const Element = as as "div";
  return (
    <Element
      data-surface={surface}
      className={box({
        padding,
        paddingX,
        paddingY,
        surface,
        radius,
        hasBorder,
        shadow,
        className,
      })}
      {...props}
    />
  );
}
