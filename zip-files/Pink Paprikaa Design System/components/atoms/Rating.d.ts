import type { CSSProperties } from "react";

export interface RatingProps {
  /** Supports halves, e.g. 4.5. */
  value?: number;
  max?: number;
  /** Review count, shown in brackets with Indian digit grouping. */
  count?: number;
  /** Rendered diamond size in px. Default 16; below 16 the mark opacity steps up. */
  size?: number;
  /** Use the brand symbol mark instead of plain diamonds. */
  symbol?: boolean;
  /** Assets folder, only used when symbol is set. */
  base?: string;
  /** Hide the numeric value. */
  showValue?: boolean;
  style?: CSSProperties;
}
export function Rating(props: RatingProps): JSX.Element;
