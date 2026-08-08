"use client";

import { Switch as SwitchPrimitive } from "radix-ui";
import { useId } from "react";

import { componentVariants } from "../../lib/component-variants";

const switchControl = componentVariants({
  slots: {
    // Label left, control right, so a column of switches lines its knobs up on one edge.
    root: "flex w-full items-center justify-between gap-3.5",
    label: "flex min-w-0 flex-col gap-0-5",
    labelText: "min-w-0 font-body font-medium text-body1 text-text-body",
    description: "font-body text-body2 text-text-muted",
    // 46 x 28 track, 22px knob, 3px inset — the 220ms slide is the system's base duration.
    track: [
      "flex h-7 w-11.5 shrink-0 items-center rounded-6 p-0.75 bg-ink-300",
      "transition-colors duration-(--duration-base) ease-out",
      "data-[state=checked]:bg-brand-primary",
    ],
    thumb: [
      "size-5.5 rounded-6 bg-surface-card shadow-elevation1",
      "transition-transform duration-(--duration-base) ease-out",
      "data-[state=checked]:translate-x-4.5",
    ],
  },
  variants: {
    /** A real grey track, never a faded one — the state contract forbids `opacity-*` here. */
    isDisabled: {
      true: {
        root: "cursor-not-allowed",
        track: "bg-border-subtle data-[state=checked]:bg-border-subtle",
        thumb: "shadow-none",
        labelText: "text-text-subtle",
        description: "text-text-subtle",
      },
      false: { root: "cursor-pointer" },
    },
  },
  defaultVariants: { isDisabled: false },
});

export interface SwitchProps extends Omit<SwitchPrimitive.SwitchProps, "children"> {
  /** What the toggle controls, in sentence case. */
  label?: string | undefined;
  /** A second line under the label saying what turning it on actually does. */
  description?: string | undefined;
}

export function Switch({
  label,
  description,
  disabled = false,
  className,
  id,
  ...props
}: SwitchProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const labelId = `${controlId}-label`;
  const descriptionId = `${controlId}-description`;
  const slots = switchControl({ isDisabled: disabled });

  return (
    <div className={slots.root({ class: className })}>
      <label className={slots.label()} htmlFor={controlId}>
        <span className={slots.labelText()} id={labelId}>
          {label}
        </span>
        {description ? (
          <span className={slots.description()} id={descriptionId}>
            {description}
          </span>
        ) : null}
      </label>
      <SwitchPrimitive.Root
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={labelId}
        className={slots.track()}
        disabled={disabled}
        id={controlId}
        {...props}
      >
        <SwitchPrimitive.Thumb className={slots.thumb()} />
      </SwitchPrimitive.Root>
    </div>
  );
}
