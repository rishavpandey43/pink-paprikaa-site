import type { ComponentProps, ElementType } from "react";

import { componentVariants } from "../../lib/component-variants";
import { controlStates } from "../../lib/control-states";
import { Icon, type IconComponent } from "../icon/icon";

export interface TagProps extends ComponentProps<"button"> {
  /**
   * Selected tags flood pink (ink on a pink field). The state is only announced on an interactive
   * Tag (`aria-pressed`); a static tag uses it for visual emphasis only.
   */
  isSelected?: boolean | undefined;
  /** 16px leading glyph. */
  icon?: IconComponent | undefined;
  /** Static colourways (the handoff's delivery-zone chips): default · success · brand. */
  tone?: "default" | "success" | "brand" | undefined;
}

/**
 * The Tag's classes. Exported for ChipGroup and FilterBar, which render Radix ToggleGroup items
 * that must look like tags: `tagVariants({ isSelected, isInteractive: true }).root()`.
 */
export const tagVariants = componentVariants({
  slots: {
    root: [
      controlStates(),
      "inline-flex h-tag-h max-w-full shrink-0 items-center gap-1.5 rounded-pill border px-4 font-body text-tag whitespace-nowrap",
    ],
    label: "min-w-0 truncate",
  },
  variants: {
    tone: {
      default: { root: "border-ink-300 bg-ink-000 text-ink-700" },
      // Its own soft fill, so surface-invariant text (`text-text-success` is a soft tint on dark).
      success: { root: "border-status-success bg-status-success-soft text-mint-strong" },
      brand: { root: "border-pink-200 bg-ink-000 text-pink-700" },
    },
    // Declared after `tone`, so a selected tag's fill, border and text replace the tone's.
    isSelected: { true: { root: "border-tag-selected bg-tag-selected text-ink-000" } },
    isInteractive: { true: { root: "cursor-pointer active:press-scale" } },
  },
  compoundVariants: [
    { isInteractive: true, isSelected: false, class: { root: "hover:bg-pink-50" } },
    // Readme §3.8: a pink fill darkens one step on hover (ink-800 on a pink field).
    {
      isInteractive: true,
      isSelected: true,
      class: { root: "hover:border-tag-selected-hover hover:bg-tag-selected-hover" },
    },
  ],
  defaultVariants: { tone: "default", isSelected: false, isInteractive: false },
});

/** Selectable filter pill used across menu category rails; a static chip without `onClick`. */
export function Tag({
  isSelected = false,
  icon,
  tone,
  disabled = false,
  onClick,
  type = "button",
  className,
  children,
  ...props
}: TagProps) {
  const isInteractive = onClick !== undefined;
  const slots = tagVariants({ tone, isSelected, isInteractive });
  const Component: ElementType = isInteractive ? "button" : "span";
  const state = isInteractive
    ? { type, onClick, disabled, "aria-pressed": isSelected }
    : { "aria-disabled": disabled || undefined };
  return (
    <Component className={slots.root({ className })} {...state} {...props}>
      {icon ? <Icon icon={icon} size="sm" /> : null}
      <span className={slots.label()}>{children}</span>
    </Component>
  );
}
