import type { ReactNode } from "react";

import { Icon } from "../atoms/icon/icon";
import { componentVariants } from "./component-variants";
import { FIELD_STATUS_ICON, type FieldStatus } from "./field-status";

const fieldMessage = componentVariants({
  base: "m-0 flex min-w-0 items-start gap-1.5 text-caption",
  variants: {
    status: {
      default: "text-text-subtle",
      error: "text-text-danger",
      success: "text-text-success",
      warning: "text-text-warning",
    },
  },
  defaultVariants: { status: "default" },
});

export interface FieldMessageContent {
  status?: FieldStatus | undefined;
  message?: ReactNode;
  hint?: ReactNode;
}

export interface FieldMessageProps extends FieldMessageContent {
  /** The id the control lists in `aria-describedby`. */
  id: string;
  className?: string | undefined;
}

function isShown(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== "";
}

/** True when `FieldMessage` renders a line — a control references its id only then. */
export function hasFieldMessage({ message, hint }: FieldMessageContent): boolean {
  return isShown(message) || isShown(hint);
}

/**
 * The line under a control — one system for every control (spec §3.8): a status (error, success,
 * warning) shows its glyph and its message in the status colour and replaces the hint; an error
 * is `role="alert"`, so it is announced without waiting for focus (dev parity). Otherwise the
 * message (or else the hint) shows, muted. A status without a message keeps the hint: never a
 * colour without words.
 */
export function FieldMessage({
  id,
  status = "default",
  message,
  hint,
  className,
}: FieldMessageProps) {
  if (status !== "default" && isShown(message)) {
    // `key`: a hint turning into an error mounts a fresh node — screen readers announce an added
    // `role="alert"` on an existing node unreliably.
    return (
      <p
        key={status}
        id={id}
        role={status === "error" ? "alert" : undefined}
        className={fieldMessage({ status, className })}
      >
        <Icon icon={FIELD_STATUS_ICON[status]} size="xs" className="mt-px" />
        <span className="min-w-0">{message}</span>
      </p>
    );
  }
  const text = isShown(message) ? message : hint;
  if (isShown(text)) {
    return (
      <p id={id} className={fieldMessage({ className })}>
        {text}
      </p>
    );
  }
  return null;
}
