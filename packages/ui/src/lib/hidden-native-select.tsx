import type { ChangeEventHandler, Ref } from "react";

/**
 * Invisible native `<select>` driven by our listbox (lint allows `<select>` only in `lib/`).
 * Setting `.value` and dispatching a bubbling `change` keeps `{...register("x")}` working.
 */
export function HiddenNativeSelect({
  name,
  value,
  options,
  disabled,
  onChange,
  onBlur,
  selectRef,
}: {
  name?: string | undefined;
  value: string;
  options: { value: string; label: string; isDisabled?: boolean | undefined }[];
  disabled?: boolean | undefined;
  onChange?: ChangeEventHandler<HTMLSelectElement> | undefined;
  onBlur?: ChangeEventHandler<HTMLSelectElement> | undefined;
  selectRef?: Ref<HTMLSelectElement> | undefined;
}) {
  return (
    <select
      ref={selectRef}
      name={name}
      value={value}
      disabled={disabled}
      aria-hidden
      tabIndex={-1}
      className="sr-only"
      onChange={onChange ?? (() => undefined)}
      onBlur={onBlur}
    >
      <option value="" />
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.isDisabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Set the hidden select's value and fire a bubbling change for RHF / native forms. */
export function commitNativeSelectValue(
  select: HTMLSelectElement | null,
  next: string,
  onChange?: ChangeEventHandler<HTMLSelectElement>
) {
  if (select === null) return;
  select.value = next;
  const event = new Event("change", { bubbles: true });
  select.dispatchEvent(event);
  onChange?.({
    target: select,
    currentTarget: select,
  } as Parameters<ChangeEventHandler<HTMLSelectElement>>[0]);
}
