import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Ban, CircleAlert, CircleCheck, Lock, TriangleAlert } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";
import { Spinner } from "../../atoms/spinner/spinner";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

/**
 * The one status vocabulary every form molecule in this package speaks — `Field`, `SearchField`,
 * `OtpInput` and `SlotPicker` all take a `status` of this type rather than each inventing its own
 * booleans.
 *
 * The three *message* statuses (`error`, `success`, `warning`) raise a control's border to 2px,
 * tint its leading glyph and hang the matching glyph on its trailing edge. The three *mode*
 * statuses (`disabled`, `readOnly`, `loading`) change what the control will accept rather than
 * scolding the reader. A message status must always arrive with a `message`: a colour on its own
 * says something is wrong without ever saying what.
 */
export type FieldStatus =
  "default" | "disabled" | "error" | "loading" | "readOnly" | "success" | "warning";

/**
 * The glyph each status shows beside its message and on a control's trailing edge. `loading` has
 * none — it swaps in the brand's pulsing diamond, which is a `Spinner`, not a Lucide glyph.
 */
export const FIELD_STATUS_ICON: Record<FieldStatus, LucideIcon | undefined> = {
  default: undefined,
  disabled: Ban,
  error: CircleAlert,
  loading: undefined,
  readOnly: Lock,
  success: CircleCheck,
  warning: TriangleAlert,
};

/** The colour each status paints its message and its trailing glyph. */
export const FIELD_STATUS_TONE: Record<FieldStatus, string> = {
  default: "text-text-subtle",
  disabled: "text-text-subtle",
  error: "text-status-danger",
  loading: "text-text-muted",
  readOnly: "text-text-subtle",
  success: "text-status-success",
  warning: "text-status-warning",
};

const fieldMessage = componentVariants({
  base: "flex min-w-0 items-center gap-1-5 font-body text-caption leading-caption",
  variants: {
    status: {
      default: "text-text-subtle",
      disabled: "text-text-subtle",
      error: "text-status-danger",
      loading: "text-text-muted",
      readOnly: "text-text-subtle",
      success: "text-status-success",
      warning: "text-status-warning",
    },
  },
  defaultVariants: { status: "default" },
});

export interface FieldMessageProps {
  /** Which status the sentence explains. Anything but `default` gets the status colour and glyph. */
  status?: FieldStatus | undefined;
  /** The sentence itself. It replaces the hint outright — the two are never shown together. */
  message?: string | undefined;
  /** Neutral helper text, shown only while there is no `message` to replace it. */
  hint?: string | undefined;
  /** Point the control's `aria-describedby` here so the sentence is announced with the field. */
  id?: string | undefined;
  className?: string | undefined;
}

/**
 * The one line under a control. Exported so every form molecule renders its hint and its status
 * message identically — same size, same glyph, same colour, same replacement rule.
 */
export function FieldMessage({
  status = "default",
  message,
  hint,
  id,
  className,
}: FieldMessageProps) {
  const hasMessage = message !== undefined && message !== "";
  const isStatusMessage = hasMessage && status !== "default";
  const text = hasMessage ? message : hint;
  if (text === undefined || text === "") {
    return null;
  }

  const glyph = isStatusMessage ? FIELD_STATUS_ICON[status] : undefined;
  return (
    <span
      className={fieldMessage({ status: isStatusMessage ? status : "default", className })}
      id={id}
      role={isStatusMessage && status === "error" ? "alert" : undefined}
    >
      {isStatusMessage && status === "loading" ? <Spinner size="xs" /> : null}
      {glyph ? <Icon icon={glyph} size="xs" /> : null}
      {text}
    </span>
  );
}

const field = componentVariants({
  slots: {
    root: "grid min-w-0",
    label: "flex items-baseline gap-1-5",
    labelText: "font-body font-medium text-body2 text-text-body",
    marker: "font-body text-body2 text-text-brand",
    optional: "font-body text-caption text-text-subtle",
    control: "grid min-w-0 gap-1-5",
  },
  variants: {
    /**
     * `side` splits into two columns from 480px up only — a 160px label column beside a control on
     * a 360px screen leaves the control too narrow to type in, so it stacks there instead.
     */
    layout: {
      stack: { root: "gap-1-5" },
      side: {
        root: "gap-1-5 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:items-start sm:gap-4",
        label: "sm:pt-3",
      },
    },
    isDisabled: { true: { labelText: "text-text-subtle" }, false: {} },
  },
  defaultVariants: { layout: "stack", isDisabled: false },
});

export interface FieldProps
  extends
    Omit<ComponentPropsWithoutRef<"div">, "children">,
    Omit<VariantProps<typeof field>, "isDisabled"> {
  /** The question, in sentence case: "How spicy?", "Mobile number". */
  label?: string | undefined;
  /** Neutral helper text under the control. A `message` replaces it, never sits beside it. */
  hint?: string | undefined;
  /** Which status the wrapped control is in. `disabled` also mutes the label. */
  status?: FieldStatus | undefined;
  /** The sentence explaining a non-default status. Required whenever `status` carries a colour. */
  message?: string | undefined;
  /** Adds the brand-coloured marker. Prefer marking the few optional fields instead. */
  isRequired?: boolean | undefined;
  /** Adds a quiet "optional" beside the label — the friendlier half of the same choice. */
  isOptional?: boolean | undefined;
  /** The `id` of the control being labelled. Without it the label renders as plain text. */
  htmlFor?: string | undefined;
  /** The control this field wraps — a `SlotPicker`, a radio group, any bare widget. */
  children?: ReactNode | undefined;
}

/**
 * Label, control and one line of hint-or-status. Wrap it around any control that does not carry
 * its own label; `Input` and `Select` already include theirs, so do not double-wrap those.
 */
export function Field({
  label,
  hint,
  status = "default",
  message,
  isRequired = false,
  isOptional = false,
  htmlFor,
  layout = "stack",
  children,
  className,
  ...props
}: FieldProps) {
  // A two-column layout with nothing in the first column is just a narrow control, so `side`
  // collapses back to `stack` when there is no label to put there.
  const slots = field({
    layout: layout === "side" && label !== undefined ? "side" : "stack",
    isDisabled: status === "disabled",
  });
  const messageId = htmlFor === undefined ? undefined : `${htmlFor}-description`;
  const labelBody = (
    <>
      <span className={slots.labelText()}>{label}</span>
      {isRequired ? (
        <span aria-hidden="true" className={slots.marker()}>
          *
        </span>
      ) : null}
      {isOptional ? <span className={slots.optional()}>optional</span> : null}
    </>
  );

  return (
    <div className={slots.root({ class: className })} {...props}>
      {label === undefined ? null : htmlFor === undefined ? (
        <span className={slots.label()}>{labelBody}</span>
      ) : (
        <label className={slots.label()} htmlFor={htmlFor}>
          {labelBody}
        </label>
      )}
      <div className={slots.control()}>
        {children}
        <FieldMessage hint={hint} id={messageId} message={message} status={status} />
      </div>
    </div>
  );
}
