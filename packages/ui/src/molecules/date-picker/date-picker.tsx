"use client";

import { CalendarDays } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useId, useState } from "react";

import type { IconComponent } from "../../atoms/icon/icon";
import { Popover } from "../../atoms/popover/popover";
import type { SxProp } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import type { DesignFieldChrome } from "../../lib/design-field";
import { withDesignField } from "../../lib/design-field";
import { FieldControl } from "../../lib/field-control";
import type { FieldStatus } from "../../lib/field-status";
import { formatDate, fromIsoDate, toIsoDate } from "../../lib/format-date";
import type { SheetMode } from "../../lib/popover-shell";
import { withSx } from "../../lib/sx";
import { useControllableState } from "../../lib/use-controllable-state";
import type { Matcher } from "./calendar";
import { Calendar } from "./calendar";

export interface DatePickerProps extends SxProp, DesignFieldChrome {
  /** ISO `yyyy-mm-dd` (R133). Empty string = no day chosen. */
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((iso: string) => void) | undefined;
  /** Default "Pick a date". */
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  /** Sunken fill + lock; no open. */
  readOnly?: boolean | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  /** Earliest pickable ISO date → Calendar `fromDate`. */
  min?: string | undefined;
  /** Latest pickable ISO date → Calendar `toDate`. */
  max?: string | undefined;
  /** Days that cannot be chosen: `{ before: new Date() }`, `{ dayOfWeek: [1] }`, a list of them. */
  disabledDays?: Matcher | Matcher[] | undefined;
  /** First day of the week: 0 = Sunday, 1 = Monday (default). */
  weekStart?: 0 | 1 | undefined;
  /** Override the trigger label; default en-IN via `formatDate`. */
  format?: ((iso: string) => string) | undefined;
  /** Submitted as `yyyy-mm-dd` through a hidden input. */
  name?: string | undefined;
  status?: FieldStatus | undefined;
  /** Portal target for the calendar; default `document.body`. */
  portalContainer?: HTMLElement | null | undefined;
  /** Field wiring, like Select: the id the label points at. */
  id?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-describedby"?: string | undefined;
  /** Leading trigger icon. Default CalendarDays. */
  icon?: IconComponent | undefined;
  /** `"auto"` = bottom sheet at ≤640px. */
  sheet?: SheetMode | undefined;
  /** Render just the calendar card in flow (docs/specimens). */
  inline?: boolean | undefined;
  /** Docs/specimens: start with the calendar open. */
  defaultOpen?: boolean | undefined;
}

const datePicker = componentVariants({
  slots: {
    box: [
      "has-[>button:disabled]:cursor-not-allowed has-[>button:disabled]:border-border-subtle has-[>button:disabled]:bg-ink-100 has-[>button:disabled]:text-ink-400",
      "has-[>button[data-state=open]]:border-2 has-[>button[data-state=open]]:border-border-brand has-[>button[data-state=open]]:shadow-focus-ring",
    ],
    trigger: "cursor-pointer truncate text-start disabled:cursor-not-allowed",
    placeholder: "text-text-subtle",
  },
});

/**
 * A date field: button shows the chosen day (en-IN) and opens a Calendar in a Popover.
 * Values are ISO `yyyy-mm-dd` strings in and out (R133). ArrowDown opens. Pass `name` to submit
 * the day. Label and message belong to Field.
 */
export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Pick a date",
  disabled = false,
  readOnly = false,
  size = "md",
  min,
  max,
  disabledDays,
  weekStart = 1,
  format: formatValue,
  name,
  status = "default",
  portalContainer,
  id,
  label,
  hint,
  error,
  success,
  warning,
  optional,
  icon = CalendarDays,
  sheet = "auto",
  inline = false,
  defaultOpen = false,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  sx,
}: DatePickerProps) {
  const valueId = useId();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [iso, setIso] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const date = fromIsoDate(iso);
  const slots = datePicker();
  const fromDate = fromIsoDate(min) ?? undefined;
  const toDate = fromIsoDate(max) ?? undefined;
  const isLocked = disabled || readOnly;
  const display = date === null ? placeholder : (formatValue?.(iso) ?? formatDate(date));

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (isLocked) return;
    if (!isOpen && event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const calendar = (
    <Calendar
      mode="single"
      selected={date ?? undefined}
      weekStart={weekStart}
      {...(disabledDays === undefined ? {} : { disabled: disabledDays })}
      {...(fromDate === undefined ? {} : { fromDate })}
      {...(toDate === undefined ? {} : { toDate })}
      shouldFocusDay={!inline}
      onSelect={(next) => {
        if (next instanceof Date) setIso(toIsoDate(next));
        if (!inline) setIsOpen(false);
      }}
    />
  );

  return withDesignField({ label, hint, error, success, warning, optional }, id, status, (wired) =>
    inline ? (
      calendar
    ) : (
      <FieldControl
        icon={icon}
        size={size}
        status={wired.status}
        isReadOnly={readOnly}
        isExpanded={isOpen}
        className={slots.box({ className: withSx(sx, undefined) })}
      >
        {(controlClassName) => (
          <>
            <Popover
              open={isOpen}
              onOpenChange={(next) => {
                if (!isLocked) setIsOpen(next);
              }}
              portalContainer={portalContainer}
              align="start"
              aria-label="Choose a date"
              sheet={sheet}
              trigger={
                // eslint-disable-next-line jsx-a11y/role-supports-aria-props -- ARIA 1.2: any widget
                <button
                  id={wired.id === "" ? id : wired.id}
                  type="button"
                  className={`${controlClassName} ${slots.trigger()}`}
                  disabled={disabled}
                  aria-label={ariaLabel}
                  aria-describedby={
                    wired["aria-describedby"] ??
                    (ariaDescribedby === undefined ? valueId : `${valueId} ${ariaDescribedby}`)
                  }
                  aria-invalid={
                    wired.status === "error" || wired["aria-invalid"] ? true : undefined
                  }
                  onKeyDown={onTriggerKeyDown}
                >
                  <span id={valueId} className={date === null ? slots.placeholder() : undefined}>
                    {display}
                  </span>
                </button>
              }
            >
              {calendar}
            </Popover>
            {name === undefined || disabled ? null : (
              <input type="hidden" name={name} value={iso} />
            )}
          </>
        )}
      </FieldControl>
    )
  );
}
