import type { CSSProperties, ChangeEventHandler } from "react";

export interface SelectOption { value: string; label: string; disabled?: boolean }

export interface SelectProps {
  label?: string;
  hint?: string;
  /** true, or the message to show. */
  error?: boolean | string;
  success?: boolean | string;
  warning?: boolean | string;
  status?: "default" | "error" | "success" | "warning";
  /** Strings, or {value,label} pairs. */
  options?: (string | SelectOption)[];
  value?: string;
  /** Disabled first option shown when nothing is chosen. */
  placeholder?: string;
  /** Leading Lucide icon name. */
  icon?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  optional?: boolean;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  style?: CSSProperties;
}
export function Select(props: SelectProps): JSX.Element;
