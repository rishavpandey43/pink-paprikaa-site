import type { CSSProperties, ChangeEventHandler } from "react";

export interface RadioProps {
  label?: string;
  description?: string;
  /** Absolute price for this option in whole rupees. */
  price?: number;
  name?: string;
  value?: string;
  checked?: boolean;
  disabled?: boolean;
  /** Marks the whole group invalid. */
  error?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  style?: CSSProperties;
}
export function Radio(props: RadioProps): JSX.Element;
