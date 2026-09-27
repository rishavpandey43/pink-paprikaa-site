import type { CSSProperties, ChangeEventHandler } from "react";

export interface SwitchProps {
  label?: string;
  description?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  style?: CSSProperties;
}
export function Switch(props: SwitchProps): JSX.Element;
