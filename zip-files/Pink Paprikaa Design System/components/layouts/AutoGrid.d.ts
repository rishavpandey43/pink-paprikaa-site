import type { CSSProperties, ReactNode } from "react";

export interface AutoGridProps {
  children?: ReactNode;
  /** Minimum track width in px before a column drops. 240 cards, 320 panels. */
  min?: number;
  /** Fixed column count instead of auto-fit. Always minmax(0,1fr). */
  columns?: number;
  /** Gap override; defaults to --gap-grid. */
  space?: string;
  as?: string;
  style?: CSSProperties;
}
export function AutoGrid(props: AutoGridProps): JSX.Element;
