import type { ElementType, ReactElement } from "react";

import { Slot } from "radix-ui";

import type { BaseProps } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { controlStates } from "../../lib/control-states";
import { withSx } from "../../lib/sx";
import { Icon, type IconComponent } from "../icon/icon";

export interface IconButtonProps extends Omit<BaseProps<"button">, "children" | "aria-label"> {
  icon: IconComponent;
  /** The accessible name — required: an icon-only control has no other (spec §5.5). */
  label: string;
  /** ghost (default) · primary · secondary · glass (over photography). */
  variant?: "primary" | "secondary" | "ghost" | "glass" | undefined;
  /** Drawn at 32 / 40 / 48px; sm and md keep a 44px touch target. */
  size?: "sm" | "md" | "lg" | undefined;
  /** Cart-style count bubble, read out with the label ("Your order (3)"). Hidden at 0. */
  count?: number | undefined;
  /** Render as the single child element (e.g. `<Link href="/cart" />`); the glyph replaces its content. */
  asChild?: boolean | undefined;
  /** Only with `asChild`: the element to render as. */
  children?: ReactElement | undefined;
}

const iconButton = componentVariants({
  slots: {
    root: [
      controlStates(),
      "disabled:bg-ink-200 aria-disabled:bg-ink-200",
      "relative inline-flex shrink-0 items-center justify-center rounded-pill active:press-scale",
    ],
    count:
      "pointer-events-none absolute -top-0.5 -right-0.5 grid h-icon-button-count min-w-icon-button-count place-items-center rounded-pill bg-pink-500 px-1.25 font-display text-icon-button-count text-ink-000",
  },
  variants: {
    variant: {
      // Primary shares Button's surface-aware primary skin: white on a pink field.
      primary: {
        root: "bg-button-primary-bg text-button-primary-fg hover:bg-button-primary-bg-hover active:bg-button-primary-bg-active",
      },
      secondary: { root: "border border-ink-300 bg-ink-000 text-pink-600 hover:bg-pink-50" },
      ghost: { root: "bg-transparent text-icon-button-ghost-fg hover:bg-button-hover-tint" },
      glass: { root: "bg-surface-glass text-ink-900 backdrop-blur-glass" },
    },
    size: {
      // A transparent ::before pads the drawn circle out to the 44px touch target.
      sm: { root: "size-icon-button-sm before:absolute before:-inset-1.5" },
      md: { root: "size-icon-button-md before:absolute before:-inset-0.5" },
      lg: { root: "size-icon-button-lg" },
    },
  },
  defaultVariants: { variant: "ghost", size: "md" },
});

/** Circular, icon-only button for toolbars, card overlays and app headers. */
export function IconButton({
  icon,
  label,
  variant,
  size = "md",
  count,
  asChild = false,
  disabled = false,
  type = "button",
  sx,
  className,
  children,
  ...props
}: IconButtonProps) {
  const slots = iconButton({ variant, size });
  const Component: ElementType = asChild ? Slot.Root : "button";
  const hasCount = count !== undefined && count > 0;
  const state = asChild ? { "aria-disabled": disabled || undefined } : { type, disabled };
  return (
    <Component
      className={slots.root({ className: withSx(sx, className) })}
      aria-label={hasCount ? `${label} (${String(count)})` : label}
      {...state}
      {...props}
    >
      <Slot.Slottable child={children}>{() => <Icon icon={icon} size={size} />}</Slot.Slottable>
      {hasCount ? (
        <span aria-hidden className={slots.count()}>
          {String(count)}
        </span>
      ) : null}
    </Component>
  );
}
