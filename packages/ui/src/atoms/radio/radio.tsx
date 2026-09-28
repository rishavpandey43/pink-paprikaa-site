import { type ComponentProps, type ReactNode, useId } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { ChoiceControl, joinIds } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { FIELD_STATUS_ICON, type FieldStatus } from "../../lib/field-status";
import { Icon } from "../icon/icon";

/** 22px circle; checked is a 6px pink ring around a white centre — never a filled dot. */
const ring = componentVariants({
  base: [
    "size-choice-box rounded-pill border-2 border-border-default bg-ink-000 transition-all duration-fast ease-out",
    "group-has-checked/choice:border-6 group-has-checked/choice:border-pink-500",
    "group-has-focus-visible/choice:outline-2 group-has-focus-visible/choice:outline-offset-2 group-has-focus-visible/choice:outline-focus",
    "group-has-disabled/choice:border-ink-200 group-has-disabled/choice:bg-ink-200 group-has-checked/choice:group-has-disabled/choice:border-ink-400",
    "group-has-aria-invalid/choice:border-status-danger in-aria-invalid:border-status-danger",
  ],
});

const radioGroup = componentVariants({
  slots: {
    root: "min-w-0",
    legend: "mb-3 font-body text-body-sm font-medium text-text-body",
    options: "flex gap-3",
    message: "mt-2 mb-0 flex max-w-none items-center gap-1.5 font-body text-caption",
  },
  variants: {
    orientation: {
      vertical: { options: "flex-col" },
      horizontal: { options: "flex-row flex-wrap gap-x-6" },
    },
    status: {
      default: { message: "text-text-subtle" },
      error: { message: "text-text-danger" },
      success: { message: "text-text-success" },
      warning: { message: "text-text-warning" },
    },
    isLegendHidden: { true: { legend: "sr-only" } },
  },
  defaultVariants: { orientation: "vertical", status: "default", isLegendHidden: false },
});

export interface RadioProps extends Omit<ComponentProps<"input">, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
  /** Absolute price of this option in whole rupees; renders as "₹280". */
  price?: number | undefined;
  isInvalid?: boolean | undefined;
}

/** Exactly-one choice — portion size, spice level, payment method. Give a group one shared `name`. */
export function Radio({ price, ...props }: RadioProps) {
  return (
    <ChoiceControl
      type="radio"
      control={<span className={ring()} />}
      price={price === undefined ? undefined : formatRupees(price)}
      {...props}
    />
  );
}

export interface RadioGroupProps extends ComponentProps<"fieldset"> {
  legend: ReactNode;
  isLegendHidden?: boolean | undefined;
  orientation?: "vertical" | "horizontal" | undefined;
  /** `error` marks the group invalid and turns every ring red. */
  status?: FieldStatus | undefined;
  /** Shown under the options with the status glyph, and read as the group's description. */
  message?: ReactNode;
}

/** A `<fieldset>` + `<legend>` around Radios, exposed as a radiogroup. */
export function RadioGroup({
  legend,
  isLegendHidden = false,
  orientation = "vertical",
  status = "default",
  message,
  className,
  children,
  "aria-describedby": describedBy,
  ...props
}: RadioGroupProps) {
  const messageId = useId();
  const styles = radioGroup({ orientation, status, isLegendHidden });
  const statusIcon = status === "default" ? undefined : FIELD_STATUS_ICON[status];

  return (
    <fieldset
      role="radiogroup"
      aria-invalid={status === "error" ? true : undefined}
      aria-describedby={joinIds(message === undefined ? undefined : messageId, describedBy)}
      className={styles.root({ className })}
      {...props}
    >
      <legend className={styles.legend()}>{legend}</legend>
      <div className={styles.options()}>{children}</div>
      {message === undefined ? null : (
        <p id={messageId} className={styles.message()}>
          {statusIcon === undefined ? null : <Icon icon={statusIcon} size="xs" />}
          {message}
        </p>
      )}
    </fieldset>
  );
}
