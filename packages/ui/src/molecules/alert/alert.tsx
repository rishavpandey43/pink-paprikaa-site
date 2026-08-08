"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { CircleAlert, CircleCheck, Info, Megaphone, TriangleAlert, X } from "lucide-react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { Icon } from "../../atoms/icon/icon";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const alert = componentVariants({
  slots: {
    // A full 1px border, never a coloured left edge only — the soft fill and the border are one
    // shape, so the block still reads as a block when the fill is nearly white.
    root: "flex items-start gap-3 rounded-3 border px-4 py-3.5",
    /** Nudged down a hair so the glyph sits on the title's cap height, not its line box. */
    glyph: "mt-0.5",
    content: "min-w-0 flex-1",
    // Raw type classes rather than the `Text` atom on purpose: the alert sets its ink once on the
    // root per tone and every part inherits it, whereas `Text` always emits a tone colour of its
    // own and would silently overwrite it.
    title: "font-display font-bold text-subtitle2 leading-subtitle2",
    message: "font-body text-body2 leading-body2 text-pretty",
    action: "mt-2.5",
    /** Pulls the 44px hit target back into the padding so the row keeps its 14px rhythm. */
    dismiss: "-my-2 -mr-2 shrink-0",
  },
  variants: {
    tone: {
      info: {
        root: "border-status-info bg-status-info-soft text-text-heading",
        glyph: "text-status-info",
      },
      success: {
        root: "border-status-success bg-status-success-soft text-text-heading",
        glyph: "text-status-success",
      },
      warning: {
        // The glyph takes tandoor rather than the turmeric border: turmeric on its own soft ground
        // is barely visible, and a warning mark that cannot be seen is not a warning.
        root: "border-status-warning bg-status-warning-soft text-text-heading",
        glyph: "text-tandoor",
      },
      danger: {
        root: "border-status-danger bg-status-danger-soft text-text-heading",
        glyph: "text-status-danger",
      },
      brand: {
        root: "border-brand-primary bg-brand-soft text-pink-800",
        glyph: "text-brand-primary",
      },
    },
    /** Only opens the gap under a title — a bare one-liner sits flush against the glyph. */
    hasTitle: { true: { message: "mt-0.5" }, false: {} },
  },
  defaultVariants: { tone: "info", hasTitle: false },
});

/** The glyph each tone speaks with. It is not overridable — the tone *is* the mark. */
const TONE_ICON = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
  brand: Megaphone,
} as const;

export interface AlertProps
  extends
    Omit<ComponentPropsWithoutRef<"div">, "color" | "title">,
    Omit<VariantProps<typeof alert>, "hasTitle"> {
  /**
   * The headline, sentence case and no full stop — "Kitchen is busy". Leave it off for a one-line
   * notice that needs no heading.
   */
  title?: string | undefined;
  /** The message itself. One or two plain sentences that say what happens next. */
  children?: ReactNode | undefined;
  /** A single control under the message — usually a small ghost `Button`. Never two. */
  action?: ReactNode | undefined;
  /**
   * Pass a handler to show the dismiss control. Omit it for a notice the guest must not be able to
   * close, such as a payment failure.
   */
  onDismiss?: (() => void) | undefined;
}

/**
 * A persistent inline message — kitchen delays, a closed outlet, a card that did not go through.
 * It stays until the page changes; for a transient confirmation reach for `Toast` or `Snackbar`.
 */
export function Alert({
  className,
  tone,
  title,
  children,
  action,
  onDismiss,
  ...props
}: AlertProps) {
  const slots = alert({ tone, hasTitle: title !== undefined });
  const Glyph = TONE_ICON[tone ?? "info"];

  return (
    <div className={slots.root({ className })} role="status" {...props}>
      <Icon className={slots.glyph()} icon={Glyph} size="md" />
      <div className={slots.content()}>
        {title === undefined ? null : <p className={slots.title()}>{title}</p>}
        {children === undefined ? null : <div className={slots.message()}>{children}</div>}
        {action === undefined ? null : <div className={slots.action()}>{action}</div>}
      </div>
      {onDismiss === undefined ? null : (
        <IconButton
          className={slots.dismiss()}
          icon={X}
          label="Dismiss"
          onClick={onDismiss}
          size="sm"
          variant="ghost"
        />
      )}
    </div>
  );
}
