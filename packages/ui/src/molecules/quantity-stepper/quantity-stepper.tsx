"use client";

import type { ComponentPropsWithoutRef } from "react";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const quantityStepper = componentVariants({
  slots: {
    root: "inline-flex shrink-0 items-center rounded-6 border border-border-brand-soft bg-brand-tint",
    button: [
      "grid shrink-0 place-items-center rounded-6 border-0 bg-transparent p-0 text-text-brand",
      "transition-[background-color,color,transform] duration-(--duration-fast) ease-out",
      "not-disabled:hover:bg-brand-soft",
      "not-disabled:active:scale-(--motion-press-scale) not-disabled:active:duration-(--duration-instant)",
      // Disabled is a real grey glyph, never a reduced opacity (state contract).
      "disabled:cursor-not-allowed disabled:text-(--button-fg-disabled)",
    ],
    count: "text-center font-display font-bold text-text-heading tabular-nums",
  },
  variants: {
    /**
     * 36 / 44px — the same fixed heights `Button` uses for `sm` and `md`. `md` is the default
     * because it clears the 44px hit-target floor; reach for `sm` only in a dense desktop row.
     */
    size: {
      sm: { button: "size-(--button-h-sm)", count: "min-w-6 text-body2" },
      md: { button: "size-(--button-h-md)", count: "min-w-7 text-body1" },
    },
  },
  defaultVariants: { size: "md" },
});

/** The glyph size each stepper size pairs with — 16px in sm, 20px in md. */
const ICON_SIZE = { sm: "sm", md: "md" } as const;

export interface QuantityStepperProps
  extends
    Omit<ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange">,
    VariantProps<typeof quantityStepper> {
  /** The current count. Pass it with `onChange` to drive the stepper from cart state. */
  value?: number | undefined;
  /** The count to start from when the stepper keeps its own state. */
  defaultValue?: number | undefined;
  /** `0` where reaching zero removes the line item, `1` where it must not. */
  min?: number | undefined;
  /** The per-order cap for this dish. Both buttons stop at their end of the range. */
  max?: number | undefined;
  /** Called with the new count whenever either button lands inside the range. */
  onChange?: ((value: number) => void) | undefined;
  /** Accessible name for the group. Name the dish where you can: "Paneer Tikka quantity". */
  label?: string | undefined;
  /** Accessible name for the minus button. */
  decrementLabel?: string | undefined;
  /** Accessible name for the plus button. */
  incrementLabel?: string | undefined;
}

/**
 * The minus/plus count used in cart rows, on item detail and beside add-ons. A pill on the brand
 * tint with a hairline border; the count itself is Poppins Bold so it reads at a glance.
 */
export function QuantityStepper({
  className,
  size = "md",
  value,
  defaultValue = 1,
  min = 0,
  max = 20,
  onChange,
  label = "Quantity",
  decrementLabel = "Remove One",
  incrementLabel = "Add One",
  ...props
}: QuantityStepperProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const current = value ?? internalValue;
  const slots = quantityStepper({ size });
  const iconSize = ICON_SIZE[size];

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, current + delta));
    if (next === current) {
      return;
    }
    if (value === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  return (
    <div aria-label={label} className={slots.root({ class: className })} role="group" {...props}>
      <button
        aria-label={decrementLabel}
        className={slots.button()}
        disabled={current <= min}
        onClick={() => {
          step(-1);
        }}
        type="button"
      >
        <Icon icon={Minus} size={iconSize} />
      </button>
      <span aria-live="polite" className={slots.count()}>
        {current}
      </span>
      <button
        aria-label={incrementLabel}
        className={slots.button()}
        disabled={current >= max}
        onClick={() => {
          step(1);
        }}
        type="button"
      >
        <Icon icon={Plus} size={iconSize} />
      </button>
    </div>
  );
}
