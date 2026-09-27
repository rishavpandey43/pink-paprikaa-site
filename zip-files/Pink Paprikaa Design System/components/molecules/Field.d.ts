import type { CSSProperties, ReactNode } from "react";

export interface FieldProps {
  label?: string;
  /** Helper text. Hidden while an error is showing. */
  hint?: string;
  /** Error message - replaces the hint and adds the alert glyph. */
  error?: string;
  /** Success message - mint, with a check glyph. */
  success?: string;
  /** Warning message - turmeric, with an alert glyph. */
  warning?: string;
  required?: boolean;
  /** Marks the field optional instead - prefer this to starring everything. */
  optional?: boolean;
  htmlFor?: string;
  /** "stack" (label above) or "side" (160px label column). */
  layout?: "stack" | "side";
  children?: ReactNode;
  style?: CSSProperties;
}
export function Field(props: FieldProps): JSX.Element;
