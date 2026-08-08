"use client";

import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { useId } from "react";

import { componentVariants } from "../../lib/component-variants";
import { FieldMessage, type FieldStatus } from "../field/field";

const slotPicker = componentVariants({
  slots: {
    root: "grid min-w-0 gap-2.5",
    label: "font-body font-medium text-body2 text-text-body",
    grid: "grid min-w-0 gap-2.5",
    slot: [
      "grid min-h-(--layout-hit-min) min-w-0 place-items-center gap-0-5 rounded-3 px-2.5 py-2",
      "border border-(--field-border-default) bg-(--field-bg-default) text-text-body",
      "transition-[background-color,border-color,color,transform] duration-(--duration-fast) ease-out",
      "not-disabled:hover:border-brand-primary not-disabled:hover:bg-brand-tint",
      "not-disabled:active:scale-(--motion-press-scale)",
      "not-disabled:active:duration-(--duration-instant)",
      "data-[state=checked]:border-2 data-[state=checked]:border-brand-primary",
      "data-[state=checked]:bg-brand-tint data-[state=checked]:text-text-brand",
      // Disabled is a real grey fill, never a reduced opacity (state contract).
      "disabled:cursor-not-allowed disabled:border-border-subtle",
      "disabled:bg-(--field-bg-disabled) disabled:text-(--field-fg-disabled)",
    ],
    slotLabel: "min-w-0 font-display font-bold text-body2",
    slotNote: "min-w-0 font-body font-normal text-caption text-text-subtle",
  },
  variants: {
    /**
     * The shared form-status system. Only the message statuses change the slots themselves; the
     * mode statuses are carried by the group's `disabled` state and the line underneath.
     */
    status: {
      default: {},
      error: { slot: "border-(--field-border-error)" },
      success: { slot: "border-(--field-border-success)" },
      warning: { slot: "border-(--field-border-warning)" },
      disabled: {},
      readOnly: {},
      loading: {},
    },
    isDisabled: { true: { label: "text-text-subtle" }, false: {} },
  },
  defaultVariants: { status: "default", isDisabled: false },
});

/**
 * Fixed column counts have to be static classes — Tailwind scans source text, so a computed
 * `grid-cols-${n}` would never be generated. `auto` reflows at a 96px minimum on any width.
 */
const COLUMNS = {
  auto: "grid-cols-[repeat(auto-fit,minmax(min(6rem,100%),1fr))]",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
} as const;

export interface Slot {
  /** The value reported when this slot is picked. */
  value: string;
  /** What the reader sees: "7:30pm", "ASAP", "4 guests". */
  label: string;
  /** A quieter second line — "12 min", "2 tables left". */
  note?: string;
  /** Sold out or already past. Struck through and unpickable, never hidden. */
  isDisabled?: boolean;
}

export interface SlotPickerProps extends Omit<
  RadioGroupPrimitive.RadioGroupProps,
  "children" | "orientation"
> {
  /** The choices. A bare string is its own value and label — `"7:30pm"`. */
  slots: (Slot | string)[];
  /** The question above the grid, in sentence case: "Pickup time". */
  label?: string | undefined;
  /** A fixed column count. Omit it and the grid auto-fits at a 96px minimum. */
  columns?: 2 | 3 | 4 | 5 | 6 | undefined;
  /** The shared form status. `disabled` disables every slot as well. */
  status?: FieldStatus | undefined;
  /** The sentence explaining a non-default status. It replaces the hint. */
  message?: string | undefined;
  /** Neutral helper text under the grid — "Slots open 30 minutes ahead.", say. */
  hint?: string | undefined;
}

/** A bare string is its own value and label; a `Slot` spells both out. */
function toSlot(slot: Slot | string): Slot {
  return typeof slot === "string" ? { value: slot, label: slot } : slot;
}

/**
 * Pickup and table-booking time slots — a radio group wearing chips. It reflows at any width and
 * sold-out slots stay visible, struck through, so the reader can see what they missed.
 */
export function SlotPicker({
  className,
  slots,
  label,
  columns,
  status = "default",
  message,
  hint,
  disabled = false,
  ...props
}: SlotPickerProps) {
  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const messageId = `${generatedId}-description`;

  const isDisabled = disabled || status === "disabled";
  const hasDescription =
    (message !== undefined && message !== "") || (hint !== undefined && hint !== "");
  const styles = slotPicker({ status, isDisabled });

  return (
    <div className={styles.root({ class: className })}>
      {label === undefined ? null : (
        <span className={styles.label()} id={labelId}>
          {label}
        </span>
      )}
      <RadioGroupPrimitive.Root
        aria-describedby={hasDescription ? messageId : undefined}
        aria-invalid={status === "error" || undefined}
        aria-labelledby={label === undefined ? undefined : labelId}
        className={styles.grid({ class: COLUMNS[columns ?? "auto"] })}
        disabled={isDisabled}
        {...props}
      >
        {slots.map(toSlot).map((slot) => (
          <RadioGroupPrimitive.Item
            // Named explicitly: the label and the note are adjacent spans, so the name computed
            // from the contents would run them together as "ASAP12 min".
            aria-label={slot.note === undefined ? slot.label : `${slot.label}, ${slot.note}`}
            className={styles.slot()}
            disabled={slot.isDisabled ?? false}
            key={slot.value}
            value={slot.value}
          >
            <span className={styles.slotLabel({ class: slot.isDisabled ? "line-through" : "" })}>
              {slot.label}
            </span>
            {slot.note === undefined ? null : (
              <span className={styles.slotNote()}>{slot.note}</span>
            )}
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
      <FieldMessage hint={hint} id={messageId} message={message} status={status} />
    </div>
  );
}
