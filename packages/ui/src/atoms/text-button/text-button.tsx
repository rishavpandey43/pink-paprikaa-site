import type { ElementType } from "react";

import { LoaderCircle } from "lucide-react";
import { Slot } from "radix-ui";

import type { BaseProps } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { usePress } from "../../lib/use-press";
import { Icon, type IconComponent } from "../icon/icon";

export interface TextButtonProps extends BaseProps<"button"> {
  /** Ink colour family — brand (default), neutral, or danger. */
  color?: "brand" | "neutral" | "danger" | undefined;
  size?: "sm" | "md" | undefined;
  /** Uppercase, tracked label — toast and snackbar actions. */
  isCaps?: boolean | undefined;
  icon?: IconComponent | undefined;
  iconAfter?: IconComponent | undefined;
  /** Swaps the leading glyph for a spinner, sets `aria-busy` and blocks presses. */
  isLoading?: boolean | undefined;
  /** Render the single child (`<a href>`, `next/link`) with TextButton styling. */
  asChild?: boolean | undefined;
}

/**
 * Text-only action: toast/snackbar CTAs, "Undo", "Edit", "View all". Surface-aware via the
 * nearest `data-surface` (light / brand / ink) — never an `on` prop (R141).
 */
export const textButtonVariants = componentVariants({
  slots: {
    root: [
      "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-pill font-display whitespace-nowrap transition-control",
      "active:press-scale data-[pressed]:press-scale",
      "disabled:cursor-not-allowed disabled:bg-transparent disabled:text-ink-400",
      "aria-disabled:pointer-events-none aria-disabled:bg-transparent aria-disabled:text-ink-400",
      // On flooded brand/ink, every tone goes white with on-color hover/press fills.
      "in-data-[surface=brand]:text-ink-000 in-data-[surface=ink]:text-ink-000",
      "in-data-[surface=brand]:hover:bg-state-hover-on-color in-data-[surface=ink]:hover:bg-state-hover-on-color",
      "in-data-[surface=brand]:active:bg-state-press-on-color in-data-[surface=ink]:active:bg-state-press-on-color",
      "in-data-[surface=brand]:data-[pressed]:bg-state-press-on-color in-data-[surface=ink]:data-[pressed]:bg-state-press-on-color",
      "in-data-[surface=brand]:disabled:opacity-50 in-data-[surface=ink]:disabled:opacity-50",
    ],
    loader: "animate-rotate",
  },
  variants: {
    color: {
      brand: {
        root: [
          "text-text-link hover:bg-state-hover hover:text-text-link-hover hover:underline",
          "active:bg-state-press data-[pressed]:bg-state-press",
        ].join(" "),
      },
      neutral: {
        root: [
          "text-ink-700 hover:bg-state-hover-neutral hover:text-ink-900 hover:underline",
          "active:bg-state-press-neutral data-[pressed]:bg-state-press-neutral",
        ].join(" "),
      },
      danger: {
        root: [
          "text-status-danger hover:bg-status-danger-soft",
          "active:bg-state-press-danger data-[pressed]:bg-state-press-danger",
        ].join(" "),
      },
    },
    size: {
      sm: { root: "h-text-button-h-sm px-2.5 text-button-sm" },
      md: { root: "h-text-button-h-md px-3 text-button-md" },
    },
    isCaps: {
      true: {
        root: "text-overline uppercase no-underline hover:no-underline",
      },
    },
  },
  defaultVariants: { color: "brand", size: "md", isCaps: false },
});

/** Text-only action — looks like a word at rest; tinted pill on hover. */
export function TextButton({
  color,
  size = "md",
  isCaps = false,
  icon,
  iconAfter,
  isLoading = false,
  asChild = false,
  disabled = false,
  type = "button",
  sx,
  className,
  children,
  ...props
}: TextButtonProps) {
  const slots = textButtonVariants({ color, size, isCaps });
  const Component: ElementType = asChild ? Slot.Root : "button";
  const isOff = disabled || isLoading;
  const state = asChild ? { "aria-disabled": isOff || undefined } : { type, disabled: isOff };
  const { pressProps } = usePress({
    disabled: isOff,
    onPointerDown: props.onPointerDown,
    onPointerUp: props.onPointerUp,
    onPointerLeave: props.onPointerLeave,
    onKeyDown: props.onKeyDown,
    onKeyUp: props.onKeyUp,
    onBlur: props.onBlur,
  });
  const leading = isLoading ? LoaderCircle : icon;
  return (
    <Component
      className={slots.root({ className: withSx(sx, className) })}
      aria-busy={isLoading || undefined}
      {...state}
      {...props}
      {...pressProps}
    >
      {leading ? (
        <Icon icon={leading} size="sm" className={isLoading ? slots.loader() : undefined} />
      ) : null}
      <Slot.Slottable child={children}>{(label) => label}</Slot.Slottable>
      {iconAfter ? <Icon icon={iconAfter} size="sm" /> : null}
    </Component>
  );
}
