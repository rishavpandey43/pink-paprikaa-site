"use client";

import type { KeyboardEvent, Ref } from "react";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import type { BaseProps } from "../../lib/common-props";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";
import { useControllableState } from "../../lib/use-controllable-state";

const quantityStepper = componentVariants({
  slots: {
    root: "inline-flex items-center rounded-pill border border-border-brand-soft bg-surface-page-alt",
    button:
      "grid shrink-0 place-items-center rounded-pill text-text-brand transition-control not-disabled:not-aria-disabled:hover:bg-surface-brand-soft not-disabled:not-aria-disabled:active:press-scale disabled:cursor-not-allowed disabled:text-ink-400 aria-disabled:cursor-not-allowed aria-disabled:text-ink-400",
    count:
      "min-w-quantity-stepper-count rounded-xs border-0 bg-transparent p-0 text-center font-display font-bold text-text-heading tabular-nums disabled:text-ink-400",
  },
  variants: {
    size: {
      sm: { button: "size-8", count: "text-body-sm" },
      md: { button: "size-10", count: "text-body" },
    },
  },
  defaultVariants: { size: "md" },
});

/** The group takes the div's native props; the number field keeps `id`, `ref`, `name`, `aria-required`, `disabled`, `onBlur` and the aria it is described by. */
export interface QuantityStepperProps extends Omit<
  BaseProps<"div">,
  | "ref"
  | "id"
  | "onBlur"
  | "defaultValue"
  | "children"
  | "aria-describedby"
  | "aria-invalid"
  | "aria-label"
  | "role"
> {
  /** Accessible name of the stepper and its number field, e.g. "Guests". */
  label: string;
  value?: number | undefined;
  defaultValue?: number | undefined;
  onValueChange?: ((value: number) => void) | undefined;
  onBlur?: (() => void) | undefined;
  /**
   * Lowest value (default 0 — reaching it removes a cart line; use 1 where it should not). The
   * parent owns that removal, so it also owns focus: the stepper unmounts with the line, so move
   * focus to the next line or the cart heading, or it drops to `<body>`.
   */
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  size?: "sm" | "md" | undefined;
  /** Name of the − button (default "Remove one", or "Remove 5" for `step={5}`) — name the dish in a cart. */
  decrementLabel?: string | undefined;
  /** Name of the + button (default "Add one", or "Add 5" for `step={5}`). */
  incrementLabel?: string | undefined;
  name?: string | undefined;
  disabled?: boolean | undefined;
  /** Field's control id — the wrapping `<label htmlFor>` points here. */
  id?: string | undefined;
  "aria-describedby"?: string | undefined;
  "aria-invalid"?: true | undefined;
  required?: true | undefined;
  /** The number field — react-hook-form's Controller focuses it on error. */
  ref?: Ref<HTMLInputElement> | undefined;
}

interface Bounds {
  min: number;
  max: number | undefined;
  step: number;
}

/** Snap to the nearest step counted from `min`, then keep inside `[min, max]`. */
function toAllowed(raw: number, { min, max, step }: Bounds): number {
  const snapped = min + Math.round((raw - min) / step) * step;
  const highest = max === undefined ? snapped : max - ((max - min) % step);
  return Math.max(min, Math.min(snapped, highest));
}

/** A blank label ("" or whitespace) counts as absent (R48), so a button never loses its name. */
function orDefault(label: string | undefined, fallback: string): string {
  return label === undefined || label.trim() === "" ? fallback : label;
}

/** −/+ quantity with typed entry: cart rows, item detail, calculator guest counts. */
export function QuantityStepper({
  label,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  min = 0,
  max,
  step = 1,
  size = "md",
  decrementLabel,
  incrementLabel,
  name,
  disabled = false,
  sx,
  className,
  id,
  "aria-describedby": describedBy,
  "aria-invalid": isInvalid,
  required,
  ref,
  ...props
}: QuantityStepperProps) {
  const bounds: Bounds = { min, max, step };
  const [quantity, setQuantity] = useControllableState({
    value,
    defaultValue: defaultValue ?? min,
    onChange: onValueChange,
  });
  const [draft, setDraft] = useState<string | null>(null);
  // A button press keeps focus on the button, so the new count is announced (dev parity); the
  // spin button speaks for itself once focused, so focusing it clears the region.
  const [hasStepped, setHasStepped] = useState(false);
  const styles = quantityStepper({ size });
  const stepName = step === 1 ? "one" : String(step);
  // The ends of the range are aria-disabled, not disabled: a press that reaches min or max keeps
  // focus on the button (a disabled button drops it to <body>). `disabled` still disables all.
  const isAtMin = quantity <= min;
  const isAtMax = max !== undefined && quantity >= max;

  /** What the field stands for right now: a typed draft that parses, else the value. */
  function settled(): number {
    return draft === null || draft === "" ? quantity : toAllowed(Number(draft), bounds);
  }

  function commit(next: number): void {
    setDraft(null);
    setQuantity(toAllowed(next, bounds));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        commit(settled() + step);
        break;
      case "ArrowDown":
        event.preventDefault();
        commit(settled() - step);
        break;
      case "Home":
        event.preventDefault();
        commit(min);
        break;
      case "End":
        if (max !== undefined) {
          event.preventDefault();
          commit(max);
        }
        break;
      case "Enter":
        // First Enter commits the typed value; the next one is free to submit the form.
        if (draft !== null) {
          event.preventDefault();
          commit(settled());
        }
        break;
      case "Escape":
        setDraft(null);
        break;
      default:
        break;
    }
  }

  function handleBlur(): void {
    if (draft !== null) commit(settled());
    onBlur?.();
  }

  function stepBy(delta: number): void {
    commit(settled() + delta);
    setHasStepped(true);
  }

  return (
    <div
      data-surface="light"
      {...props}
      role="group"
      aria-label={label}
      className={styles.root({ className: withSx(sx, className) })}
    >
      <button
        type="button"
        aria-label={orDefault(decrementLabel, `Remove ${stepName}`)}
        aria-disabled={isAtMin ? true : undefined}
        disabled={disabled}
        onClick={() => {
          if (!isAtMin) stepBy(-step);
        }}
        className={styles.button()}
      >
        <Icon icon={Minus} size={size} />
      </button>
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        role="spinbutton"
        id={id}
        aria-label={label}
        aria-describedby={describedBy}
        aria-invalid={isInvalid}
        aria-valuenow={quantity}
        aria-valuemin={min}
        aria-valuemax={max}
        name={name}
        aria-required={required}
        size={Math.max(2, String(max ?? quantity).length)}
        value={draft ?? String(quantity)}
        disabled={disabled}
        onChange={(event) => {
          setDraft(event.currentTarget.value.replace(/\D/g, ""));
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setHasStepped(false);
        }}
        onBlur={handleBlur}
        className={styles.count()}
      />
      <button
        type="button"
        aria-label={orDefault(incrementLabel, `Add ${stepName}`)}
        aria-disabled={isAtMax ? true : undefined}
        disabled={disabled}
        onClick={() => {
          if (!isAtMax) stepBy(step);
        }}
        className={styles.button()}
      >
        <Icon icon={Plus} size={size} />
      </button>
      <span role="status" className="sr-only">
        {hasStepped ? String(quantity) : null}
      </span>
    </div>
  );
}
