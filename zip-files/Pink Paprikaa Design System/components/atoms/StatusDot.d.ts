import type { CSSProperties } from "react";

export interface StatusDotProps {
  tone?: "open" | "busy" | "closed" | "live" | "danger";
  label?: string;
  /** Adds the expanding pulse — live orders only. */
  pulse?: boolean;
  size?: number;
  /** Assets folder holding symbol-white.svg. */
  base?: string;
  style?: CSSProperties;
}
export function StatusDot(props: StatusDotProps): JSX.Element;
