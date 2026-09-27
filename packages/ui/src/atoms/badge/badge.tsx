import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { Icon, type IconComponent } from "../icon/icon";

export interface BadgeProps extends ComponentProps<"span"> {
  tone?: "brand" | "soft" | "ink" | "success" | "warning" | "danger" | "neutral" | undefined;
  /** Optional 12px glyph. */
  icon?: IconComponent | undefined;
}

const badge = componentVariants({
  slots: {
    root: "inline-flex max-w-full shrink-0 items-center gap-1.25 rounded-pill px-2.5 py-1 font-display text-overline whitespace-nowrap uppercase",
    icon: "size-badge-icon",
    label: "min-w-0 truncate",
  },
  variants: {
    tone: {
      // Brand is the one surface-aware skin: white with pink text on a pink field.
      brand: { root: "bg-badge-brand-bg text-badge-brand-fg" },
      soft: { root: "bg-pink-100 text-pink-700" },
      ink: { root: "bg-ink-900 text-ink-000" },
      success: { root: "bg-status-success-soft text-text-success" },
      warning: { root: "bg-status-warning-soft text-text-warning" },
      danger: { root: "bg-status-danger-soft text-text-danger" },
      neutral: { root: "bg-ink-100 text-ink-700" },
    },
  },
  defaultVariants: { tone: "soft" },
});

/** Small uppercase status marker. Reads as a label, never as a button. */
export function Badge({ tone, icon, className, children, ...props }: BadgeProps) {
  const slots = badge({ tone });
  return (
    <span className={slots.root({ className })} {...props}>
      {icon ? <Icon icon={icon} size="xs" className={slots.icon()} /> : null}
      <span className={slots.label()}>{children}</span>
    </span>
  );
}
