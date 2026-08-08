import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const card = componentVariants({
  base: [
    "overflow-hidden",
    "transition-[box-shadow,transform] duration-(--duration-base) ease-out",
  ],
  variants: {
    /** The five surface skins. A card never gets a coloured left border. */
    variant: {
      default: "rounded-4 border border-border-subtle bg-surface-card shadow-elevation1",
      feature: "rounded-5 border-0 bg-surface-brand-soft",
      brand: "rounded-5 border-0 bg-surface-brand text-text-on-brand shadow-brand",
      ink: "rounded-5 border-0 bg-surface-inverse text-text-on-inverse",
      quiet: "rounded-4 border-0 bg-surface-sunken",
    },
    /** Inner padding. `none` is the media card — an image sits flush to the corners. */
    padding: { none: "p-0", sm: "p-4", md: "p-5", lg: "p-7" },
    /**
     * Adds the −2px hover lift to `shadow-elevation3`. Styling only: the card must contain a real
     * link or button that stretches over it — never hang a click handler on the card itself, or
     * the target is invisible to the keyboard.
     */
    isInteractive: {
      true: "cursor-pointer hover:translate-y-(--motion-lift-y) hover:shadow-elevation3",
      false: "",
    },
  },
  defaultVariants: { variant: "default", padding: "md", isInteractive: false },
});

export interface CardProps extends ComponentPropsWithoutRef<"div">, VariantProps<typeof card> {}

export function Card({
  children,
  className,
  isInteractive,
  padding,
  variant,
  ...props
}: CardProps) {
  return (
    <div className={card({ isInteractive, padding, variant, className })} {...props}>
      {children}
    </div>
  );
}
