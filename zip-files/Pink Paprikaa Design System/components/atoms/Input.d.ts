import type { CSSProperties, ChangeEventHandler, ReactNode } from "react";

/**
 * The system's text field, with the full status set.
 */
export interface InputProps {
  label?: string;
  /** Helper text, shown when there is no status message. */
  hint?: string;
  /** true, or the message to show. Turns the field red. */
  error?: boolean | string;
  /** true, or the message to show. Turns the field mint. */
  success?: boolean | string;
  /** true, or the message to show. Turns the field turmeric. */
  warning?: boolean | string;
  /** Set the status without a message. */
  status?: "default" | "error" | "success" | "warning";
  /** Leading Lucide icon name. */
  icon?: string;
  /** Trailing static text, e.g. a unit or count. */
  suffix?: string;
  /** Trailing element, e.g. a small Button. */
  trailing?: ReactNode;
  multiline?: boolean;
  rows?: number;
  size?: "sm" | "md" | "lg";
  /** Text-like types only. "number" becomes a text field with a decimal keypad; date/time/color/file/range are refused — use DatePicker / SlotPicker. */
  type?: "text" | "email" | "tel" | "password" | "url" | "search" | "number";
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Locked but readable - sunken fill and a lock glyph. */
  readOnly?: boolean;
  /** Trailing spinner while validating. */
  loading?: boolean;
  required?: boolean;
  /** Marks the field optional instead of starring the required ones. */
  optional?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  style?: CSSProperties;
}
export function Input(props: InputProps): JSX.Element;
