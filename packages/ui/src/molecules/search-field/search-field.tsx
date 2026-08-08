"use client";

import type { ComponentPropsWithoutRef } from "react";

import { Search, X } from "lucide-react";
import { useId } from "react";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { Icon } from "../../atoms/icon/icon";
import { Spinner } from "../../atoms/spinner/spinner";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import {
  FIELD_STATUS_ICON,
  FIELD_STATUS_TONE,
  FieldMessage,
  type FieldStatus,
} from "../field/field";

const searchField = componentVariants({
  slots: {
    root: "grid min-w-0 gap-1-5",
    // `group` so the search glass can pick up the brand colour on focus without any JS.
    control: [
      "group flex min-w-0 items-center gap-2.5 rounded-6",
      "border border-(--field-border-default) bg-(--field-bg-default)",
      "transition-[background-color,border-color,box-shadow] duration-(--duration-fast) ease-out",
      "focus-within:border-2 focus-within:border-(--field-border-focus) focus-within:shadow-focus-ring",
    ],
    input: [
      "min-w-0 flex-1 border-0 bg-transparent p-0 font-body text-(--field-fg-default) outline-none",
      "placeholder:text-(--field-fg-placeholder)",
      "disabled:cursor-not-allowed disabled:text-(--field-fg-disabled)",
    ],
    leadingIcon: "text-text-subtle group-focus-within:text-text-brand",
    // The message lines up with the placeholder rather than the pill's outer edge.
    message: "px-4",
  },
  variants: {
    /** 40 / 48px — fixed heights, so the pill never wraps in a filter row. */
    size: {
      sm: { control: "h-10 px-3.5", input: "text-body2" },
      md: { control: "h-(--field-h) px-4", input: "text-body1" },
    },
    /**
     * The shared form-status system. A message status raises the border to 2px and tints the
     * leading glass; the mode statuses change what the control accepts instead.
     */
    status: {
      default: {},
      error: {
        control:
          "border-2 border-(--field-border-error) focus-within:border-(--field-border-error)",
        leadingIcon: "text-status-danger group-focus-within:text-status-danger",
      },
      success: {
        control:
          "border-2 border-(--field-border-success) focus-within:border-(--field-border-success)",
        leadingIcon: "text-status-success group-focus-within:text-status-success",
      },
      warning: {
        control:
          "border-2 border-(--field-border-warning) focus-within:border-(--field-border-warning)",
        leadingIcon: "text-status-warning group-focus-within:text-status-warning",
      },
      // A real grey fill, never a reduced opacity, and it wins over every message status.
      disabled: {
        control: [
          "cursor-not-allowed border border-border-subtle bg-(--field-bg-disabled)",
          "focus-within:border focus-within:border-border-subtle focus-within:shadow-none",
        ],
        leadingIcon: "text-(--field-fg-disabled) group-focus-within:text-(--field-fg-disabled)",
      },
      readOnly: { control: "bg-(--field-bg-readonly)" },
      loading: {},
    },
  },
  defaultVariants: { size: "md", status: "default" },
});

/** The statuses that hang a glyph on the trailing edge. `loading` shows the diamond instead. */
const TRAILING_GLYPH_STATUSES = new Set<FieldStatus>(["error", "success", "warning", "readOnly"]);

export interface SearchFieldProps
  extends
    Omit<ComponentPropsWithoutRef<"input">, "size" | "type" | "value">,
    Omit<VariantProps<typeof searchField>, "status"> {
  /** The current query. Pass it (controlled) — the clear button only appears when there is one. */
  value?: string | undefined;
  /**
   * The shared form status. `disabled` and `readOnly` drive the control's own attributes and
   * `loading` hangs the brand's pulsing diamond on the trailing edge.
   */
  status?: FieldStatus | undefined;
  /** The sentence explaining a non-default status. It replaces the hint. */
  message?: string | undefined;
  /** Neutral helper text under the pill — "34 dishes match", say. */
  hint?: string | undefined;
  /** Accessible name. There is no visible label, so this is the only name the field gets. */
  label?: string | undefined;
  /** Shows the clear button once there is a query. Omit it and the button never appears. */
  onClear?: (() => void) | undefined;
  /** Accessible name for the clear button. */
  clearLabel?: string | undefined;
}

/**
 * Menu search — the pill-shaped sibling of `Input`, which is 10px-cornered. Always full width in
 * its container, and the placeholder names real dishes rather than saying "Search".
 */
export function SearchField({
  className,
  size = "md",
  status = "default",
  value,
  message,
  hint,
  label = "Search the menu",
  placeholder = "Search chai, paneer, kulfi",
  onClear,
  clearLabel = "Clear Search",
  id,
  disabled = false,
  readOnly = false,
  ...props
}: SearchFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-description`;

  const isDisabled = disabled || status === "disabled";
  const isReadOnly = readOnly || status === "readOnly";
  const isLoading = status === "loading";
  const hasQuery = value !== undefined && value !== "";
  const canClear = onClear !== undefined && hasQuery && !isLoading && !isDisabled && !isReadOnly;
  const hasDescription =
    (message !== undefined && message !== "") || (hint !== undefined && hint !== "");

  const slots = searchField({ size, status });
  const iconSize = size === "sm" ? "sm" : "md";
  const trailingGlyph = TRAILING_GLYPH_STATUSES.has(status) ? FIELD_STATUS_ICON[status] : undefined;

  return (
    <div className={slots.root({ class: className })}>
      <div className={slots.control()}>
        <Icon className={slots.leadingIcon()} icon={Search} size={iconSize} />
        <input
          aria-describedby={hasDescription ? messageId : undefined}
          aria-invalid={status === "error" || undefined}
          aria-label={label}
          className={slots.input()}
          disabled={isDisabled}
          id={controlId}
          placeholder={placeholder}
          readOnly={isReadOnly}
          type="search"
          value={value}
          {...props}
        />
        {canClear ? (
          <IconButton
            className="min-h-10 min-w-10"
            icon={X}
            label={clearLabel}
            onClick={onClear}
            size="sm"
          />
        ) : null}
        {isLoading ? <Spinner size={iconSize} /> : null}
        {trailingGlyph ? (
          <Icon className={FIELD_STATUS_TONE[status]} icon={trailingGlyph} size={iconSize} />
        ) : null}
      </div>
      <FieldMessage
        className={slots.message()}
        hint={hint}
        id={messageId}
        message={message}
        status={status}
      />
    </div>
  );
}
