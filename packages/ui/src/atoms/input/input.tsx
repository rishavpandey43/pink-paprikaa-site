import type { ComponentProps, ReactNode } from "react";

import type { SxProp } from "../../lib/common-props";
import type { DesignFieldChrome } from "../../lib/design-field";
import { withDesignField } from "../../lib/design-field";
import { FieldControl } from "../../lib/field-control";
import type { FieldStatus } from "../../lib/field-status";
import { withSx } from "../../lib/sx";
import type { IconComponent } from "../icon/icon";

/** Allowed single-line types. `number` renders as text + decimal inputMode (no spinner UI). */
export type InputType = "text" | "email" | "tel" | "url" | "password" | "search" | "number";

interface InputOwnProps extends SxProp, DesignFieldChrome {
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
 * sunken fill and a lock; `status="error"` sets `aria-invalid`. Label, hint and message are Field's
 * (R147: pass them here, or wrap with `<Field>`).
 * `sx` and `className` style the box; every other prop — `register()` included — lands on the native control.
 */
export type InputProps = InputOwnProps &
  (
    | ({
        isMultiline?: false | undefined;
        type?: InputType | undefined;
      } & Omit<ComponentProps<"input">, "size" | "type">)
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
  label,
  hint,
  error,
  success,
  warning,
  optional,
  ...control
}: InputProps) {
  return withDesignField(
    { label, hint, error, success, warning, optional },
    "id" in control && typeof control.id === "string" ? control.id : undefined,
    status,
    (wired) => {
      const box = {
        size,
        status: wired.status,
        icon,
        suffix,
        trailing,
        isLoading,
        className: withSx(sx, className),
        isReadOnly: control.readOnly === true,
      };
      const state = {
        "aria-invalid": wired.status === "error" || wired["aria-invalid"] ? true : undefined,
        "aria-busy": isLoading ? true : undefined,
        "aria-describedby": wired["aria-describedby"],
        "aria-required": wired["aria-required"],
        ...(wired.id === "" ? {} : { id: wired.id }),
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

      const { isMultiline = false, type = "text", ...input } = control;
      const numberProps =
        type === "number"
          ? { type: "text" as const, inputMode: "decimal" as const, pattern: "[0-9]*[.,]?[0-9]*" }
          : { type };
      return (
        <FieldControl {...box} isMultiline={isMultiline}>
          {(controlClassName) => (
            <input className={controlClassName} {...state} {...input} {...numberProps} />
          )}
        </FieldControl>
      );
    }
  );
}
