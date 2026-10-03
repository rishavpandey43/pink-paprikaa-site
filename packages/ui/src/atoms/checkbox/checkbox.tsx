import type { ComponentProps, ReactNode } from "react";

import { Check } from "lucide-react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import type { SxProp } from "../../lib/common-props";

import { ChoiceControl } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { Icon } from "../icon/icon";

/** 22px, 6px radius, 2px border; checked is pink with a white 14px tick. */
const box = componentVariants({
  base: [
    "grid size-choice-box place-items-center rounded-sm border-2 border-border-default bg-ink-000 text-transparent transition-control",
    "group-has-checked/choice:border-pink-500 group-has-checked/choice:bg-pink-500 group-has-checked/choice:text-ink-000",
    "group-has-focus-visible/choice:outline-2 group-has-focus-visible/choice:outline-offset-2 group-has-focus-visible/choice:outline-focus",
    "group-has-disabled/choice:border-ink-200 group-has-disabled/choice:bg-ink-200 group-has-checked/choice:group-has-disabled/choice:text-ink-400",
    "group-has-aria-invalid/choice:border-status-danger",
  ],
});

export interface CheckboxProps extends Omit<ComponentProps<"input">, "type" | "size">, SxProp {
  label: ReactNode;
  /** Secondary line under the label, announced as the description. */
  description?: ReactNode;
  /** Add-on price in whole rupees; renders as "+₹60". */
  price?: number | undefined;
  /** Paints the box as an error and sets `aria-invalid`. Field shows what to do next. */
  isInvalid?: boolean | undefined;
}

/** Multi-select choice — menu add-ons, dietary preferences, consent. */
export function Checkbox({ price, ...props }: CheckboxProps) {
  return (
    <ChoiceControl
      type="checkbox"
      control={
        <span className={box()}>
          <Icon icon={Check} size="xs" />
        </span>
      }
      price={price === undefined ? undefined : `+${formatRupees(price)}`}
      {...props}
    />
  );
}
