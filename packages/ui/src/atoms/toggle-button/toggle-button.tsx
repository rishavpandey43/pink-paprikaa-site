"use client";

import { Toggle as RadixToggle, ToggleGroup as RadixToggleGroup } from "radix-ui";
import { use } from "react";

import type { BasePropsWithColor, SizeProp } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { isShown } from "../../lib/is-shown";
import { withSx } from "../../lib/sx";
import { ToggleButtonGroupContext } from "../../lib/toggle-button-group-context";
import { Icon, type IconComponent } from "../icon/icon";

export interface ToggleButtonProps extends Omit<BasePropsWithColor<"button">, "value"> {
  /** Identifies the button inside a ToggleButtonGroup, as in MUI. Required. */
  value: string;
  /** Standalone use: the pressed state (`aria-pressed`). Inside a group the group's value decides. */
  selected?: boolean | undefined;
  /** Standalone use: the starting pressed state when uncontrolled. */
  defaultSelected?: boolean | undefined;
  /** Standalone use: called with the next pressed state. */
  onSelectedChange?: ((selected: boolean) => void) | undefined;
  /**
   * Glyph before the label. An icon-only button (an icon and no children) has no text, so it
   * MUST be given an `aria-label`.
   */
  icon?: IconComponent | undefined;
  /** MUI small / medium / large. Inside a group, falls back to the group's. = "md" */
  size?: SizeProp | undefined;
  /** MUI standard / primary → neutral / brand. Inside a group, falls back to the group's. = "brand" */
  color?: "brand" | "neutral" | undefined;
  isFullWidth?: boolean | undefined;
}

/**
 * The ToggleButton's classes. The selected look reads Radix's `data-state="on"`, which both the
 * standalone `Toggle` and a group's `Item` set; it is gated on `not-disabled` so a disabled
 * button keeps its grey look. Corners and shared borders inside a group come from the group.
 */
export const toggleButtonVariants = componentVariants({
  slots: {
    root: [
      "relative inline-flex max-w-full shrink-0 items-center justify-center gap-2 rounded-md border border-border-default bg-surface-card font-display whitespace-nowrap text-text-body transition-control",
      "not-disabled:hover:bg-surface-sunken disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-400",
      "data-[state=on]:z-raised",
    ],
    label: "min-w-0 truncate",
  },
  variants: {
    size: {
      sm: { root: "h-toggle-button-h-sm min-w-toggle-button-h-sm px-3 text-button-sm" },
      md: { root: "h-toggle-button-h-md min-w-toggle-button-h-md px-4 text-button-md" },
      lg: { root: "h-toggle-button-h-lg min-w-toggle-button-h-lg px-5 text-button-lg" },
    },
    color: {
      brand: {
        root: "not-disabled:data-[state=on]:border-border-brand not-disabled:data-[state=on]:bg-surface-brand-soft not-disabled:data-[state=on]:text-text-brand",
      },
      neutral: {
        root: "not-disabled:data-[state=on]:bg-surface-sunken not-disabled:data-[state=on]:text-text-heading",
      },
    },
    isIconOnly: { true: { root: "px-0" } },
    isFullWidth: { true: { root: "flex w-full" } },
    // Inside a group the buttons share the row (or column) equally.
    isShared: { true: { root: "flex-1" } },
  },
  defaultVariants: { size: "md", color: "brand", isIconOnly: false, isFullWidth: false },
});

const ICON_SIZE = { sm: "sm", md: "md", lg: "md" } as const;

/**
 * One pressable toggle — MUI `<ToggleButton>`. Standalone it is a Radix `Toggle` with
 * `aria-pressed`; inside a `ToggleButtonGroup` it is a `ToggleGroup.Item` and the group owns the
 * selection by `value`.
 */
export function ToggleButton({
  value,
  selected,
  defaultSelected,
  onSelectedChange,
  icon,
  size,
  color,
  isFullWidth,
  disabled = false,
  type = "button",
  sx,
  className,
  children,
  ...props
}: ToggleButtonProps) {
  const group = use(ToggleButtonGroupContext);
  const resolvedSize = size ?? group?.size ?? "md";
  const hasLabel = isShown(children);
  const slots = toggleButtonVariants({
    size: resolvedSize,
    color: color ?? group?.color ?? "brand",
    isIconOnly: icon !== undefined && !hasLabel,
    isFullWidth,
    isShared: group?.isFullWidth ?? false,
  });
  const content = (
    <>
      {icon === undefined ? null : <Icon icon={icon} size={ICON_SIZE[resolvedSize]} />}
      {hasLabel ? <span className={slots.label()}>{children}</span> : null}
    </>
  );
  const rootProps = {
    ...props,
    type,
    disabled,
    className: slots.root({ className: withSx(sx, className) }),
  };
  if (group) {
    return (
      <RadixToggleGroup.Item value={value} {...rootProps}>
        {content}
      </RadixToggleGroup.Item>
    );
  }
  return (
    <RadixToggle.Root
      {...(selected === undefined ? {} : { pressed: selected })}
      {...(defaultSelected === undefined ? {} : { defaultPressed: defaultSelected })}
      {...(onSelectedChange === undefined ? {} : { onPressedChange: onSelectedChange })}
      {...rootProps}
    >
      {content}
    </RadixToggle.Root>
  );
}
