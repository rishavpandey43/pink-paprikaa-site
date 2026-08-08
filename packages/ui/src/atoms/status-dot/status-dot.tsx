import type { ComponentPropsWithoutRef } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const statusDot = componentVariants({
  slots: {
    root: "inline-flex items-center gap-2",
    /**
     * A rotated square, not a circle — the brand diamond carries all the way down to the smallest
     * mark in the system.
     */
    dot: "inline-block shrink-0 rotate-45 rounded-1",
    label: "font-body font-medium text-body2 text-text-body",
  },
  variants: {
    tone: {
      open: { dot: "bg-status-success" },
      busy: { dot: "bg-status-warning" },
      closed: { dot: "bg-ink-400" },
      live: { dot: "bg-brand-primary" },
      danger: { dot: "bg-status-danger" },
    },
    size: {
      xs: { dot: "size-2" },
      sm: { dot: "size-3" },
      md: { dot: "size-4" },
      lg: { dot: "size-5" },
    },
    /** The brand's throb, reserved for live order states — never for a static open/closed mark. */
    isPulsing: { true: { dot: "animate-pp-pulse" }, false: {} },
  },
  defaultVariants: { tone: "open", size: "md", isPulsing: false },
});

/**
 * What each state is called when no visible label is given, so a bare dot is never silent to
 * assistive tech — colour alone can carry no meaning.
 */
const TONE_LABEL = {
  open: "Open",
  busy: "Busy",
  closed: "Closed",
  live: "Live",
  danger: "Unavailable",
} as const;

export interface StatusDotProps
  extends Omit<ComponentPropsWithoutRef<"span">, "color">, VariantProps<typeof statusDot> {
  /**
   * The visible state text beside the dot — "Open till 11:30pm", "On the tandoor". Omit it and the
   * dot announces its tone's own name instead.
   */
  label?: string | undefined;
}

export function StatusDot({
  className,
  tone = "open",
  size,
  isPulsing,
  label,
  ...props
}: StatusDotProps) {
  const slots = statusDot({ tone, size, isPulsing });
  const hasVisibleLabel = label !== undefined;
  return (
    <span className={slots.root({ className })} {...props}>
      <span
        aria-hidden={hasVisibleLabel}
        aria-label={hasVisibleLabel ? undefined : TONE_LABEL[tone]}
        className={slots.dot()}
        role={hasVisibleLabel ? undefined : "img"}
      />
      {hasVisibleLabel ? <span className={slots.label()}>{label}</span> : null}
    </span>
  );
}
