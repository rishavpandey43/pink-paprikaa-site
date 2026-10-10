import type { CSSProperties } from "react";

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
  /** Uncontrolled start value. Without a placeholder, defaults to the first option. */
  defaultValue?: string;
  /** Name for a hidden form input. */
  name?: string;
  /** Shown in the trigger when nothing is chosen. */
  placeholder?: string;
  /** Leading Lucide icon name. */
  icon?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  optional?: boolean;
  /** Event-shaped for drop-in compatibility: e.target.value. */
  onChange?: (e: { target: { value: string; name?: string }; value: string }) => void;
  onValueChange?: (value: string) => void;
  /** Path to /assets for the selected-row mark. */
  base?: string;
  /** "auto" = bottom sheet at 640px and below. */
  sheet?: "auto" | boolean;
  /** Docs/specimens only. */
  defaultOpen?: boolean;
  style?: CSSProperties;
}
export function Select(props: SelectProps): JSX.Element;
