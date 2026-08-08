"use client";

import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Check, Info, TriangleAlert, X } from "lucide-react";
import { useEffect } from "react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { Icon } from "../../atoms/icon/icon";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const snackbar = componentVariants({
  slots: {
    /**
     * The anchor spans the gutter rather than centring with a transform: `animate-pp-rise` already
     * owns `transform`, and a `-translate-x-1/2` on the same element would be overwritten mid-entrance.
     */
    root: "absolute z-50 flex inset-x-6",
    bar: [
      "flex w-full max-w-105 items-center gap-3 rounded-3 py-3 pr-3.5 pl-4 shadow-elevation3",
      // Raw type classes rather than the `Text` atom: the fill sets one ink for the whole bar and
      // every part inherits it, whereas `Text` always emits a tone colour of its own.
      "font-body font-medium text-body2 leading-body2",
      "animate-pp-rise",
    ],
    message: "min-w-0 flex-1 text-pretty",
    action: [
      "-my-2 inline-flex shrink-0 items-center rounded-6 border-0 bg-transparent px-2",
      "min-h-(--layout-hit-min) cursor-pointer",
      "font-display font-bold text-overline uppercase leading-overline tracking-overline",
      "transition-[background-color,transform] duration-(--duration-instant) ease-out",
      "hover:bg-glass-white active:scale-(--motion-press-scale)",
    ],
    /** Pulls the 44px hit target back into the bar's padding so it keeps its 13px rhythm. */
    dismiss: "-my-2 -mr-1 shrink-0",
  },
  variants: {
    /** `brand` is the pink flood with white ink — the brand's signature pairing. */
    tone: {
      ink: { bar: "bg-surface-inverse text-text-on-inverse", action: "text-pink-300" },
      brand: { bar: "bg-brand-primary text-text-on-brand", action: "text-current" },
      success: { bar: "bg-status-success text-text-on-inverse", action: "text-current" },
      danger: { bar: "bg-status-danger text-text-on-inverse", action: "text-current" },
    },
    position: {
      "bottom-center": { root: "bottom-6 justify-center" },
      "bottom-left": { root: "bottom-6 justify-start" },
      "bottom-right": { root: "bottom-6 justify-end" },
      "top-center": { root: "top-6 justify-center" },
      "top-right": { root: "top-6 justify-end" },
    },
  },
  defaultVariants: { tone: "ink", position: "bottom-center" },
});

/** The glyph each tone opens with when the caller does not name one. */
const TONE_ICON = {
  ink: Info,
  brand: Check,
  success: Check,
  danger: TriangleAlert,
} as const;

export interface SnackbarProps
  extends Omit<ComponentPropsWithoutRef<"div">, "color">, VariantProps<typeof snackbar> {
  /** Mount it. Kept a prop rather than left to the caller so the auto-hide timer can key off it. */
  isOpen?: boolean | undefined;
  /** One short sentence — "Chilli Paneer removed." */
  children?: ReactNode | undefined;
  /** Override the tone's glyph. A Lucide component, imported by name. */
  icon?: LucideIcon | undefined;
  /** The text action's label, Title Case — the component sets it in caps, the copy does not. */
  action?: string | undefined;
  /** Runs when the action is pressed. Without it the action label is not rendered. */
  onAction?: (() => void) | undefined;
  /** Pass a handler to show the dismiss control and arm the auto-hide. */
  onClose?: (() => void) | undefined;
  /** Auto-hide delay in milliseconds. `0` keeps the bar up; it needs `onClose` either way. */
  duration?: number | undefined;
}

/**
 * The anchored confirmation bar for something already done that may need an escape hatch — a code
 * copied, an item removed, a payment to retry. It is squared, carries a text action and a dismiss,
 * and is never shown at the same time as a `Toast`.
 *
 * It positions itself `absolute`, so the nearest positioned ancestor anchors it: give the wrapper
 * `relative`, or override to `fixed` through `className`.
 */
export function Snackbar({
  className,
  isOpen = true,
  children,
  tone,
  position,
  icon,
  action,
  onAction,
  onClose,
  duration = 3200,
  ...props
}: SnackbarProps) {
  useEffect(() => {
    if (!isOpen || duration <= 0 || onClose === undefined) return undefined;
    const timer = setTimeout(onClose, duration);
    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const slots = snackbar({ tone, position });
  const ground = tone ?? "ink";
  const Glyph = icon ?? TONE_ICON[ground];
  // Severity picks the live region: a failure interrupts, a confirmation waits its turn.
  const role = tone === "danger" ? "alert" : "status";

  return (
    <div className={slots.root({ className })} {...props}>
      <div className={slots.bar()} role={role}>
        <Icon icon={Glyph} size="md" />
        <span className={slots.message()}>{children}</span>
        {action === undefined || onAction === undefined ? null : (
          <button className={slots.action()} onClick={onAction} type="button">
            {action}
          </button>
        )}
        {onClose === undefined ? null : (
          <IconButton
            className={slots.dismiss()}
            icon={X}
            label="Dismiss"
            on="brand"
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        )}
      </div>
    </div>
  );
}
