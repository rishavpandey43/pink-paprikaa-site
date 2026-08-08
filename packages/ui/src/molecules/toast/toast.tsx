"use client";

import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Check, Info, TriangleAlert } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const toast = componentVariants({
  slots: {
    root: [
      "inline-flex max-w-full items-center gap-3 rounded-6 px-4 py-3 shadow-elevation3",
      // Raw type classes rather than the `Text` atom: the fill sets one ink for the whole pill and
      // every part inherits it, whereas `Text` always emits a tone colour of its own.
      "font-body font-medium text-body2 leading-body2",
      // Entrances are a fade *and* a small rise, never opacity alone.
      "animate-pp-rise",
    ],
    message: "min-w-0",
    action: [
      "-my-3 inline-flex shrink-0 items-center rounded-6 border-0 bg-transparent px-2 text-current",
      "min-h-(--layout-hit-min) cursor-pointer",
      "font-display font-bold text-overline uppercase leading-overline tracking-overline",
      "transition-[background-color,transform] duration-(--duration-instant) ease-out",
      "hover:bg-glass-white active:scale-(--motion-press-scale)",
    ],
  },
  variants: {
    /** `brand` is the pink flood with white ink — the brand's signature pairing. */
    tone: {
      brand: { root: "bg-brand-primary text-text-on-brand" },
      ink: { root: "bg-surface-inverse text-text-on-inverse" },
      success: { root: "bg-status-success text-text-on-inverse" },
      danger: { root: "bg-status-danger text-text-on-inverse" },
    },
    /**
     * The single overshoot. `animate-pp-rise` carries the fade and the 10px travel either way; this
     * only swaps the curve, so the pill still enters rather than blinking.
     */
    isPopping: { true: { root: "[animation-timing-function:var(--ease-pop)]" }, false: {} },
  },
  defaultVariants: { tone: "ink", isPopping: false },
});

/** The glyph each tone opens with when the caller does not name one. */
const TONE_ICON = {
  brand: Check,
  ink: Info,
  success: Check,
  danger: TriangleAlert,
} as const;

export interface ToastProps
  extends Omit<ComponentPropsWithoutRef<"div">, "color">, VariantProps<typeof toast> {
  /** One short sentence, sentence case, no exclamation mark — "Added to your order." */
  children?: ReactNode | undefined;
  /** Override the tone's glyph. A Lucide component, imported by name. */
  icon?: LucideIcon | undefined;
  /** The inline action's label, Title Case — it is set in caps by the component, not by the copy. */
  action?: string | undefined;
  /** Runs when the action is pressed. Without it the action label is not rendered. */
  onAction?: (() => void) | undefined;
}

/**
 * The transient pill confirmation that sits bottom-centre, above the tab bar. No dismiss and no
 * more than one short sentence; anything the guest may want to reverse belongs in a `Snackbar`.
 */
export function Toast({
  className,
  children,
  tone,
  icon,
  isPopping,
  action,
  onAction,
  ...props
}: ToastProps) {
  const slots = toast({ tone, isPopping });
  const Glyph = icon ?? TONE_ICON[tone ?? "ink"];
  // Severity picks the live region: a failure interrupts, a confirmation waits its turn.
  const role = tone === "danger" ? "alert" : "status";

  return (
    <div className={slots.root({ className })} role={role} {...props}>
      <Icon icon={Glyph} size="md" />
      <span className={slots.message()}>{children}</span>
      {action === undefined || onAction === undefined ? null : (
        <button className={slots.action()} onClick={onAction} type="button">
          {action}
        </button>
      )}
    </div>
  );
}
