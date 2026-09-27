import type { CSSProperties, ReactNode } from "react";

export interface TooltipProps {
  /** Short hint, no full stop. */
  label: string;
  children?: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  style?: CSSProperties;
}
export function Tooltip(props: TooltipProps): JSX.Element;
