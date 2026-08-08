import type { LucideIcon } from "lucide-react";
import type { ChangeEventHandler, ComponentPropsWithoutRef, ReactNode } from "react";

import { CircleAlert, CircleCheck, Lock, TriangleAlert } from "lucide-react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { Icon } from "../icon/icon";
import { Spinner } from "../spinner/spinner";

const input = componentVariants({
  slots: {
    // `group` so the leading glyph can pick up the brand colour on focus without any JS.
    root: [
      "group flex min-w-0 items-center gap-2.5 rounded-3",
      "border border-(--field-border-default) bg-(--field-bg-default)",
      "transition-[border-color,box-shadow,background-color] duration-(--duration-fast) ease-out",
      // The field focus treatment: the border thickens to the brand colour and the ring lands
      // under it. The control itself drops the base outline so the two never double up.
      "focus-within:border-2 focus-within:border-(--field-border-focus) focus-within:shadow-focus-ring",
    ],
    control: [
      "min-w-0 flex-1 border-0 bg-transparent p-0 font-body text-(--field-fg-default) outline-none",
      "placeholder:text-(--field-fg-placeholder)",
      "disabled:cursor-not-allowed disabled:text-(--field-fg-disabled)",
    ],
    leadingIcon: "text-text-subtle group-focus-within:text-text-brand",
    suffix: "shrink-0 font-mono text-mono text-text-subtle",
  },
  variants: {
    /** 40 / 48 / 56px — fixed heights, so a field never wraps in a tight row. */
    size: {
      sm: { root: "h-10 px-3", control: "text-body2" },
      md: { root: "h-(--field-h) px-3.5", control: "text-body1" },
      lg: { root: "h-14 px-4", control: "text-body1" },
    },
    /**
     * The border colour and the trailing glyph. The message that explains the status belongs to
     * the `Field` molecule — this control only ever carries the colour.
     */
    status: {
      default: {},
      error: {
        root: "border-2 border-(--field-border-error) focus-within:border-(--field-border-error)",
        leadingIcon: "text-status-danger group-focus-within:text-status-danger",
      },
      success: {
        root: "border-2 border-(--field-border-success) focus-within:border-(--field-border-success)",
        leadingIcon: "text-status-success group-focus-within:text-status-success",
      },
      warning: {
        root: "border-2 border-(--field-border-warning) focus-within:border-(--field-border-warning)",
        leadingIcon: "text-status-warning group-focus-within:text-status-warning",
      },
    },
    isMultiline: {
      true: { root: "h-auto items-start py-3", control: "resize-y" },
      false: {},
    },
    // Disabled is a real grey fill, never a reduced opacity, and it wins over every status.
    isDisabled: {
      true: {
        root: [
          "cursor-not-allowed border border-border-subtle bg-(--field-bg-disabled)",
          "focus-within:border focus-within:border-border-subtle focus-within:shadow-none",
        ],
        leadingIcon: "text-(--field-fg-disabled) group-focus-within:text-(--field-fg-disabled)",
      },
      false: {},
    },
    isReadOnly: { true: { root: "bg-(--field-bg-readonly)" }, false: {} },
  },
  defaultVariants: {
    size: "md",
    status: "default",
    isMultiline: false,
    isDisabled: false,
    isReadOnly: false,
  },
});

/** The glyph each status hangs on the trailing edge. `default` shows nothing. */
const STATUS_ICON = {
  default: undefined,
  error: CircleAlert,
  success: CircleCheck,
  warning: TriangleAlert,
} as const;

const STATUS_ICON_TONE = {
  default: "",
  error: "text-status-danger",
  success: "text-status-success",
  warning: "text-status-warning",
} as const;

type InputVariants = Omit<VariantProps<typeof input>, "isDisabled" | "isReadOnly">;

export interface InputProps
  extends Omit<ComponentPropsWithoutRef<"input">, "size" | "onChange">, InputVariants {
  /** Lucide glyph pinned to the leading edge — a phone, a card, a search glass. */
  icon?: LucideIcon | undefined;
  /** Static trailing text set in Space Mono: a unit, a count, a character budget. */
  suffix?: string | undefined;
  /** Trailing element for an action inside the field — a small ghost `Button`, say. */
  trailing?: ReactNode | undefined;
  /** Swaps the `<input>` for a `<textarea>` that the reader can drag taller. */
  isMultiline?: boolean | undefined;
  /** Visible rows when `isMultiline` is set. */
  rows?: number | undefined;
  /** Hangs the brand's pulsing diamond on the trailing edge while a value is being checked. */
  isLoading?: boolean | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined;
}

export function Input({
  className,
  size = "md",
  status = "default",
  icon,
  suffix,
  trailing,
  isMultiline = false,
  rows = 4,
  isLoading = false,
  disabled = false,
  readOnly = false,
  type = "text",
  ...props
}: InputProps) {
  const slots = input({
    size,
    status,
    isMultiline,
    isDisabled: disabled,
    isReadOnly: readOnly,
  });
  const statusIcon = STATUS_ICON[status];
  const iconSize = size === "sm" ? "sm" : "md";
  const controlProps = {
    "aria-invalid": status === "error" || undefined,
    className: slots.control(),
    disabled,
    readOnly,
    ...props,
  };

  return (
    <div className={slots.root({ class: className })}>
      {icon ? <Icon className={slots.leadingIcon()} icon={icon} size={iconSize} /> : null}
      {isMultiline ? (
        <textarea rows={rows} {...(controlProps as ComponentPropsWithoutRef<"textarea">)} />
      ) : (
        <input type={type} {...controlProps} />
      )}
      {suffix ? <span className={slots.suffix()}>{suffix}</span> : null}
      {isLoading ? <Spinner size={iconSize} /> : null}
      {!isLoading && statusIcon ? (
        <Icon className={STATUS_ICON_TONE[status]} icon={statusIcon} size={iconSize} />
      ) : null}
      {!isLoading && !statusIcon && readOnly ? (
        <Icon className="text-text-subtle" icon={Lock} size="sm" />
      ) : null}
      {trailing}
    </div>
  );
}
