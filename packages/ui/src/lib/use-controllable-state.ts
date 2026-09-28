import { useState } from "react";

export interface ControllableStateOptions<T> {
  /** The caller's value. Defined = controlled: the caller owns it and the setter only reports. */
  value: T | undefined;
  /** The starting value when uncontrolled. */
  defaultValue: T;
  /** Called with every new value, controlled or not — never for a set to the current value. */
  onChange?: ((value: T) => void) | undefined;
}

/**
 * One value, controlled or uncontrolled — the Radix convention every value-based molecule follows
 * (`value` / `defaultValue` / `onValueChange`, spec §8.1). The rule it owns: a controlled value is
 * never copied into local state, an uncontrolled one is, and the change is reported synchronously,
 * once, only when the value actually changes.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: ControllableStateOptions<T>): readonly [T, (next: T) => void] {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolled;

  function setValue(next: T): void {
    if (Object.is(next, current)) return;
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  }

  return [current, setValue] as const;
}
