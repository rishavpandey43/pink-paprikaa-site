"use client";

import { CalendarDays } from "lucide-react";
import { useId, useState } from "react";

import type { SxProp } from "../../lib/common-props";
import type { FieldStatus } from "../../lib/field-status";
import type { Matcher } from "./calendar";

import { Popover } from "../../atoms/popover/popover";
import { componentVariants } from "../../lib/component-variants";
import { FieldControl } from "../../lib/field-control";
import { formatDate, toIsoDate } from "../../lib/format-date";
import { withSx } from "../../lib/sx";
import { useControllableState } from "../../lib/use-controllable-state";
import { Calendar } from "./calendar";

export interface DatePickerProps extends SxProp {
  value?: Date | null | undefined;
  defaultValue?: Date | null | undefined;
  onValueChange?: ((date: Date | null) => void) | undefined;
  /** Default "Pick a date". */
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  /** Days that cannot be chosen: `{ before: new Date() }`, `{ dayOfWeek: [1] }`, a list of them. */
  disabledDays?: Matcher | Matcher[] | undefined;
  /** Submitted as `yyyy-mm-dd` through a hidden input. */
  name?: string | undefined;
  status?: FieldStatus | undefined;
  /** Portal target for the calendar; default `document.body`. */
  portalContainer?: HTMLElement | null | undefined;
  /** Field wiring, like Select: the id the label points at. */
  id?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-describedby"?: string | undefined;
}

const datePicker = componentVariants({
  slots: {
    // A trigger button is not a native field control, so the box's disabled paint is repeated for it,
    // and the box keeps its focus border while the calendar (and so the focus) is open.
    box: [
      "has-[>button:disabled]:cursor-not-allowed has-[>button:disabled]:border-border-subtle has-[>button:disabled]:bg-ink-100 has-[>button:disabled]:text-ink-400",
      "has-[>button[data-state=open]]:border-2 has-[>button[data-state=open]]:border-border-brand has-[>button[data-state=open]]:shadow-focus-ring",
    ],
    trigger: "cursor-pointer truncate text-start disabled:cursor-not-allowed",
    placeholder: "text-text-subtle",
  },
});

/**
 * A date field: a button that shows the chosen day (en-IN, "Mon, 5 Oct 2026") and opens a Calendar
 * in a Popover. The week starts on Monday; the keyboard works as in the Calendar, and Escape
 * closes it and returns focus to the field. Picking a day closes it. Pass `name` to submit the day
 * as `yyyy-mm-dd`. For a date plus a time use a DatePicker with a SlotPicker beside it.
 *
 * Label and message belong to Field; the accessible name comes from `aria-label` or Field's
 * label, and the chosen date (or the placeholder) is the description.
 */
export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Pick a date",
  disabled = false,
  disabledDays,
  name,
  status = "default",
  portalContainer,
  id,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  sx,
}: DatePickerProps) {
  const valueId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useControllableState<Date | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });
  const slots = datePicker();

  return (
    <FieldControl
      icon={CalendarDays}
      status={status}
      className={slots.box({ className: withSx(sx, undefined) })}
    >
      {(controlClassName) => (
        <>
          <Popover
            open={isOpen}
            onOpenChange={setIsOpen}
            portalContainer={portalContainer}
            align="start"
            aria-label="Choose a date"
            trigger={
              <button
                id={id}
                type="button"
                className={`${controlClassName} ${slots.trigger()}`}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-describedby={
                  ariaDescribedby === undefined ? valueId : `${valueId} ${ariaDescribedby}`
                }
                aria-invalid={status === "error" ? true : undefined}
              >
                <span id={valueId} className={date === null ? slots.placeholder() : undefined}>
                  {date === null ? placeholder : formatDate(date)}
                </span>
              </button>
            }
          >
            <Calendar
              mode="single"
              selected={date ?? undefined}
              {...(disabledDays === undefined ? {} : { disabled: disabledDays })}
              shouldFocusDay
              onSelect={(next) => {
                // Picking the chosen day again would clear a single selection; a date field keeps it.
                if (next instanceof Date) setDate(next);
                setIsOpen(false);
              }}
            />
          </Popover>
          {name === undefined || disabled ? null : (
            <input type="hidden" name={name} value={date === null ? "" : toIsoDate(date)} />
          )}
        </>
      )}
    </FieldControl>
  );
}
