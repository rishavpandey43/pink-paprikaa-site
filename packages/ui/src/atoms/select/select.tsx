"use client";

import type { LucideIcon } from "lucide-react";
import type { AriaAttributes } from "react";

import {
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  Lock,
  TriangleAlert,
} from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { Icon } from "../icon/icon";

const select = componentVariants({
  slots: {
    trigger: [
      "group flex w-full min-w-0 items-center gap-2.5 rounded-3 outline-none",
      "border border-(--field-border-default) bg-(--field-bg-default) text-(--field-fg-default)",
      "font-body transition-[border-color,box-shadow,background-color]",
      "duration-(--duration-fast) ease-out",
      "focus-visible:border-2 focus-visible:border-(--field-border-focus)",
      "focus-visible:shadow-focus-ring",
      "data-[placeholder]:text-(--field-fg-placeholder)",
    ],
    value: "min-w-0 flex-1 truncate text-left",
    leadingIcon: "text-text-subtle group-focus-visible:text-text-brand",
    content: [
      "z-50 overflow-hidden rounded-3 border border-border-subtle bg-surface-card",
      "shadow-elevation3",
    ],
    viewport: "max-h-72 p-1",
    item: [
      "relative flex cursor-pointer items-center gap-2 rounded-2 py-2 pr-8 pl-3",
      "font-body text-body2 text-text-body outline-none select-none",
      "data-[highlighted]:bg-brand-tint data-[highlighted]:text-text-link",
      "data-[state=checked]:font-medium",
      "data-[disabled]:cursor-not-allowed data-[disabled]:text-text-subtle",
    ],
    itemIndicator: "absolute right-3 text-text-brand",
    scrollButton: "flex h-6 items-center justify-center text-text-subtle",
  },
  variants: {
    /** 40 / 48 / 56px — the same fixed heights as `Input`, so the two line up in a form. */
    size: {
      sm: { trigger: "h-10 px-3 text-body2" },
      md: { trigger: "h-(--field-h) px-3.5 text-body1" },
      lg: { trigger: "h-14 px-4 text-body1" },
    },
    /** Border colour only — the message that explains it belongs to the `Field` molecule. */
    status: {
      default: {},
      error: {
        trigger:
          "border-2 border-(--field-border-error) focus-visible:border-(--field-border-error)",
        leadingIcon: "text-status-danger group-focus-visible:text-status-danger",
      },
      success: {
        trigger:
          "border-2 border-(--field-border-success) focus-visible:border-(--field-border-success)",
        leadingIcon: "text-status-success group-focus-visible:text-status-success",
      },
      warning: {
        trigger:
          "border-2 border-(--field-border-warning) focus-visible:border-(--field-border-warning)",
        leadingIcon: "text-status-warning group-focus-visible:text-status-warning",
      },
    },
    isDisabled: {
      true: {
        trigger: [
          "cursor-not-allowed border border-border-subtle bg-(--field-bg-disabled)",
          "text-(--field-fg-disabled)",
        ],
        leadingIcon: "text-(--field-fg-disabled)",
      },
      false: {},
    },
    isReadOnly: { true: { trigger: "cursor-default bg-(--field-bg-readonly)" }, false: {} },
  },
  defaultVariants: { size: "md", status: "default", isDisabled: false, isReadOnly: false },
});

/** The glyph each status hangs where the chevron normally sits. */
const STATUS_ICON = {
  default: undefined,
  error: CircleAlert,
  success: CircleCheck,
  warning: TriangleAlert,
} as const;

const STATUS_ICON_TONE = {
  default: "text-text-subtle",
  error: "text-status-danger",
  success: "text-status-success",
  warning: "text-status-warning",
} as const;

/** A choice in the list. Pass a bare string when the value and the label are the same word. */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

type SelectVariants = Omit<VariantProps<typeof select>, "isDisabled" | "isReadOnly">;

export interface SelectProps
  extends
    Omit<SelectPrimitive.SelectProps, "children">,
    Pick<AriaAttributes, "aria-label" | "aria-labelledby">,
    SelectVariants {
  /** The list. Strings become their own labels; objects can carry a different label or disable a row. */
  options?: (SelectOption | string)[] | undefined;
  /** What the trigger reads before anything is chosen. */
  placeholder?: string | undefined;
  /** Lucide glyph pinned to the leading edge of the trigger. */
  icon?: LucideIcon | undefined;
  /** Locked but readable — sunken fill and a lock glyph, and the list will not open. */
  isReadOnly?: boolean | undefined;
  /** Merged onto the trigger, so a caller can widen or re-space the closed control. */
  className?: string | undefined;
  /** Merged onto the popover, for a wider or shorter list. */
  contentClassName?: string | undefined;
  /** Id of the trigger — what a `Field` label points its `htmlFor` at. */
  id?: string | undefined;
}

/** Strings and `{ value, label }` pairs both land here, so the render loop stays one shape. */
function toOption(option: SelectOption | string): SelectOption {
  return typeof option === "string" ? { value: option, label: option } : option;
}

export function Select({
  options = [],
  placeholder = "Choose one",
  icon,
  size = "md",
  status = "default",
  disabled = false,
  isReadOnly = false,
  className,
  contentClassName,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: SelectProps) {
  const slots = select({ size, status, isDisabled: disabled, isReadOnly });
  const statusIcon = STATUS_ICON[status];
  const iconSize = size === "sm" ? "sm" : "md";

  return (
    <SelectPrimitive.Root disabled={disabled || isReadOnly} {...props}>
      <SelectPrimitive.Trigger
        aria-invalid={status === "error" || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={slots.trigger({ class: className })}
        id={id}
      >
        {icon ? <Icon className={slots.leadingIcon()} icon={icon} size={iconSize} /> : null}
        <SelectPrimitive.Value className={slots.value()} placeholder={placeholder} />
        <SelectPrimitive.Icon className="flex shrink-0 items-center">
          {isReadOnly && !statusIcon ? (
            <Icon className="text-text-subtle" icon={Lock} size="sm" />
          ) : (
            <Icon
              className={STATUS_ICON_TONE[status]}
              icon={statusIcon ?? ChevronDown}
              size={iconSize}
            />
          )}
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={slots.content({ class: contentClassName })}
          position="popper"
          sideOffset={6}
        >
          <SelectPrimitive.ScrollUpButton className={slots.scrollButton()}>
            <Icon icon={ChevronUp} size="sm" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className={slots.viewport()}>
            {options.map(toOption).map((option) => (
              <SelectPrimitive.Item
                className={slots.item()}
                disabled={option.disabled ?? false}
                key={option.value}
                value={option.value}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className={slots.itemIndicator()}>
                  <Icon icon={Check} size="sm" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className={slots.scrollButton()}>
            <Icon icon={ChevronDown} size="sm" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
