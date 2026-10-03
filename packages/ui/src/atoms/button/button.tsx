import type { ElementType } from "react";

import { LoaderCircle } from "lucide-react";
import { Slot } from "radix-ui";

import type { BaseProps } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { controlStates } from "../../lib/control-states";
import { withSx } from "../../lib/sx";
import { Icon, type IconComponent } from "../icon/icon";

export interface ButtonProps extends BaseProps<"button"> {
  /** primary = flooded pink · secondary = pink outline · ghost = text only · inverse = ink. */
  variant?: "primary" | "secondary" | "ghost" | "inverse" | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  /** Glyph before the label — names the action. */
  icon?: IconComponent | undefined;
  /** Glyph after the label — onward motion (arrow-right, arrow-up-right, chevron-down). */
  iconAfter?: IconComponent | undefined;
  isFullWidth?: boolean | undefined;
  /** Swaps the leading glyph for a spinner, sets `aria-busy` and blocks presses. */
  isLoading?: boolean | undefined;
  /** Render the single child (`<a href>`, `next/link`) with Button styling. */
  asChild?: boolean | undefined;
}

/**
 * The Button's classes. Exported so a Radix trigger can look like a Button:
 * `buttonVariants({ variant: "secondary" }).root()`.
 *
 * `primary`, `secondary` and the hover tint paint with surface-aware tokens (`surface/*.json`),
 * so on a pink field primary turns white and secondary a white outline with no prop; ghost and
 * secondary text use the semantic link colour, which flips too. `inverse` is solid ink everywhere.
 */
export const buttonVariants = componentVariants({
  slots: {
    root: [
      controlStates(),
      "inline-flex max-w-full shrink-0 items-center justify-center rounded-pill font-display whitespace-nowrap active:press-scale",
    ],
    label: "min-w-0 truncate",
    loader: "animate-rotate",
  },
  variants: {
    variant: {
      primary: {
        root: "bg-button-primary-bg text-button-primary-fg shadow-button-primary hover:bg-button-primary-bg-hover active:bg-button-primary-bg-active",
      },
      secondary: {
        root: "border-2 border-button-secondary-border bg-button-secondary-bg text-text-link hover:bg-button-hover-tint",
      },
      ghost: { root: "bg-transparent text-text-link hover:bg-button-hover-tint" },
      inverse: { root: "bg-ink-900 text-ink-000 shadow-2" },
    },
    size: {
      sm: { root: "h-button-h-sm min-w-button-h-sm gap-1.5 px-3.5 text-button-sm" },
      md: { root: "h-button-h-md min-w-button-h-md gap-2 px-5 text-button-md" },
      lg: { root: "h-button-h-lg min-w-button-h-lg gap-2 px-7 text-button-lg" },
    },
    isFullWidth: { true: { root: "flex w-full" } },
  },
  defaultVariants: { variant: "primary", size: "md", isFullWidth: false },
});

/** Glyph 16px at sm, 20px at md and lg; the loader 20px, 24px at lg (design system Button.jsx). */
const GLYPH_SIZE = { sm: "sm", md: "md", lg: "md" } as const;
const LOADER_SIZE = { sm: "md", md: "md", lg: "lg" } as const;

/** The brand's action button — pill, Poppins 700, Title Case label. */
export function Button({
  variant,
  size = "md",
  icon,
  iconAfter,
  isFullWidth = false,
  isLoading = false,
  asChild = false,
  disabled = false,
  type = "button",
  sx,
  className,
  children,
  ...props
}: ButtonProps) {
  const slots = buttonVariants({ variant, size, isFullWidth });
  const Component: ElementType = asChild ? Slot.Root : "button";
  // A slotted <a> must not get `type` or `disabled`; it says so with aria-disabled instead.
  const state = asChild
    ? { "aria-disabled": disabled || isLoading || undefined }
    : { type, disabled: disabled || isLoading };
  const leading = isLoading ? LoaderCircle : icon;
  return (
    <Component
      className={slots.root({ className: withSx(sx, className) })}
      aria-busy={isLoading || undefined}
      {...state}
      {...props}
    >
      {leading ? (
        <Icon
          icon={leading}
          size={isLoading ? LOADER_SIZE[size] : GLYPH_SIZE[size]}
          className={isLoading ? slots.loader() : undefined}
        />
      ) : null}
      <Slot.Slottable child={children}>
        {(label) => <span className={slots.label()}>{label}</span>}
      </Slot.Slottable>
      {iconAfter ? <Icon icon={iconAfter} size={GLYPH_SIZE[size]} /> : null}
    </Component>
  );
}
