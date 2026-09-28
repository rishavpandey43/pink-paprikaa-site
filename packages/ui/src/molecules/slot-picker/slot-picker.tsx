import type { ComponentProps, ReactNode } from "react";

import { useId } from "react";

import type { FieldStatus } from "../../lib/field-status";

import { joinIds } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";

const slotPicker = componentVariants({
  slots: {
    // `group/slot-picker` lets the legend mute while the fieldset is disabled (dev parity).
    root: "group/slot-picker m-0 grid min-w-0 gap-2.5 border-0 p-0",
    legend:
      "mb-2.5 p-0 text-body-sm font-medium text-text-body group-disabled/slot-picker:text-text-subtle",
    grid: "grid gap-2.5",
    slot: "grid min-h-hit min-w-0 cursor-pointer place-items-center gap-0.5 rounded-md border border-border-default bg-surface-card px-2.5 py-2 text-center font-display text-body-sm font-bold text-ink-700 transition-colors duration-fast ease-out has-checked:border-2 has-checked:border-border-brand has-checked:bg-surface-page-alt has-checked:text-pink-700 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus has-disabled:cursor-not-allowed has-disabled:bg-surface-sunken has-disabled:text-ink-400",
    input: "sr-only",
    note: "font-body text-slot-picker-note font-regular text-text-subtle",
  },
  variants: {
    status: {
      default: {},
      error: { slot: "border-status-danger" },
      // The design system draws only the error border; dev parity paints all three statuses.
      success: { slot: "border-status-success" },
      warning: { slot: "border-status-warning" },
    },
    isSoldOut: { true: { slot: "line-through" } },
    isLegendHidden: { true: { legend: "sr-only" } },
  },
  defaultVariants: { status: "default", isSoldOut: false, isLegendHidden: false },
});

/** Full literal classes, so Tailwind finds them. `undefined` columns auto-fit instead. */
const COLUMN_CLASS = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
} as const;

export interface SlotOption {
  value: string;
  label: string;
  /** A second line, e.g. "12 min". */
  note?: string | undefined;
  /** Sold out: struck through, not hidden. */
  isDisabled?: boolean | undefined;
}

export interface SlotPickerProps extends Omit<
  ComponentProps<"fieldset">,
  "onChange" | "defaultValue"
> {
  /** The radios' shared name — what a native form posts. */
  name: string;
  legend: ReactNode;
  isLegendHidden?: boolean | undefined;
  slots: SlotOption[];
  /**
   * The picked slot. Controlled use needs `onValueChange`; without a handler `value` is only the
   * starting pick (like `defaultValue`), so React never renders read-only radios.
   */
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Fixed column count; omit to auto-fit at a 96px minimum. */
  columns?: keyof typeof COLUMN_CLASS | undefined;
  status?: FieldStatus | undefined;
  /**
   * The line under the slots: on the default status a neutral hint ("Slots open 30 minutes
   * ahead."), with a status its message and glyph ("Pick a slot to continue.").
   */
  message?: ReactNode;
}

/** Pickup and table-booking time slots: a grid of real radios that reflows at any width. */
export function SlotPicker({
  name,
  legend,
  isLegendHidden = false,
  slots,
  value,
  defaultValue,
  onValueChange,
  columns,
  status = "default",
  message,
  className,
  "aria-describedby": describedBy,
  ...props
}: SlotPickerProps) {
  const baseId = useId();
  const messageId = `${baseId}-message`;
  const isControlled = value !== undefined && onValueChange !== undefined;
  const initialValue = value ?? defaultValue;
  const styles = slotPicker({ status, isLegendHidden });

  return (
    <fieldset
      {...props}
      aria-describedby={joinIds(
        describedBy,
        hasFieldMessage({ status, message }) ? messageId : undefined
      )}
      className={styles.root({ className })}
    >
      <legend className={styles.legend()}>{legend}</legend>
      <div
        className={styles.grid({
          className: columns === undefined ? "grid-cols-slot-picker" : COLUMN_CLASS[columns],
        })}
      >
        {slots.map((slot, index) => {
          const labelId = `${baseId}-slot-${String(index)}`;
          const noteId = `${baseId}-note-${String(index)}`;
          return (
            <label
              key={slot.value}
              data-surface="light"
              className={styles.slot({ isSoldOut: slot.isDisabled === true })}
            >
              <input
                type="radio"
                name={name}
                value={slot.value}
                disabled={slot.isDisabled}
                aria-labelledby={labelId}
                aria-describedby={slot.note === undefined ? undefined : noteId}
                aria-invalid={status === "error" ? true : undefined}
                {...(isControlled
                  ? { checked: value === slot.value }
                  : { defaultChecked: initialValue === slot.value })}
                onChange={
                  onValueChange === undefined
                    ? undefined
                    : (event) => {
                        onValueChange(event.currentTarget.value);
                      }
                }
                className={styles.input()}
              />
              <span id={labelId}>{slot.label}</span>
              {slot.note === undefined ? null : (
                <span id={noteId} className={styles.note()}>
                  {slot.note}
                </span>
              )}
            </label>
          );
        })}
      </div>
      <FieldMessage id={messageId} status={status} message={message} />
    </fieldset>
  );
}
