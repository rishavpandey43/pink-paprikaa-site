"use client";

import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { useId } from "react";

import { componentVariants, type VariantProps } from "../../lib/component-variants";

const radioGroup = componentVariants({
  base: "flex",
  variants: {
    orientation: { vertical: "flex-col gap-3", horizontal: "flex-row flex-wrap gap-x-6 gap-y-3" },
  },
  defaultVariants: { orientation: "vertical" },
});

const radio = componentVariants({
  slots: {
    root: "flex items-start gap-3",
    /**
     * The checked mark is a 6px pink ring, never a filled disc: a 22px circle flooded pink with a
     * 10px card-coloured dot in the middle leaves exactly that ring, and needs no border width
     * outside the scale to draw it.
     */
    control: [
      "mt-px grid size-5.5 shrink-0 place-items-center rounded-6 border-2",
      "border-(--field-border-default) bg-(--field-bg-default)",
      "transition-[background-color,border-color] duration-(--duration-fast) ease-out",
      "data-[state=checked]:border-brand-primary data-[state=checked]:bg-brand-primary",
    ],
    indicator: "size-2.5 rounded-6 bg-surface-card",
    label: "flex min-w-0 flex-1 flex-col gap-0-5",
    labelRow: "flex min-w-0 items-baseline justify-between gap-3",
    labelText: "min-w-0 font-body font-medium text-body1 text-text-body",
    price: "shrink-0 font-display font-bold text-body2 text-text-heading",
    description: "font-body text-body2 text-text-muted",
  },
  variants: {
    /** Marks the option invalid — set it on every option when the whole group is unanswered. */
    hasError: { true: { control: "border-status-danger" }, false: {} },
    isDisabled: {
      true: {
        root: "cursor-not-allowed",
        control: "border-border-subtle bg-(--field-bg-disabled)",
        indicator: "bg-(--field-fg-disabled)",
        labelText: "text-text-subtle",
        price: "text-text-subtle",
        description: "text-text-subtle",
      },
      false: { root: "cursor-pointer" },
    },
  },
  defaultVariants: { hasError: false, isDisabled: false },
});

export interface RadioGroupProps
  extends
    Omit<RadioGroupPrimitive.RadioGroupProps, "orientation">,
    VariantProps<typeof radioGroup> {}

/**
 * The wrapper every `Radio` must sit inside — it owns the shared name, the chosen value and the
 * arrow-key roving focus that makes a radio group usable from the keyboard.
 */
export function RadioGroup({ className, orientation, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      className={radioGroup({ orientation, className })}
      orientation={orientation ?? "vertical"}
      {...props}
    />
  );
}

type RadioVariants = Omit<VariantProps<typeof radio>, "isDisabled">;

export interface RadioProps
  extends Omit<RadioGroupPrimitive.RadioGroupItemProps, "children">, RadioVariants {
  /** The option itself, in sentence case. */
  label?: string | undefined;
  /** A second line under the label — what the portion feeds, or when it is available. */
  description?: string | undefined;
  /** The absolute price of this option in whole rupees. Renders right-aligned as `₹280`. */
  price?: number | undefined;
}

export function Radio({
  label,
  description,
  price,
  hasError = false,
  disabled = false,
  className,
  id,
  ...props
}: RadioProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const labelId = `${controlId}-label`;
  const descriptionId = `${controlId}-description`;
  const slots = radio({ hasError, isDisabled: disabled });

  return (
    <div className={slots.root({ class: className })}>
      <RadioGroupPrimitive.Item
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={labelId}
        className={slots.control()}
        disabled={disabled}
        id={controlId}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className={slots.indicator()} />
      </RadioGroupPrimitive.Item>
      <label className={slots.label()} htmlFor={controlId}>
        <span className={slots.labelRow()} id={labelId}>
          <span className={slots.labelText()}>{label}</span>
          {price === undefined ? null : <span className={slots.price()}>₹{price}</span>}
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
