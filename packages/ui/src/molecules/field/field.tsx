import type { ReactNode } from "react";

import { useId } from "react";

import type { BaseProps } from "../../lib/common-props";
import type { FieldStatus } from "../../lib/field-status";

import { componentVariants } from "../../lib/component-variants";
import { FieldMessage, hasFieldMessage } from "../../lib/field-message";
import { withSx } from "../../lib/sx";

const field = componentVariants({
  slots: {
    // `group/form-field` + `group-has-[…:disabled]/form-field:` mute the label while the control is
    // disabled (dev parity) — CSS, no prop. The selector names the control: a bare `has-disabled`
    // also matches a Select's disabled placeholder <option>. Named apart from Plan 2b's
    // `group/field` (the box).
    root: "group/form-field grid min-w-0",
    label:
      "flex items-baseline gap-1.5 text-body-sm font-medium text-text-body group-has-[:is(input,textarea,select):disabled]/form-field:text-text-subtle",
    required: "text-text-brand",
    optional: "text-caption font-regular text-text-subtle",
    control: "grid min-w-0 gap-1.5",
  },
  variants: {
    orientation: {
      stack: { root: "gap-1.5" },
      // Two columns from `sm` (480px) up only; below it the field stacks (dev parity).
      side: {
        root: "gap-1.5 sm:grid-cols-field-side sm:items-start sm:gap-4",
        label: "sm:pt-3.25",
      },
    },
  },
  defaultVariants: { orientation: "stack" },
});

/** What `children` receives: spread it onto the one control the field labels. */
export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string | undefined;
  "aria-invalid"?: true | undefined;
  required?: true | undefined;
}

export interface FieldProps extends Omit<BaseProps<"div">, "children" | "id"> {
  label: ReactNode;
  /** Helper text under the control. Replaced by `message` while a status is set. */
  hint?: ReactNode;
  /**
   * Pass the same status to the control for its border or box. A status always comes with
   * `message`: the control shows only a colour and a glyph, Field shows the words.
   */
  status?: FieldStatus | undefined;
  /** The status message — react-hook-form's `fieldState.error?.message`, for instance. */
  message?: ReactNode;
  isRequired?: boolean | undefined;
  /** Mark the optional fields rather than starring the required ones. */
  isOptional?: boolean | undefined;
  /** `stack` puts the label above; `side` gives it a 160px column from 480px up (stacks below). */
  orientation?: "stack" | "side" | undefined;
  /** The control's id (default: generated). The wrapper itself takes no id. */
  id?: string | undefined;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Label, control and hint or status message, wired by render prop (spec §9.2): `children`
 * receives the ids and flags to spread onto the control, so the field works in a server
 * component and with react-hook-form's `register()` spread after it.
 */
export function Field({
  label,
  hint,
  status = "default",
  message,
  isRequired = false,
  isOptional = false,
  orientation = "stack",
  id,
  sx,
  className,
  children,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-message`;
  const styles = field({ orientation });

  // Only the keys that apply: an absent key cannot override a control's own attribute.
  const control: FieldControlProps = { id: controlId };
  if (hasFieldMessage({ status, message, hint })) control["aria-describedby"] = messageId;
  if (status === "error") control["aria-invalid"] = true;
  if (isRequired) control.required = true;

  return (
    <div className={styles.root({ className: withSx(sx, className) })} {...props}>
      <label htmlFor={controlId} className={styles.label()}>
        <span>{label}</span>
        {isRequired ? (
          <span aria-hidden="true" className={styles.required()}>
            *
          </span>
        ) : null}
        {isOptional ? (
          <>
            {" "}
            <span className={styles.optional()}>optional</span>
          </>
        ) : null}
      </label>
      <div className={styles.control()}>
        {children(control)}
        <FieldMessage id={messageId} status={status} message={message} hint={hint} />
      </div>
    </div>
  );
}
