import type { CSSProperties } from "react";

export interface QuantityStepperProps {
  value?: number;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  onChange?: (value: number) => void;
  style?: CSSProperties;
}
export function QuantityStepper(props: QuantityStepperProps): JSX.Element;
