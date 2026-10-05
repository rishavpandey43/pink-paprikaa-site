"use client";

import type { ReactNode, Ref } from "react";

import { useId, useState } from "react";

import type { BaseProps } from "../../lib/common-props";
import type { DesignFieldChrome } from "../../lib/design-field";
import type { FieldStatus } from "../../lib/field-status";

import { componentVariants } from "../../lib/component-variants";
import { withDesignField } from "../../lib/design-field";
import { fieldControlVariants } from "../../lib/field-control";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";
import { withSx } from "../../lib/sx";
import { useControllableState } from "../../lib/use-controllable-state";

const otpInput = componentVariants({
  slots: {
    root: "grid gap-2",
    field: "relative w-fit max-w-full",
    cells: "flex flex-wrap gap-2.5",
    /** Layered over the shared field box (Plan 2b): a 48×56 cell with a centred mono digit. */
    cell: "w-12 justify-center px-0 font-mono text-otp-digit text-text-heading",
    input:
      "absolute inset-0 size-full cursor-text appearance-none border-0 bg-transparent p-0 text-body text-transparent caret-transparent outline-hidden selection:bg-transparent disabled:cursor-not-allowed",
  },
  variants: {
    state: {
      empty: {},
      filled: { cell: "border-2" },
      active: { cell: "border-2 bg-surface-page-alt shadow-focus-ring" },
    },
    // The box's status borders come from fieldControlVariants; this only gates the compound below.
    status: { default: {}, error: {}, success: {}, warning: {} },
    // The cells are skins with no control inside, so the box's `has-[>:is(input,…):disabled]`
    // paint never reaches them: disabled reproduces it whole.
    isDisabled: {
      true: { cell: "cursor-not-allowed border-border-subtle bg-ink-100 text-ink-400" },
    },
  },
  compoundVariants: [
    {
      status: "default",
      isDisabled: false,
      state: ["filled", "active"],
      class: { cell: "border-border-brand" },
    },
    {
      status: "error",
      isDisabled: false,
      state: "active",
      class: { cell: "shadow-field-ring-danger" },
    },
    {
      status: "success",
      isDisabled: false,
      state: "active",
      class: { cell: "shadow-field-ring-success" },
    },
    {
      status: "warning",
      isDisabled: false,
      state: "active",
      class: { cell: "shadow-field-ring-warning" },
    },
  ],
  defaultVariants: { state: "empty", status: "default", isDisabled: false },
});

type CellState = "empty" | "filled" | "active";

/** The wrapper takes the div's native props; the code field keeps `ref`, `name`, `disabled`, `onBlur`. */
export interface OtpInputProps
  extends
    Omit<
      BaseProps<"div">,
      "ref" | "onBlur" | "defaultValue" | "children" | "aria-describedby" | "aria-invalid"
    >,
    DesignFieldChrome {
  /** Accessible name of the code field, e.g. "Login code". */
  label: string;
  length?: 4 | 6 | undefined;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  onBlur?: (() => void) | undefined;
  /** Border and glyph colour. A status needs a `message`: never a colour without words. */
  status?: FieldStatus | undefined;
  /**
   * The line under the cells: on the default status a neutral hint ("The code lasts 10
   * minutes."), with a status its message and glyph ("Verified. Signing you in.").
   */
  message?: ReactNode;
  disabled?: boolean | undefined;
  name?: string | undefined;
  /** The code field — react-hook-form's Controller focuses it on error. */
  ref?: Ref<HTMLInputElement> | undefined;
}

/**
 * The mobile-OTP code — the app's only sign-in. One real input behind decorative cells: SMS
 * autofill, paste, Backspace and selection are the platform's, and assistive tech meets one field.
 * Filled cells take a 2px pink border; the cells wrap to a second row rather than overflow at 360px.
 */
export function OtpInput({
  label,
  length = 6,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  status = "default",
  message,
  hint,
  error,
  success,
  warning,
  optional,
  disabled = false,
  name,
  sx,
  className,
  ref,
  ...props
}: OtpInputProps) {
  const [code, setCode] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const [isFocused, setIsFocused] = useState(false);
  const messageId = `${useId()}-message`;
  const styles = otpInput({ status, isDisabled: disabled });
  const box = fieldControlVariants({ size: "lg", status });
  const activeIndex = isFocused ? Math.min(code.length, length - 1) : -1;

  function stateOf(index: number): CellState {
    if (index === activeIndex) return "active";
    return index < code.length ? "filled" : "empty";
  }

  const chrome = { label, hint, error, success, warning, optional };
  return withDesignField(
    chrome,
    undefined,
    status,
    (wired) => (
      <div {...props} className={styles.root({ className: withSx(sx, className) })}>
        <div className={styles.field()}>
          <div aria-hidden="true" data-surface="light" className={styles.cells()}>
            {Array.from({ length }, (_, index) => {
              const state = stateOf(index);
              return (
                <span
                  key={index}
                  data-state={state}
                  className={box.root({ className: styles.cell({ state }) })}
                >
                  {code[index]}
                </span>
              );
            })}
          </div>
          <input
            ref={ref}
            id={wired.id === "" ? undefined : wired.id}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            aria-label={label}
            aria-describedby={
              wired["aria-describedby"] ??
              (hasFieldMessage({ status: wired.status, message, hint }) ? messageId : undefined)
            }
            aria-invalid={wired.status === "error" || wired["aria-invalid"] ? true : undefined}
            name={name}
            value={code}
            disabled={disabled}
            onChange={(event) => {
              setCode(event.currentTarget.value.replace(/\D/g, "").slice(0, length));
            }}
            onFocus={() => {
              setIsFocused(true);
            }}
            // The caret is transparent and the cells show only "the next one", so pin the caret to
            // the end: an arrow key or a tap can never move the insertion point out of sight.
            onSelect={(event) => {
              const end = event.currentTarget.value.length;
              event.currentTarget.setSelectionRange(end, end);
            }}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            className={styles.input()}
          />
        </div>
        {wired.id === "" ? (
          <FieldMessage id={messageId} status={wired.status} message={message} hint={hint} />
        ) : null}
      </div>
    ),
    { ignoreLabel: true }
  );
}
