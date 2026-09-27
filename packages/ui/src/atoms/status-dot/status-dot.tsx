import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { SymbolMark } from "../../lib/symbol-mark";

export interface StatusDotProps extends ComponentProps<"span"> {
  tone?: "open" | "busy" | "closed" | "live" | "danger" | undefined;
  /** Visible state text. Without it the dot is announced by its tone ("Open"). */
  label?: string | undefined;
  /** The expanding pulse — live orders only. Hidden under reduced motion. */
  isPulsing?: boolean | undefined;
  /** sm 14px (default) · md 16px. */
  size?: "sm" | "md" | undefined;
}

/** A bare dot's accessible name: state is never conveyed by colour alone (spec §5.5). */
const TONE_NAME = {
  open: "Open",
  busy: "Busy",
  closed: "Closed",
  live: "Live",
  danger: "Attention",
} as const;

/*
 * The dot sets the tone as `currentColor`; the diamond and the pulse paint `bg-current`, the mark
 * inside is white. The pulse carries no rotate class: `pp-dot-pulse` rotates it in its keyframes.
 */
const statusDot = componentVariants({
  slots: {
    root: "inline-flex items-center gap-2",
    dot: "relative shrink-0",
    pulse: "absolute inset-0 animate-dot-pulse rounded-diamond bg-current motion-reduce:hidden",
    diamond:
      "absolute inset-0 grid rotate-45 place-items-center overflow-hidden rounded-diamond bg-current",
    mark: "size-4/5 -rotate-45 text-ink-000 opacity-66",
    label: "font-body text-status-dot-label text-text-body",
  },
  variants: {
    tone: {
      open: { dot: "text-status-success" },
      busy: { dot: "text-status-warning" },
      closed: { dot: "text-ink-400" },
      live: { dot: "text-pink-500" },
      danger: { dot: "text-status-danger" },
    },
    size: { sm: { dot: "size-status-dot-sm" }, md: { dot: "size-status-dot-md" } },
  },
  defaultVariants: { tone: "open", size: "sm" },
});

/** Outlet open/closed and live-order state: a brand diamond with the mark inside it. */
export function StatusDot({
  tone = "open",
  label,
  isPulsing = false,
  size,
  className,
  ...props
}: StatusDotProps) {
  const slots = statusDot({ tone, size });
  const hasLabel = label !== undefined && label.trim() !== "";
  const bareName = hasLabel ? undefined : { role: "img", "aria-label": TONE_NAME[tone] };
  return (
    <span className={slots.root({ className })} {...bareName} {...props}>
      <span aria-hidden className={slots.dot()}>
        {isPulsing ? <span className={slots.pulse()} /> : null}
        <span className={slots.diamond()}>
          <SymbolMark className={slots.mark()} />
        </span>
      </span>
      {hasLabel ? <span className={slots.label()}>{label}</span> : null}
    </span>
  );
}
