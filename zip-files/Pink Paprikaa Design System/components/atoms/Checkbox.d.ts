import type { CSSProperties, ChangeEventHandler } from "react";

export interface CheckboxProps {
  label?: string;
  /** Secondary line under the label. */
  description?: string;
  /** Add-on price in whole rupees; renders as "+₹60". */
  price?: number;
  checked?: boolean;
  disabled?: boolean;
  /** true, or the message to show. Turns the box red. */
  error?: boolean | string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  style?: CSSProperties;
}
export function Checkbox(props: CheckboxProps): JSX.Element;
