"use client";

import type { KeyboardEvent, Ref } from "react";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { useControllableState } from "../../lib/use-controllable-state";

const quantityStepper = componentVariants({
  slots: {
    root: "inline-flex items-center rounded-pill border border-border-brand-soft bg-surface-page-alt",
    button:
      "grid shrink-0 place-items-center rounded-pill text-text-brand transition-control not-disabled:hover:bg-surface-brand-soft not-disabled:active:press-scale disabled:cursor-not-allowed disabled:text-ink-400",
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

export interface QuantityStepperProps {
  /** Accessible name of the stepper and its number field, e.g. "Guests". */
  label: string;
  value?: number | undefined;
  defaultValue?: number | undefined;
  onValueChange?: ((value: number) => void) | undefined;
  onBlur?: (() => void) | undefined;
  /** Lowest value (default 0 — reaching it removes a cart line; use 1 where it should not). */
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
  className?: string | undefined;
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
  className,
  ref,
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
      role="group"
      aria-label={label}
      data-surface="light"
      className={styles.root({ className })}
    >
      <button
        type="button"
        aria-label={orDefault(decrementLabel, `Remove ${stepName}`)}
        disabled={disabled || quantity <= min}
        onClick={() => {
          stepBy(-step);
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
        aria-label={label}
        aria-valuenow={quantity}
        aria-valuemin={min}
        aria-valuemax={max}
        name={name}
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
        disabled={disabled || (max !== undefined && quantity >= max)}
        onClick={() => {
          stepBy(step);
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
