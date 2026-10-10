import { Check } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { ChoiceControl } from "../../lib/choice-control";
import type { SxProp } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import type { DesignFieldChrome } from "../../lib/design-field";
import { hasDesignFieldChrome, withDesignField } from "../../lib/design-field";
import { Icon } from "../icon/icon";

/** 22px, 6px radius, 2px border; checked is pink with a white 14px tick. */
const box = componentVariants({
  base: [
    "grid size-choice-box place-items-center rounded-sm border-2 border-border-default bg-ink-000 text-transparent transition-control",
    "group-hover/choice:border-pink-400 group-hover/choice:bg-state-hover",
    "group-data-[pressed]/choice:press-scale-icon group-data-[pressed]/choice:border-pink-400 group-data-[pressed]/choice:bg-state-press",
    "group-active/choice:press-scale-icon",
    "group-has-checked/choice:border-pink-500 group-has-checked/choice:bg-pink-500 group-has-checked/choice:text-ink-000",
    "group-has-checked/choice:group-hover/choice:border-brand-hover group-has-checked/choice:group-hover/choice:bg-brand-hover",
    "group-has-checked/choice:group-data-[pressed]/choice:border-brand-active group-has-checked/choice:group-data-[pressed]/choice:bg-brand-active",
    "group-has-focus-visible/choice:outline-2 group-has-focus-visible/choice:outline-offset-2 group-has-focus-visible/choice:outline-focus",
    "group-has-aria-invalid/choice:border-status-danger",
  ],
});

export interface CheckboxProps
  extends Omit<ComponentProps<"input">, "type" | "size">, SxProp, DesignFieldChrome {
  label: ReactNode;
  /** Secondary line under the label, announced as the description. */
  description?: ReactNode;
  /** Add-on price in whole rupees; renders as "+₹60". */
  price?: number | undefined;
  /** Paints the box as an error and sets `aria-invalid`. Field shows what to do next. */
  isInvalid?: boolean | undefined;
}

/** Multi-select choice — menu add-ons, dietary preferences, consent. */
export function Checkbox({
  price,
  hint,
  error,
  success,
  warning,
  optional,
  id,
  isInvalid,
  ...props
}: CheckboxProps) {
  const chrome = { label: props.label, hint, error, success, warning, optional };
  const shouldWrap = hasDesignFieldChrome(chrome, { ignoreLabel: true });
  return withDesignField(
    chrome,
    id,
    isInvalid === true || (error !== undefined && error !== false) ? "error" : "default",
    (wired) => (
      <ChoiceControl
        type="checkbox"
        control={
          <span className={box()}>
            <Icon icon={Check} size="xs" />
          </span>
        }
        price={price === undefined ? undefined : `+${formatRupees(price)}`}
        id={wired.id === "" ? id : wired.id}
        isInvalid={wired.status === "error" || isInvalid}
        isLabelHidden={shouldWrap}
        {...props}
        label={shouldWrap ? "" : props.label}
      />
    ),
    { ignoreLabel: true }
  );
}
