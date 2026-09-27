import type { CSSProperties } from "react";

export interface SpinnerProps {
  size?: number;
  tone?: "brand" | "ink" | "inverse";
  /** Assets folder holding the symbol files. */
  base?: string;
  /** Accessible status label. */
  label?: string;
  style?: CSSProperties;
}
export function Spinner(props: SpinnerProps): JSX.Element;
