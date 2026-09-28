import type { ComponentProps } from "react";

import { ChevronDown } from "lucide-react";

import type { FieldStatus } from "../../lib/field-status";
import type { IconComponent } from "../icon/icon";

import { FieldControl } from "../../lib/field-control";

export interface SelectOption {
  value: string;
  label: string;
  isDisabled?: boolean | undefined;
}

export interface SelectProps extends Omit<ComponentProps<"select">, "size" | "children"> {
  options: SelectOption[];
  /** A disabled first option, shown until something is chosen. */
  placeholder?: string | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  /** The status glyph replaces the chevron; Field shows the message. */
  status?: FieldStatus | undefined;
  icon?: IconComponent | undefined;
  /**
   * Locked but readable: sunken fill and a lock. A native select cannot be read-only, so it is
   * rendered disabled for the visual, with a hidden input carrying `name` and the value, so a
   * native form post still submits it. The value is caller-owned: react-hook-form skips a
   * disabled field, so an RHF form takes a read-only value from its own `defaultValues`.
   */
  readOnly?: boolean | undefined;
}

/**
 * The platform `<select>` in Input's field box (spec D7): same heights, radius, status colours and
 * glyphs. For short, known lists — outlet, table size, pickup slot. `className` styles the box;
 * every other prop, `register()` included, lands on the native select.
 */
export function Select({
  options,
  placeholder,
  size = "md",
  status = "default",
  icon,
  readOnly = false,
  disabled,
  name,
  value,
  defaultValue,
  className,
  ...props
}: SelectProps) {
  const initialValue =
    value === undefined && defaultValue === undefined && placeholder !== undefined
      ? ""
      : defaultValue;

  return (
    <FieldControl
      control="select"
      size={size}
      status={status}
      icon={icon}
      isReadOnly={readOnly}
      affordance={ChevronDown}
      className={className}
    >
      {(controlClassName) => (
        <>
          <select
            className={controlClassName}
            value={value}
            defaultValue={initialValue}
            name={name}
            disabled={disabled === true || readOnly}
            aria-invalid={status === "error" ? true : undefined}
            {...props}
          >
            {placeholder === undefined ? null : (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.isDisabled}>
                {option.label}
              </option>
            ))}
          </select>
          {readOnly && disabled !== true && name !== undefined ? (
            <input type="hidden" name={name} value={value ?? initialValue ?? ""} />
          ) : null}
        </>
      )}
    </FieldControl>
  );
}
