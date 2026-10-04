import type { CSSProperties } from "react";

export interface DatePickerProps {
  label?: string;
  hint?: string;
  error?: boolean | string;
  success?: boolean | string;
  warning?: boolean | string;
  status?: "default" | "error" | "success" | "warning";
  /** ISO date, "2026-10-10". */
  value?: string;
  defaultValue?: string;
  onChange?: (iso: string) => void;
  /** Earliest pickable ISO date. */
  min?: string;
  max?: string;
  /** Block specific days, e.g. a weekly off. */
  isDateDisabled?: (iso: string) => boolean;
  placeholder?: string;
  /** 0 = Sunday, 1 = Monday (default). */
  weekStart?: 0 | 1;
  /** Formats the trigger text. Default "Sat, 10 Oct 2026". */
  format?: (iso: string) => string;
  icon?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  optional?: boolean;
  name?: string;
  sheet?: "auto" | boolean;
  /** Render just the calendar card in flow. */
  inline?: boolean;
  defaultOpen?: boolean;
  style?: CSSProperties;
}
export function DatePicker(props: DatePickerProps): JSX.Element;
