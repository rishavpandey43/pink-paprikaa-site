"use client";

import type { ChangeEvent, ComponentPropsWithoutRef, KeyboardEvent } from "react";

import { useId, useRef, useState } from "react";

import { componentVariants } from "../../lib/component-variants";
import { FieldMessage, type FieldStatus } from "../field/field";

const otpInput = componentVariants({
  slots: {
    root: "grid min-w-0 gap-2",
    // Wraps to a second row rather than overflowing — six 48px cells do not fit 360px.
    row: "flex flex-wrap gap-2.5",
  },
});

const otpCell = componentVariants({
  base: [
    "h-14 w-12 shrink-0 rounded-3 text-center font-mono text-subtitle1 text-text-heading",
    "border border-(--field-border-default) bg-(--field-bg-default) outline-none",
    "transition-[border-color,box-shadow] duration-(--duration-fast) ease-out",
    "focus:border-2 focus:border-(--field-border-focus) focus:shadow-focus-ring",
    // Disabled is a real grey fill, never a reduced opacity (state contract).
    "disabled:cursor-not-allowed disabled:border-border-subtle",
    "disabled:bg-(--field-bg-disabled) disabled:text-(--field-fg-disabled)",
  ],
  variants: {
    /** The shared form-status system, borrowed whole from `Field`. */
    status: {
      default: "",
      error: "border-2 border-(--field-border-error) focus:border-(--field-border-error)",
      success: "border-2 border-(--field-border-success) focus:border-(--field-border-success)",
      warning: "border-2 border-(--field-border-warning) focus:border-(--field-border-warning)",
      disabled: "",
      readOnly: "bg-(--field-bg-readonly)",
      loading: "",
    },
    /** A cell with a digit in it takes the 2px brand border, so progress is visible at a glance. */
    isFilled: { true: "border-2 border-brand-primary", false: "" },
  },
  compoundVariants: [
    // A status colour outranks the filled border — the whole code is wrong, not this one cell.
    { isFilled: true, status: "error", class: "border-(--field-border-error)" },
    { isFilled: true, status: "success", class: "border-(--field-border-success)" },
    { isFilled: true, status: "warning", class: "border-(--field-border-warning)" },
  ],
  defaultVariants: { status: "default", isFilled: false },
});

const EMPTY_CELL = " ";

export interface OtpInputProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "defaultValue" | "onChange"
> {
  /** How many digits the code has. Four for a quick re-verify, six for a fresh sign-in. */
  length?: 4 | 6 | undefined;
  /** The code so far. Pass it with `onChange` to drive the cells from your own state. */
  value?: string | undefined;
  /** The code to start from when the component keeps its own state. */
  defaultValue?: string | undefined;
  /** The shared form status. `disabled` and `readOnly` drive the cells' own attributes. */
  status?: FieldStatus | undefined;
  /** The sentence explaining a non-default status. It replaces the hint. */
  message?: string | undefined;
  /** Neutral helper text under the cells — "The code lasts 10 minutes.", say. */
  hint?: string | undefined;
  /** Accessible name for the group of cells. */
  label?: string | undefined;
  /** Called with the whole code — not the single digit — every time a cell changes. */
  onChange?: ((value: string) => void) | undefined;
}

/**
 * The mobile sign-in code, one cell per digit. Typing walks forward, Backspace walks back, and a
 * pasted code fills the cells from wherever it lands.
 */
export function OtpInput({
  className,
  length = 6,
  value,
  defaultValue = "",
  status = "default",
  message,
  hint,
  label = "One-time code",
  onChange,
  ...props
}: OtpInputProps) {
  const generatedId = useId();
  const messageId = `${generatedId}-description`;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const cellsRef = useRef<(HTMLInputElement | null)[]>([]);

  const current = value ?? internalValue;
  const isDisabled = status === "disabled";
  const isReadOnly = status === "readOnly";
  const hasDescription =
    (message !== undefined && message !== "") || (hint !== undefined && hint !== "");
  const slots = otpInput();

  const digitAt = (index: number) => (current[index] ?? EMPTY_CELL).trim();

  const commit = (next: string) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const focusCell = (index: number) => {
    cellsRef.current[Math.min(Math.max(index, 0), length - 1)]?.focus();
  };

  const handleChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "");
    const cells = Array.from({ length }, (_, cell) => current[cell] ?? EMPTY_CELL);

    if (digits === "") {
      cells[index] = EMPTY_CELL;
      commit(cells.join("").trimEnd());
      return;
    }

    // One typed digit lands here; a pasted code spills forward across the cells that follow.
    Array.from(digits).forEach((digit, offset) => {
      if (index + offset < length) {
        cells[index + offset] = digit;
      }
    });
    commit(cells.join("").trimEnd());
    focusCell(index + digits.length);
  };

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && digitAt(index) === "" && index > 0) {
      event.preventDefault();
      const cells = Array.from({ length }, (_, cell) => current[cell] ?? EMPTY_CELL);
      cells[index - 1] = EMPTY_CELL;
      commit(cells.join("").trimEnd());
      focusCell(index - 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusCell(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusCell(index + 1);
    }
  };

  return (
    <div className={slots.root({ class: className })} {...props}>
      <div
        aria-describedby={hasDescription ? messageId : undefined}
        aria-label={label}
        className={slots.row()}
        role="group"
      >
        {Array.from({ length }, (_, index) => (
          <input
            aria-invalid={status === "error" || undefined}
            aria-label={`Digit ${String(index + 1)} of ${String(length)}`}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            className={otpCell({ status, isFilled: digitAt(index) !== "" })}
            disabled={isDisabled}
            inputMode="numeric"
            key={index}
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
            readOnly={isReadOnly}
            ref={(node) => {
              cellsRef.current[index] = node;
            }}
            type="text"
            value={digitAt(index)}
          />
        ))}
      </div>
      <FieldMessage hint={hint} id={messageId} message={message} status={status} />
    </div>
  );
}
