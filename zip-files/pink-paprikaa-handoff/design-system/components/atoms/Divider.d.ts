import type { CSSProperties } from "react";

export interface DividerProps {
  variant?: "line" | "diamond";
  /** Centres an uppercase overline label in the rule. */
  label?: string;
  on?: "light" | "brand";
  /** Assets folder holding the symbol files (diamond variant only). */
  base?: string;
  style?: CSSProperties;
}
export function Divider(props: DividerProps): JSX.Element;
