import type { ComponentProps, ReactNode } from "react";

import type { SxProp } from "../../lib/common-props";
import type { FieldStatus } from "../../lib/field-status";
import type { IconComponent } from "../icon/icon";

import { FieldControl } from "../../lib/field-control";
import { withSx } from "../../lib/sx";

interface InputOwnProps extends SxProp {
  size?: "sm" | "md" | "lg" | undefined;
  /** A status raises the border to 2px, tints the icon and shows its glyph. Field shows the message. */
  status?: FieldStatus | undefined;
  /** Leading icon: the status colour, or pink while focused. */
  icon?: IconComponent | undefined;
  /** Trailing static text — a unit or a count — in Space Mono. */
  suffix?: string | undefined;
  /** Trailing element, e.g. a small button. */
  trailing?: ReactNode;
  /** Pulses the brand mark in place of the trailing glyph while the value is checked. */
  isLoading?: boolean | undefined;
}

/**
 * The text field (spec §9.1): one line, or a textarea with `isMultiline`. `readOnly` gives the
 * sunken fill and a lock; `status="error"` sets `aria-invalid`. Label, hint and message are Field's.
 * `sx` and `className` style the box; every other prop — `register()` included — lands on the native control.
 */
export type InputProps = InputOwnProps &
  (
    | ({ isMultiline?: false | undefined } & Omit<ComponentProps<"input">, "size">)
    | ({ isMultiline: true; rows?: number | undefined } & ComponentProps<"textarea">)
  );

export function Input({
  size = "md",
  status = "default",
  icon,
  suffix,
  trailing,
  isLoading = false,
  sx,
  className,
  ...control
}: InputProps) {
  const box = {
    size,
    status,
    icon,
    suffix,
    trailing,
    isLoading,
    className: withSx(sx, className),
    isReadOnly: control.readOnly === true,
  };
  const state = {
    "aria-invalid": status === "error" ? true : undefined,
    "aria-busy": isLoading ? true : undefined,
  };

  if (control.isMultiline === true) {
    const { isMultiline, rows = 4, ...textarea } = control;
    return (
      <FieldControl {...box} isMultiline={isMultiline}>
        {(controlClassName) => (
          <textarea rows={rows} className={controlClassName} {...state} {...textarea} />
        )}
      </FieldControl>
    );
  }

  const { isMultiline = false, ...input } = control;
  return (
    <FieldControl {...box} isMultiline={isMultiline}>
      {(controlClassName) => (
        <input type="text" className={controlClassName} {...state} {...input} />
      )}
    </FieldControl>
  );
}
