import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { Icon } from "../icon/icon";
import { Spinner } from "../spinner/spinner";

const button = componentVariants({
  base: [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-6 whitespace-nowrap",
    "font-display font-bold tracking-subtitle1",
    "transition-[background-color,box-shadow,transform] duration-(--duration-fast) ease-out",
    // Press is scale *and* darkening, together — never one without the other (state contract).
    "not-disabled:active:scale-(--motion-press-scale)",
    // Disabled is a real grey fill, not a reduced opacity.
    "disabled:cursor-not-allowed disabled:bg-(--button-bg-disabled) disabled:text-(--button-fg-disabled)",
    "disabled:border-transparent disabled:shadow-none",
  ],
  variants: {
    variant: {
      /** The signature CTA — a white label on the brand's own pink, darkening one ramp step on hover. */
      primary: "border-0 bg-brand-primary text-text-on-brand shadow-brand",
      secondary:
        "border-2 border-brand-primary bg-surface-card text-text-link not-disabled:hover:bg-brand-tint",
      ghost: "border-0 bg-transparent text-text-link not-disabled:hover:bg-brand-tint",
      inverse: "border-0 bg-surface-inverse text-text-on-inverse shadow-elevation2",
    },
    size: {
      sm: "h-(--button-h-sm) min-w-(--button-h-sm) px-(--button-px-sm) text-body2",
      md: "h-(--button-h-md) min-w-(--button-h-md) px-(--button-px-md) text-body1",
      lg: "h-(--button-h-lg) min-w-(--button-h-lg) px-(--button-px-lg) text-subtitle1",
    },
    /**
     * Set `brand` when the button sits on a flooded pink panel: primary flips to a white pill and
     * secondary to a white outline, because pink-on-pink has no contrast to work with. `secondary`
     * and `ghost` keep a white label on the panel's own pink.
     */
    on: { light: "", brand: "" },
    isFullWidth: { true: "flex w-full", false: "" },
  },
  compoundVariants: [
    {
      on: "brand",
      variant: "primary",
      class: "bg-surface-card text-text-link shadow-elevation2 not-disabled:hover:bg-brand-tint",
    },
    {
      on: "brand",
      variant: "secondary",
      class:
        "border-text-on-brand bg-transparent text-text-on-brand not-disabled:hover:bg-glass-white not-disabled:hover:text-text-link",
    },
    {
      on: "brand",
      variant: "ghost",
      class: "text-text-on-brand not-disabled:hover:bg-glass-white",
    },
    { on: "light", variant: "primary", class: "not-disabled:hover:bg-brand-primary-hover" },
  ],
  defaultVariants: { variant: "primary", size: "md", on: "light", isFullWidth: false },
});

/** The icon size each button size pairs with — 20px in md/lg, 16px in sm. */
const ICON_SIZE = { sm: "sm", md: "md", lg: "md" } as const;

/**
 * `Spinner`'s own scale is larger than `Icon`'s (its `md` is 32px, sized for a standalone loader),
 * so the loading glyph is mapped down to match the label rather than dwarf it.
 */
const SPINNER_SIZE = { sm: "xs", md: "sm", lg: "sm" } as const;

export interface ButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "color">, VariantProps<typeof button> {
  /** Lucide glyph before the label. */
  icon?: LucideIcon | undefined;
  /** Lucide glyph after the label — reserve it for "onward" actions. */
  iconAfter?: LucideIcon | undefined;
  /**
   * Swaps the leading glyph for the brand's pulsing diamond and disables the button. The label
   * stays put so the button does not change width mid-action.
   */
  isLoading?: boolean | undefined;
}

export function Button({
  children,
  className,
  variant,
  size = "md",
  on,
  isFullWidth,
  icon,
  iconAfter,
  isLoading = false,
  disabled = false,
  type = "button",
  ...props
}: ButtonProps) {
  const iconSize = ICON_SIZE[size];
  return (
    <button
      className={button({ variant, size, on, isFullWidth, className })}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? (
        <Spinner size={SPINNER_SIZE[size]} tone="current" />
      ) : icon ? (
        <Icon icon={icon} size={iconSize} />
      ) : null}
      {children}
      {iconAfter ? <Icon icon={iconAfter} size={iconSize} /> : null}
    </button>
  );
}
