import type { ComponentProps, ElementType } from "react";

import { Slot } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";

export interface CardProps extends ComponentProps<"div"> {
  /** default white · feature light pink · brand flooded pink · ink · quiet sunken grey. */
  variant?: "default" | "feature" | "brand" | "ink" | "quiet" | undefined;
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
      true: "cursor-pointer transition duration-base ease-out hover:lift hover:shadow-3",
    },
  },
  defaultVariants: { variant: "default", padding: "md", isInteractive: false },
});

/** Content container in the brand's five surface skins. Never gets a coloured left border. */
export function Card({
  variant = "default",
  padding,
  isInteractive,
  asChild = false,
  className,
  ...props
}: CardProps) {
  const Component: ElementType = asChild ? Slot.Root : "div";
  return (
    <Component
      data-surface={SURFACE[variant]}
      className={card({ variant, padding, isInteractive, className })}
      {...props}
    />
  );
}
