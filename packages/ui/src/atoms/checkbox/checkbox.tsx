"use client";

import { Check, Minus } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { useId } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { Icon } from "../icon/icon";

const checkbox = componentVariants({
  slots: {
    root: "flex items-start gap-3",
    box: [
      "group mt-px grid size-5.5 shrink-0 place-items-center rounded-2 border-2",
      "border-(--field-border-default) bg-(--field-bg-default) text-text-on-brand",
      "transition-[background-color,border-color] duration-(--duration-fast) ease-out",
      "data-[state=checked]:border-brand-primary data-[state=checked]:bg-brand-primary",
      "data-[state=indeterminate]:border-brand-primary data-[state=indeterminate]:bg-brand-primary",
    ],
    label: "flex min-w-0 flex-1 flex-col gap-0-5",
    labelRow: "flex min-w-0 items-baseline justify-between gap-3",
    labelText: "min-w-0 font-body font-medium text-body1 text-text-body",
    price: "shrink-0 font-display font-bold text-body2 text-text-heading",
    description: "font-body text-body2 text-text-muted",
  },
  variants: {
    /** Marks the box invalid. The sentence explaining why belongs to the `Field` molecule. */
    hasError: { true: { box: "border-status-danger" }, false: {} },
    /**
     * A real grey fill and a muted label, never a reduced opacity — the reference prototype faded
     * the whole row to 50%, which drops the label below the contrast floor.
     */
    isDisabled: {
      true: {
        root: "cursor-not-allowed",
        box: "border-border-subtle bg-(--field-bg-disabled) text-(--field-fg-disabled)",
        labelText: "text-text-subtle",
        price: "text-text-subtle",
        description: "text-text-subtle",
      },
      false: { root: "cursor-pointer" },
    },
  },
  defaultVariants: { hasError: false, isDisabled: false },
});

type CheckboxVariants = Omit<VariantProps<typeof checkbox>, "isDisabled">;

export interface CheckboxProps
  extends Omit<CheckboxPrimitive.CheckboxProps, "children">, CheckboxVariants {
  /** The choice itself, in sentence case. */
  label?: string | undefined;
  /** A second line under the label — what the add-on includes, or why it is unavailable. */
  description?: string | undefined;
  /** Add-on price in whole rupees. Renders right-aligned as `+₹40`. */
  price?: number | undefined;
}

export function Checkbox({
  label,
  description,
  price,
  hasError = false,
  disabled = false,
  className,
  id,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const labelId = `${controlId}-label`;
  const descriptionId = `${controlId}-description`;
  const slots = checkbox({ hasError, isDisabled: disabled });

  return (
    <div className={slots.root({ class: className })}>
      <CheckboxPrimitive.Root
        aria-describedby={description ? descriptionId : undefined}
        aria-invalid={hasError || undefined}
        aria-labelledby={labelId}
        className={slots.box()}
        disabled={disabled}
        id={controlId}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="grid place-items-center">
          <Icon className="group-data-[state=indeterminate]:hidden" icon={Check} size="xs" />
          <Icon className="hidden group-data-[state=indeterminate]:block" icon={Minus} size="xs" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <label className={slots.label()} htmlFor={controlId}>
        <span className={slots.labelRow()} id={labelId}>
          <span className={slots.labelText()}>{label}</span>
          {price === undefined ? null : <span className={slots.price()}>+₹{price}</span>}
        </span>
        {description ? (
          <span className={slots.description()} id={descriptionId}>
            {description}
          </span>
        ) : null}
      </label>
    </div>
  );
}
