import type { ElementType } from "react";

import { Slot } from "radix-ui";

import type { BaseProps, SurfaceProp } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { usePress } from "../../lib/use-press";

export interface CardProps extends BaseProps<"div"> {
  /** default white · feature light pink · quiet sunken grey. A `surface` replaces it. */
  variant?: "default" | "feature" | "quiet" | undefined;
  /** A flooded ground (brand pink or ink): sets `data-surface`, so the content remaps. */
  surface?: Extract<SurfaceProp, "brand" | "ink"> | undefined;
  /** none (flush media) · sm 16 · md 20 · lg 28. */
  padding?: "none" | "sm" | "md" | "lg" | undefined;
  /** The −2px hover lift to shadow-3. */
  isInteractive?: boolean | undefined;
  /** Make the single child (usually an `<a>`) the card. */
  asChild?: boolean | undefined;
}

/** The surface each skin sets: white cards are light islands, flooded ones remap their content. */
const SURFACE = {
  default: "light",
  quiet: "light",
  feature: "soft",
  brand: "brand",
  ink: "ink",
} as const;

const card = componentVariants({
  // no-underline: a card rendered as a link (asChild) must not underline its whole content.
  base: "overflow-hidden no-underline",
  variants: {
    variant: {
      default: "rounded-lg border border-border-subtle bg-surface-card shadow-1",
      feature: "rounded-xl bg-surface-brand-soft",
      brand: "rounded-xl bg-surface-brand shadow-brand",
      ink: "rounded-xl bg-surface-inverse",
      quiet: "rounded-lg bg-surface-sunken",
    },
    padding: { none: "p-0", sm: "p-4", md: "p-5", lg: "p-7" },
    isInteractive: {
      true: [
        "cursor-pointer transition duration-base ease-out hover:lift hover:shadow-3",
        "active:translate-y-0 active:press-scale-card active:shadow-1",
        "data-[pressed]:translate-y-0 data-[pressed]:press-scale-card data-[pressed]:shadow-1",
      ].join(" "),
    },
  },
  defaultVariants: { variant: "default", padding: "md", isInteractive: false },
});

/** Content container in the brand's five skins (three variants, two flooded surfaces). Never gets a coloured left border. */
export function Card({
  variant = "default",
  surface,
  padding,
  isInteractive = false,
  asChild = false,
  sx,
  className,
  ...props
}: CardProps) {
  const Component: ElementType = asChild ? Slot.Root : "div";
  // A flooded surface is a whole skin of its own: it replaces the variant, not stacks on it.
  const skin = surface ?? variant;
  const { pressProps } = usePress({
    disabled: !isInteractive,
    onPointerDown: props.onPointerDown,
    onPointerUp: props.onPointerUp,
    onPointerLeave: props.onPointerLeave,
    onKeyDown: props.onKeyDown,
    onKeyUp: props.onKeyUp,
    onBlur: props.onBlur,
  });
  return (
    <Component
      data-surface={SURFACE[skin]}
      className={card({ variant: skin, padding, isInteractive, className: withSx(sx, className) })}
      {...props}
      {...(isInteractive ? pressProps : {})}
    />
  );
}
